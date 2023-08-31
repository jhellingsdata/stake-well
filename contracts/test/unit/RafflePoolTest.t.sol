// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Test, console} from "../../lib/forge-std/src/Test.sol";
import {stdStorage, StdStorage} from "../../lib/forge-std/src/Test.sol";
import {Vm} from "../../lib/forge-std/src/Vm.sol";
import {StdCheats} from "../../lib/forge-std/src/StdCheats.sol";
import {StdUtils} from "../../lib/forge-std/src/StdUtils.sol";
import {DeployRafflePool} from "../../script/DeployRafflePool.s.sol";
import {CreateSubscription} from "../../script/Interactions.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {VRFCoordinatorV2Mock} from "../mocks/VRFCoordinatorV2Mock.sol";
import {RafflePool} from "../../src/RafflePool.sol";
import {IERC20Permit} from "../../src/interfaces/IERC20Permit.sol";
import {StEthMock} from "../mocks/StEthToken.sol";
import {SigUtils} from "../mocks/utils/SigUtils.sol";

contract RafflePoolTest is StdCheats, Test {
    ///////////////////
    // Events
    ///////////////////
    event MintAndDepositSuccessful(address indexed depositor, uint256 amount, uint256 newBalance);
    event DepositSuccessful(address indexed depositor, uint256 amount, uint256 newBalance);
    event WithdrawSuccessful(address indexed withdrawer, uint256 amount, uint256 newBalance);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event PickedWinner(address indexed winner, uint256 amount);
    event StakingRewardsUpdated(uint256 newRewardsTotal);

    RafflePool rafflePool;
    HelperConfig helperConfig;
    SigUtils sigUtils;

    StEthMock public StEth;
    address steth;
    uint256 interval;
    address vrfCoordinatorV2;
    bytes32 gasLane;
    uint64 subscriptionId;
    uint32 callbackGasLimit;
    uint32 numWords;
    address link;

    uint256 ownerPrivateKey;
    address public PLAYER;
    address public USER1;
    address public USER2;
    address public USER3;
    uint256 public constant STARTING_USER_BALANCE = 10 ether;
    // stETHMock public constant STETH_BALANCE = 1 ether;

    function setUp() external {
        DeployRafflePool deployer = new DeployRafflePool();
        (rafflePool, helperConfig) = deployer.run();
        ownerPrivateKey = 0xABC;
        PLAYER = vm.addr(ownerPrivateKey);
        USER1 = vm.addr(0x123);
        USER2 = vm.addr(0x456);
        USER3 = vm.addr(0x789);
        vm.deal(PLAYER, STARTING_USER_BALANCE);
        vm.deal(USER1, STARTING_USER_BALANCE);
        vm.deal(USER2, STARTING_USER_BALANCE);
        vm.deal(USER3, STARTING_USER_BALANCE);
        (
            steth, // stETH
            interval,
            vrfCoordinatorV2,
            gasLane,
            subscriptionId,
            callbackGasLimit,
            numWords,
            , // link
                // deployerPrivateKey
        ) = helperConfig.activeNetworkConfig(); // now these are all getting saved as state vars so can use them in tests below
        StEth = StEthMock(payable(steth));
        sigUtils = new SigUtils(StEth.DOMAIN_SEPARATOR());
    }

    /////////////////////////
    // Modifiers          //
    ////////////////////////
    modifier getStEth(address _address) {
        vm.prank(_address);
        (bool success,) = address(steth).call{value: STARTING_USER_BALANCE}("");
        _;
    }

    modifier warpToPresentDay() {
        vm.warp(1680616584);
        _;
    }

    modifier getAndDepositStEth(address _address, uint256 _amount) {
        vm.prank(_address);
        (bool success,) = address(steth).call{value: STARTING_USER_BALANCE}("");
        _depositStEthToRafflePool(_address, _amount);
        _;
    }

    /////////////////////////
    // Helper Functions   //
    ////////////////////////
    function _depositStEthToRafflePool(address _address, uint256 _amount) internal {
        uint256 preDepositBalance = rafflePool.getUserDeposit(PLAYER);
        vm.startPrank(_address);
        StEth.approve(address(rafflePool), type(uint256).max);
        rafflePool.depositStEth(_amount);
        assertApproxEqAbs(rafflePool.getUserDeposit(PLAYER), preDepositBalance + _amount, 2 wei);
        vm.stopPrank();
    }

    function _withdrawStEthFromRafflePool(address _address, uint256 _amount) internal {
        uint256 preWithdrawalBalance = rafflePool.getUserDeposit(PLAYER);
        vm.startPrank(_address);
        rafflePool.withdrawStEth(_amount);
        assertApproxEqAbs(rafflePool.getUserDeposit(PLAYER), preWithdrawalBalance - _amount, 2 wei);
        vm.stopPrank();
    }

    /////////////////////////
    // Initial State       //
    /////////////////////////

    function testRafflePoolInitsInOpenState() public view {
        assert(rafflePool.getRaffleState() == RafflePool.RaffleState.OPEN);
    }

    //////////////////////////
    // Misc                 //
    //////////////////////////

    function testRafflePoolGetLastTimestamp() public {
        uint256 lastTimestamp = rafflePool.getLastTimestamp();
        assertEq(lastTimestamp, block.timestamp);
    }

    function testStEthRebase() public getStEth(PLAYER) {
        uint256 preRebaseUserBalance = StEth.balanceOf(PLAYER);
        uint256 preRebaseTotalBalance = StEth.getTotalPooledEther();
        StEth.rebase();
        uint256 postRebaseUserBalance = StEth.balanceOf(PLAYER);
        uint256 postRebaseTotalBalance = StEth.getTotalPooledEther();
        assertGt(postRebaseUserBalance, preRebaseUserBalance);
        assertGt(postRebaseTotalBalance, preRebaseTotalBalance);
    }

    //////////////////////////
    // Deposit ETH          //
    //////////////////////////
    function testRafflePoolRevertsWhenDepositingEthWithZeroValue() public {
        // Arrange
        vm.prank(PLAYER);
        // Act
        vm.expectRevert(RafflePool.RafflePool__NeedsMoreThanZero.selector);
        // Assert
        rafflePool.depositEth();
    }

    function testRafflePoolRecordsEthDeposit() public {
        // Arrange
        vm.prank(PLAYER);
        // Act
        rafflePool.depositEth{value: STARTING_USER_BALANCE}();
        // Assert
        // console.log(rafflePool.getUserDeposit(PLAYER));
        // assert(rafflePool.getUserDeposit(msg.sender) == STARTING_USER_BALANCE);
        assertApproxEqAbs(rafflePool.getUserDeposit(PLAYER), STARTING_USER_BALANCE, 2 wei);
    }

    /* Minus 1 wei accounts for steth integer division corner case */
    function testRafflePoolEmitsDepositEvent() public {
        vm.prank(PLAYER);
        vm.expectEmit(true, false, false, true, address(rafflePool));
        emit MintAndDepositSuccessful(PLAYER, STARTING_USER_BALANCE - 1, STARTING_USER_BALANCE - 1);
        rafflePool.depositEth{value: STARTING_USER_BALANCE}();
    }

    function testRafflePoolDepositUpdatesUsersArray() public {
        vm.prank(PLAYER);
        rafflePool.depositEth{value: STARTING_USER_BALANCE}();
        assert(rafflePool.getActiveDepositorsCount() == 1);
        assert(rafflePool.getActiveDepositors()[0] == PLAYER);
    }

    function testRafflePoolDepositorOnlyAddedOnce() public {
        vm.startPrank(PLAYER);
        rafflePool.depositEth{value: 1e18}();
        rafflePool.depositEth{value: 2e18}();
        vm.stopPrank();
        assert(rafflePool.getActiveDepositorsCount() == 1);
        assert(rafflePool.getActiveDepositors()[0] == PLAYER);
    }

    function testRafflePoolDepositRevertsWhenRaffleIsCalculating() public {
        vm.prank(PLAYER);
        rafflePool.depositEth{value: STARTING_USER_BALANCE}();
        // warp time forward 7 days and rebase steth each day
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 1 days);
            StEth.rebase();
        }
        vm.warp(block.timestamp + 1);
        rafflePool.performUpkeep("");
        // Need to kick off checkUpkeep to get into calculating state
        vm.startPrank(USER1);
        vm.expectRevert(RafflePool.RafflePool__RaffleDrawInProgress.selector);
        rafflePool.depositEth{value: STARTING_USER_BALANCE}();
        vm.stopPrank();
    }

    //////////////////////////
    // Deposit stETH        //
    //////////////////////////

    function testStEthBalanceUpdatesAfterRafflePoolMint() public {
        vm.prank(PLAYER);
        (bool success,) = address(steth).call{value: STARTING_USER_BALANCE}("");
        assert(success == true);
        assertApproxEqAbs(IERC20Permit(steth).balanceOf(PLAYER), STARTING_USER_BALANCE, 2 wei);
    }

    function testRafflePoolRevertsWhenDepositingStEthWithZeroValue() public {
        // Arrange
        vm.prank(PLAYER);
        // Act
        vm.expectRevert(RafflePool.RafflePool__NeedsMoreThanZero.selector);
        // Assert
        rafflePool.depositStEth(0);
    }

    function testRafflePoolRecordsStEthDepositWithApprove() public {
        // 1. Add stETH balance to mock player
        // 2. Give spending allowance to rafflePool
        // 3. Deposit stETH to rafflePool
        // 4. Assert rafflePool records stETH deposit
        vm.startPrank(PLAYER);
        (bool success,) = address(steth).call{value: STARTING_USER_BALANCE}("");
        assert(success == true);
        IERC20Permit(steth).approve(address(rafflePool), 10e18);
        rafflePool.depositStEth(STARTING_USER_BALANCE);
        vm.stopPrank();
        assertApproxEqAbs(rafflePool.getUserDeposit(PLAYER), STARTING_USER_BALANCE, 2 wei);
    }

    function testRafflePoolRevertsWhenDepositingStEthWithInsufficientAllowance() public {
        vm.prank(PLAYER);
        vm.expectRevert(RafflePool.RafflePool__InsufficientAllowance.selector);
        rafflePool.depositStEth(1e18);
    }

    function testRafflePoolRecordsStEthDepositWithPermit() public {
        // 1. Add stETH balance to mock player
        // 2. Call steth contract to get player nonce
        // 3. Generate permit message for player to sign
        // 2. Sign off-chain permit
        // 3. Split signature into r, s, v & call deposit with permit
        // 4. Assert rafflePool records stETH deposit
        vm.prank(PLAYER);
        (bool success,) = address(steth).call{value: STARTING_USER_BALANCE}("");
        assert(success == true);

        // Generate message to sign, then sign by PLAYER, then split into r, s, v & pass to deposit with permit
        IERC20Permit stethPermit = IERC20Permit(steth);
        uint256 _nonce = stethPermit.nonces(PLAYER);
        SigUtils.Permit memory permit = SigUtils.Permit({
            owner: PLAYER,
            spender: address(rafflePool),
            value: 1e18,
            nonce: _nonce,
            deadline: block.timestamp + 1 days
        });
        bytes32 digest = sigUtils.getTypedDataHash(permit);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, digest);
        vm.prank(PLAYER);
        rafflePool.depositStEthWithPermit(1 ether, permit.deadline, v, r, s);
        // assert
        assertApproxEqAbs(rafflePool.getUserDeposit(PLAYER), 1 ether, 2 wei);
    }

    //////////////////////////
    // Modifiers & Helpers  //
    //////////////////////////

    function testGetStEthModifier() public getStEth(PLAYER) {
        assertApproxEqAbs(StEth.balanceOf(PLAYER), STARTING_USER_BALANCE, 2 wei);
    }

    function testDepositStEthHelperFunction() public getStEth(PLAYER) {
        // Arrange
        uint256 preUserDepositBalance = rafflePool.getUserDeposit(PLAYER);
        // Act
        _depositStEthToRafflePool(PLAYER, STARTING_USER_BALANCE);
        uint256 postUserDepositBalance = rafflePool.getUserDeposit(PLAYER);
        // Assert
        assertApproxEqAbs(postUserDepositBalance, preUserDepositBalance + STARTING_USER_BALANCE, 2 wei);
    }

    function testWarpToPresentDayModifier() public warpToPresentDay {
        assertEq(block.timestamp, 1680616584);
    }

    //////////////////////////
    // Withdraw stETH       //
    //////////////////////////

    function testRafflePoolAllowsWithdrawalOfStEth() public getStEth(PLAYER) {
        // Arrange
        uint256 preDepositUserWalletBalance = StEth.balanceOf(PLAYER);
        _depositStEthToRafflePool(PLAYER, STARTING_USER_BALANCE);
        uint256 postDepositUserBalance = rafflePool.getUserDeposit(PLAYER);
        // Act
        vm.prank(PLAYER);
        rafflePool.withdrawStEth(postDepositUserBalance);
        uint256 postWithdrawUserBalance = rafflePool.getUserDeposit(PLAYER);
        // Assert
        assertEq(postDepositUserBalance, postWithdrawUserBalance + postDepositUserBalance);
        assertApproxEqAbs(StEth.balanceOf(PLAYER), preDepositUserWalletBalance, 2 wei);
    }

    function testRafflePoolRecordsWithdrawalOfStEth() public getStEth(PLAYER) {
        _depositStEthToRafflePool(PLAYER, STARTING_USER_BALANCE);
        uint256 postDepositUserBalance = rafflePool.getUserDeposit(PLAYER);
        uint256 postDepositTotalBalance = StEth.balanceOf(address(rafflePool));

        vm.prank(PLAYER);
        rafflePool.withdrawStEth(postDepositUserBalance);
        uint256 postWithdrawUserBalance = rafflePool.getUserDeposit(PLAYER);
        uint256 postWithdrawTotalBalance = StEth.balanceOf(address(rafflePool));

        assertEq(postDepositUserBalance, postDepositTotalBalance);
        assertEq(postWithdrawUserBalance, 0);
        assertApproxEqAbs(postWithdrawTotalBalance, 0, 2 wei);
    }

    function testRafflePoolRevertsWhenWithdrawingAmountGreaterThanBalance() public getStEth(PLAYER) {
        _depositStEthToRafflePool(PLAYER, 1e18);
        vm.expectRevert(RafflePool.RafflePool__InsufficientStEthBalance.selector);
        vm.prank(PLAYER);
        rafflePool.withdrawStEth(1e18 + 1);
    }

    //////////////////////////
    // Balance Logs        //
    //////////////////////////
    function testRafflePoolDepositEthUpdatesBalanceLogs() public {
        vm.prank(PLAYER);
        rafflePool.depositEth{value: STARTING_USER_BALANCE}();
        uint256 userDeposit = rafflePool.getUserDeposit(PLAYER);
        assertApproxEqAbs(userDeposit, STARTING_USER_BALANCE, 2 wei);

        uint256 lastBalance = rafflePool.getLastUserBalanceLog(PLAYER).balance;
        uint256 lastTimestamp = rafflePool.getLastUserBalanceLog(PLAYER).timestamp;

        assertEq(lastBalance, userDeposit);
        assertEq(lastTimestamp, block.timestamp);
    }

    function testRafflePoolDepositStEthUpdatesBalanceLogs() public getStEth(PLAYER) {
        _depositStEthToRafflePool(PLAYER, STARTING_USER_BALANCE);
        uint256 userDeposit = rafflePool.getUserDeposit(PLAYER);

        uint256 lastBalance = rafflePool.getLastUserBalanceLog(PLAYER).balance;
        uint256 lastTimestamp = rafflePool.getLastUserBalanceLog(PLAYER).timestamp;

        assertEq(lastBalance, userDeposit);
        assertEq(lastTimestamp, block.timestamp);
    }

    function testRafflePoolWithdrawStEthUpdatesBalanceLogs() public getStEth(PLAYER) {
        _depositStEthToRafflePool(PLAYER, STARTING_USER_BALANCE);
        uint256 postUserDepositBalance = rafflePool.getUserDeposit(PLAYER);
        vm.prank(PLAYER);
        rafflePool.withdrawStEth(postUserDepositBalance);
        uint256 postUserWithdrawBalance = rafflePool.getUserDeposit(PLAYER);

        uint256 lastBalance = rafflePool.getLastUserBalanceLog(PLAYER).balance;
        uint256 lastTimestamp = rafflePool.getLastUserBalanceLog(PLAYER).timestamp;

        assertEq(lastBalance, postUserWithdrawBalance);
        assertEq(lastTimestamp, block.timestamp);
    }

    /* @dev */
    function testRafflePoolMultipleTransactionsUpdateBalanceLogs() public getStEth(PLAYER) {
        uint256[3] memory balanceAmounts;
        uint256[3] memory balanceTimestamps;
        _depositStEthToRafflePool(PLAYER, 1 ether);
        balanceAmounts[0] = rafflePool.getUserDeposit(PLAYER);
        balanceTimestamps[0] = block.timestamp;

        vm.warp(block.timestamp + 1);
        _depositStEthToRafflePool(PLAYER, 2 ether);
        balanceAmounts[1] = rafflePool.getUserDeposit(PLAYER);
        balanceTimestamps[1] = block.timestamp;

        vm.warp(block.timestamp + 1);
        _withdrawStEthFromRafflePool(PLAYER, 5e17);
        balanceAmounts[2] = rafflePool.getUserDeposit(PLAYER);
        balanceTimestamps[2] = block.timestamp;

        RafflePool.BalanceLog[] memory balanceLogs = rafflePool.getUserBalanceLog(PLAYER);
        for (uint256 i = 0; i < balanceLogs.length; i++) {
            assertEq(balanceLogs[i].balance, balanceAmounts[i]);
            assertEq(balanceLogs[i].timestamp, balanceTimestamps[i]);
        }
    }

    //////////////////////////
    // CheckUpkeep          //
    //////////////////////////

    function testCheckUpkeepReturnsFalseIfNotEnoughTimePassed() public getStEth(PLAYER) {
        _depositStEthToRafflePool(PLAYER, 2 ether);
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 1 days);
            StEth.rebase();
        }
        vm.warp(block.timestamp - 1);
        (bool upkeepNeeded,) = rafflePool.checkUpkeep("");
        assertEq(upkeepNeeded, false);
    }

    function testCheckUpkeepReturnsFalseIfNoPrize() public getStEth(PLAYER) {
        _depositStEthToRafflePool(PLAYER, 2 ether);
        vm.warp(block.timestamp + 7 days + 1);
        (bool upkeepNeeded,) = rafflePool.checkUpkeep("");
        assertEq(upkeepNeeded, false);
    }

    function testCheckUpkeepReturnsFalseIfRaffleNotOpen() public getStEth(PLAYER) {
        _depositStEthToRafflePool(PLAYER, 2 ether);
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 1 days);
            StEth.rebase();
        }
        vm.warp(block.timestamp + 1);
        rafflePool.performUpkeep("");
        (bool upkeepNeeded,) = rafflePool.checkUpkeep("");
        assertEq(upkeepNeeded, false);
    }

    function testCheckUpkeepReturnsTrueIfAllParametersGood() public getStEth(PLAYER) {
        _depositStEthToRafflePool(PLAYER, 2 ether);
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 1 days);
            StEth.rebase();
        }
        vm.warp(block.timestamp + 1);
        (bool upkeepNeeded,) = rafflePool.checkUpkeep("");
        assertEq(upkeepNeeded, true);
    }

    //////////////////////////
    // PerformUpkeep        //
    //////////////////////////
    function testPerformUpkeepCanOnlyRunWhenCheckUpkeepIsTrue() public getStEth(PLAYER) {
        _depositStEthToRafflePool(PLAYER, 2 ether);
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 1 days);
            StEth.rebase();
        }
        vm.warp(block.timestamp + 1);

        rafflePool.performUpkeep("");
    }

    function testPerformUpkeepRevertsWhenCheckUpkeepIsFalse() public getStEth(PLAYER) {
        _depositStEthToRafflePool(PLAYER, 2 ether);
        vm.warp(block.timestamp + 7 days + 1);
        uint256 currentPrize = 0;
        uint256 raffleState = 0;
        // We expect `performUpkeep` to revert with the following error code & error parameters:
        vm.expectRevert(
            abi.encodeWithSelector(RafflePool.RafflePool__UpkeepNotNeeded.selector, currentPrize, raffleState)
        );
        rafflePool.performUpkeep("");
    }

    function testPerformUpkeepUpdatesRaffleStateAndEmitsRequestId() public getAndDepositStEth(PLAYER, 1 ether) {}

    //////////////////////////
    // Events              //
    //////////////////////////

    // function testStEthTransfer() public getStEth(PLAYER) {
    //     uint256 preTransferUserBalance = StEth.balanceOf(PLAYER);
    //     uint256 preTransferUserShares = StEth.sharesOf(PLAYER);
    //     uint256 preTransferRafflePoolBalance = StEth.balanceOf(address(rafflePool));
    //     uint256 preTransferRafflePoolShares = StEth.sharesOf(address(rafflePool));
    //     _depositStEthToRafflePool(PLAYER, 2 ether);
    //     uint256 postTransferUserBalance = StEth.balanceOf(PLAYER);
    //     uint256 postTransferUserShares = StEth.sharesOf(PLAYER);
    //     uint256 postTransferRafflePoolBalance = StEth.balanceOf(address(rafflePool));
    //     uint256 postTransferRafflePoolShares = StEth.sharesOf(address(rafflePool));

    //     console.log("User Balance Change: -", preTransferUserBalance - postTransferUserBalance);
    //     console.log("User Shares Change: -", preTransferUserShares - postTransferUserShares);
    //     console.log("RafflePool Balance Change: +", postTransferRafflePoolBalance - preTransferRafflePoolBalance);
    //     console.log("RafflePool Shares Change: +", postTransferRafflePoolShares - preTransferRafflePoolShares);
    // }

    function testERC20TransferWithoutFunctionCall() public {}

    // using stdStorage for StdStorage;

    // function testFindMapping() public {
    //     uint256 slot = stdstore.target(address(this)).sig(this.balanceOf.selector).with_key(alice).find();
    //     bytes32 data = vm.load(address(this), bytes32(slot));
    //     assertEqDecimal(uint256(data), mintAmount, decimals());
    // }

    //////////////////////////
    // Clean up active users
    //////////////////////////
}
