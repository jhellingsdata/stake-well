// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Test, console} from "../../lib/forge-std/src/Test.sol";
import {stdStorage, StdStorage} from "../../lib/forge-std/src/Test.sol";
import {Vm} from "../../lib/forge-std/src/Vm.sol";
import {StdCheats} from "../../lib/forge-std/src/StdCheats.sol";
import {StdUtils} from "../../lib/forge-std/src/StdUtils.sol";
import {DeployRafflePool} from "../../script/DeployRafflePool.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {VRFCoordinatorV2Mock} from "../mocks/VRFCoordinatorV2Mock.sol";
import {RafflePool} from "../../src/RafflePool.sol";
import {IERC20Permit} from "../../src/interfaces/IERC20Permit.sol";
import {StEthMock} from "../mocks/StEthToken.sol";
import {SigUtils} from "../mocks/utils/SigUtils.sol";
import {InvariantTest} from "../../lib/forge-std/src/InvariantTest.sol";
import {RafflePoolHandler} from "../invariants/RafflePoolHandler.t.sol";

contract RafflePoolTest is InvariantTest, StdCheats, Test {
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
    RafflePoolHandler handler;

    StEthMock public StEth;
    address steth;
    uint256 interval;
    address vrfCoordinatorV2;
    bytes32 gasLane;
    uint64 subscriptionId;
    uint32 callbackGasLimit;
    uint32 numWords;
    address link;
    // uint256 deployerKey;
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
                // deployerKey // deployerPrivateKey
        ) = helperConfig.activeNetworkConfig(); // now these are all getting saved as state vars so can use them in tests below
        StEth = StEthMock(payable(steth));
        sigUtils = new SigUtils(StEth.DOMAIN_SEPARATOR());
        handler = new RafflePoolHandler(rafflePool, StEth);
        deal(address(handler), 1000 * 1e18);
        targetContract(address(handler));
    }

    /////////////////////////
    // Modifiers          //
    ////////////////////////
    modifier getStEth(address _address) {
        vm.prank(_address);
        (bool success,) = address(steth).call{value: STARTING_USER_BALANCE}("");
        _;
    }

    // // unnecessary -> deploy script now warps to near-present before deploying raffle pool
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

    modifier raffleRebaseAndTimePassed() {
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 1 days);
            StEth.rebase();
        }
        vm.warp(block.timestamp + 1);
        _;
    }

    /////////////////////////
    // Helper Functions   //
    ////////////////////////
    function _depositStEthToRafflePool(address _address, uint256 _amount) internal {
        uint256 preDepositBalance = rafflePool.getUserDeposit(_address);
        vm.startPrank(_address);
        _checkAllowanceExceedsAmountOrApprove(_address, _amount);
        rafflePool.depositStEth(_amount);
        vm.stopPrank();
        assertApproxEqAbs(
            rafflePool.getUserDeposit(_address),
            preDepositBalance + _amount,
            2 wei,
            "Deposit amount not equal to user deposit"
        );
    }

    function _checkAllowanceExceedsAmountOrApprove(address _address, uint256 _amount) internal {
        uint256 allowance = StEth.allowance(_address, address(rafflePool));
        // if not, approve allowance
        if (allowance < _amount) {
            StEth.approve(address(rafflePool), type(uint256).max);
        }
        assert(StEth.allowance(_address, address(rafflePool)) >= _amount);
    }

    function _withdrawStEthFromRafflePool(address _address, uint256 _amount) internal {
        uint256 preWithdrawalBalance = rafflePool.getUserDeposit(_address);
        vm.startPrank(_address);
        rafflePool.withdrawStEth(_amount);
        vm.stopPrank();
        assertApproxEqAbs(rafflePool.getUserDeposit(_address), preWithdrawalBalance - _amount, 2 wei);
    }

    function _getAndDepositStEth(address _address, uint256 _amount) internal {
        vm.prank(_address);
        (bool success,) = address(steth).call{value: STARTING_USER_BALANCE}("");
        assertEq(success, true, "StEth mint failed");
        uint256 preDepositBalance = rafflePool.getUserDeposit(_address);
        vm.startPrank(_address);
        StEth.approve(address(rafflePool), type(uint256).max);
        rafflePool.depositStEth(_amount);
        vm.stopPrank();
        assertApproxEqAbs(rafflePool.getUserDeposit(_address), preDepositBalance + _amount, 2 wei);
    }

    function _depositEthToRafflePool(address _address, uint256 _amount) internal {
        uint256 preDepositBalance = rafflePool.getUserDeposit(_address);
        vm.prank(_address);
        rafflePool.depositEth{value: _amount}();
        assertApproxEqAbs(rafflePool.getUserDeposit(_address), preDepositBalance + _amount, 2 wei);
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

    function testFuzzRafflePoolRecordsEthDeposit(uint256 _amount) public {
        // bound amount to less than 1e19
        uint256 amount = _amount % 1e19 + 1 wei;
        vm.prank(PLAYER);
        rafflePool.depositEth{value: amount}();
        assertApproxEqAbs(rafflePool.getUserDeposit(PLAYER), amount, 2 wei);
    }

    function testFuzzRafflePoolRecordsMultipleEthDeposits(uint256 _amount) public {
        // bound amount to less than 3e18, since player balance is 10Eth
        uint256 amount = _amount % 3e18 + 10 wei;
        // Make 1st deposit
        vm.prank(PLAYER);
        rafflePool.depositEth{value: amount}();
        uint256 depositBalance1 = rafflePool.getUserDeposit(PLAYER);
        assertApproxEqAbs(depositBalance1, amount, 2 wei);
        // Make 2nd deposit
        vm.prank(PLAYER);
        rafflePool.depositEth{value: amount}();
        uint256 depositBalance2 = rafflePool.getUserDeposit(PLAYER);
        assertApproxEqAbs(depositBalance2, depositBalance1 + amount, 2 wei);

        // Make 3nd deposit
        vm.prank(PLAYER);
        rafflePool.depositEth{value: amount}();
        uint256 depositBalance3 = rafflePool.getUserDeposit(PLAYER);
        assertApproxEqAbs(depositBalance3, depositBalance2 + amount, 2 wei);
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

    function testRafflePoolStEthDepositWithPermitFailsOn2ndDeposit() public {
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
        vm.startPrank(PLAYER);
        rafflePool.depositStEthWithPermit(1 ether, permit.deadline, v, r, s);
        // assert
        assertApproxEqAbs(rafflePool.getUserDeposit(PLAYER), 1 ether, 2 wei);
        vm.expectRevert("INVALID_SIGNER");
        rafflePool.depositStEthWithPermit(1 ether, permit.deadline, v, r, s);
        vm.stopPrank();
    }

    function testFuzzRafflePoolRecordsMultipleStEthDepositsWithPermit() public {
        vm.prank(PLAYER);
        (bool success,) = address(steth).call{value: STARTING_USER_BALANCE}("");
        assert(success == true);

        vm.startPrank(PLAYER);
        // make 9 deposits
        for (uint256 i = 0; i < 9; i++) {
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
            // make deposit
            uint256 balance = rafflePool.getUserDeposit(PLAYER);
            rafflePool.depositStEthWithPermit(1 ether, permit.deadline, v, r, s);
            assertApproxEqAbs(rafflePool.getUserDeposit(PLAYER), balance + 1 ether, 2 wei);
        }
        vm.stopPrank();
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

    function testFuzzRafflePoolRecordsMultipleWithdrawalsOfStEth() public getStEth(PLAYER) {
        vm.prank(PLAYER);
        _depositStEthToRafflePool(PLAYER, 10 ether);

        // make 9 withdrawals
        for (uint256 i = 0; i < 9; i++) {
            uint256 balance = rafflePool.getUserDeposit(PLAYER);
            vm.prank(PLAYER);
            rafflePool.withdrawStEth(1 ether);
            assertApproxEqAbs(rafflePool.getUserDeposit(PLAYER), balance - 1 ether, 2 wei);
        }
    }

    function testRafflePoolRevertsWhenWithdrawingAmountGreaterThanBalance() public getStEth(PLAYER) {
        _depositStEthToRafflePool(PLAYER, 1e18);
        vm.expectRevert(RafflePool.RafflePool__InsufficientStEthBalance.selector);
        vm.prank(PLAYER);
        rafflePool.withdrawStEth(1e18 + 1);
    }

    //////////////////////////
    // stETH integration    //
    //////////////////////////
    function testStEthTransferCornerCase() public getStEth(PLAYER) {
        uint256 preTransferUserBalance = StEth.balanceOf(PLAYER);
        uint256 preTransferUserShares = StEth.sharesOf(PLAYER);
        uint256 preTransferRafflePoolBalance = StEth.balanceOf(address(rafflePool));
        uint256 preTransferRafflePoolShares = StEth.sharesOf(address(rafflePool));
        _depositStEthToRafflePool(PLAYER, 2 ether);
        uint256 postTransferUserBalance = StEth.balanceOf(PLAYER);
        uint256 postTransferUserShares = StEth.sharesOf(PLAYER);
        uint256 postTransferRafflePoolBalance = StEth.balanceOf(address(rafflePool));
        uint256 postTransferRafflePoolShares = StEth.sharesOf(address(rafflePool));

        assertEq(
            preTransferUserShares - postTransferUserShares,
            postTransferRafflePoolShares - preTransferRafflePoolShares,
            "Shares of user pre-deposit == shares of raffle pool post-deposit"
        );
        assertApproxEqAbs(
            preTransferUserBalance - postTransferUserBalance,
            postTransferRafflePoolBalance - preTransferRafflePoolBalance,
            2 wei,
            "Balance of user pre-deposit ~= balance of raffle pool post-deposit"
        );
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

    // Note: utilises temporary getters for retrieving balance logs arrays
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

    ///////////////////////////////////
    // TWAB Calculations - Manual    //
    ///////////////////////////////////
    function testCalculateTwabConstantBalanceUserDepositAtStart() public skipWhenForking {
        // initial block.timestamp: 1693408871
        _depositEthToRafflePool(PLAYER, 1 ether);
        uint256 playerDeposit = rafflePool.getUserDeposit(PLAYER);
        _depositEthToRafflePool(USER1, 2 ether);
        uint256 user1Deposit = rafflePool.getUserDeposit(USER1);
        _depositEthToRafflePool(USER2, 3 ether);
        uint256 user2Deposit = rafflePool.getUserDeposit(USER2);
        _depositEthToRafflePool(USER3, 4 ether);
        uint256 user3Deposit = rafflePool.getUserDeposit(USER3);
        uint256 initialTimestamp = block.timestamp;
        vm.warp(block.timestamp + 1 days);
        uint256 playerTwab = rafflePool.getTwab(PLAYER, initialTimestamp, block.timestamp);
        // if (userAddress == address(0)) then `getTwab` will return the total twab
        uint256 totalTwab = rafflePool.getTwab(address(0), initialTimestamp, block.timestamp);
        assertEq(playerTwab, playerDeposit);
        assertEq(totalTwab, playerDeposit + user1Deposit + user2Deposit + user3Deposit);
    }

    function testCalculateTwabConstantBalanceUserDepositBeforeStart() public skipWhenForking {
        _depositEthToRafflePool(PLAYER, 1 ether);
        uint256 playerDeposit = rafflePool.getUserDeposit(PLAYER);
        _depositEthToRafflePool(USER1, 2 ether);
        uint256 user1Deposit = rafflePool.getUserDeposit(USER1);
        _depositEthToRafflePool(USER2, 3 ether);
        uint256 user2Deposit = rafflePool.getUserDeposit(USER2);
        _depositEthToRafflePool(USER3, 4 ether);
        uint256 user3Deposit = rafflePool.getUserDeposit(USER3);
        vm.warp(block.timestamp + 1 days);
        uint256 initialTimestamp = block.timestamp;
        vm.warp(block.timestamp + 1 days);
        uint256 playerTwab = rafflePool.getTwab(PLAYER, initialTimestamp, block.timestamp);
        uint256 totalTwab = rafflePool.getTwab(address(0), initialTimestamp, block.timestamp);
        assertEq(playerTwab, playerDeposit, "Player twab incorrect");
        assertEq(totalTwab, playerDeposit + user1Deposit + user2Deposit + user3Deposit, "Total twab incorrect");
    }

    function testCalculateTwabUserDepositAtEnd() public skipWhenForking {
        // shouldn't occur, since Raffle will be in Calculating state at this point
        uint256 initialTimestamp = block.timestamp;
        vm.warp(block.timestamp + 7 days);
        _depositEthToRafflePool(PLAYER, 3 ether);
        uint256 playerTwab = rafflePool.getTwab(PLAYER, initialTimestamp, block.timestamp);
        assertEq(playerTwab, 0);
    }

    function testCalculateTwabOneBalanceChangeUserDepositAfterStart() public skipWhenForking {
        uint256 initialTimestamp = block.timestamp;
        vm.warp(block.timestamp + 3 days);

        _depositEthToRafflePool(PLAYER, 1 ether);
        uint256 playerDeposit = rafflePool.getUserDeposit(PLAYER);

        vm.warp(block.timestamp + 4 days);
        uint256 playerTwab = rafflePool.getTwab(PLAYER, initialTimestamp, block.timestamp);
        // Player deposit active for 4 out of 7 days, so should have 4/7 of their deposit
        uint256 expectedPlayerTwab = 4 * playerDeposit / 7;
        assertEq(playerTwab, expectedPlayerTwab, "Player twab incorrect");
    }

    function testCalculateTwabMultipleUserDeposits() public skipWhenForking {
        _depositEthToRafflePool(PLAYER, 1 ether);
        uint256 b0 = rafflePool.getUserDeposit(PLAYER);
        vm.warp(block.timestamp + 1 days);

        uint256 initialTimestamp = block.timestamp; // startTime
        vm.warp(block.timestamp + 2 days);
        _depositEthToRafflePool(PLAYER, 2 ether);
        uint256 b1 = rafflePool.getUserDeposit(PLAYER);
        vm.warp(block.timestamp + 3 days);
        _depositEthToRafflePool(PLAYER, 3 ether);
        uint256 b2 = rafflePool.getUserDeposit(PLAYER);
        vm.warp(block.timestamp + 2 days);

        uint256 playerTwab = rafflePool.getTwab(PLAYER, initialTimestamp, block.timestamp);
        // Player deposit active for 4 out of 7 days, so should have 4/7 of their deposit
        uint256 balanceCumulative_0 = b0 * (2 - 0);
        uint256 balanceCumulative_1 = b1 * (5 - 2);
        uint256 balanceCumulative_2 = b2 * (7 - 5);
        uint256 expectedPlayerTwab = (balanceCumulative_0 + balanceCumulative_1 + balanceCumulative_2) / 7;
        assertEq(playerTwab, expectedPlayerTwab, "Player twab incorrect");
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

    //////////////////////////
    // Events               //
    //////////////////////////

    // Note: utilises temporary event for requesting raffle winner
    // testing output of an event
    // Chainlink VRF works by emitting event (RandomWordsRequested) from the VRFCoordinator contract,
    // Chainlink node listens for this event, then knows when to request random word and call fulfillRandomWords function on the VRFCoordinator contract
    function testPerformUpkeepUpdatesRaffleStateAndEmitsRequestId() public getAndDepositStEth(PLAYER, 1 ether) {
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 1 days);
            StEth.rebase();
        }
        vm.warp(block.timestamp + 1);

        vm.recordLogs();
        rafflePool.performUpkeep("");
        // Vm.Log, special Foundry type for logs array
        Vm.Log[] memory logs = vm.getRecordedLogs(); // capture all values of all emitted events
        // all logs recorded as bytes32
        bytes32 requestId = logs[1].topics[1]; // 0th topic refers to entire event, 1st topic refers to requestId
        RafflePool.RaffleState raffleState = rafflePool.getRaffleState();
        assert(uint256(requestId) > 0);
        assert(raffleState == RafflePool.RaffleState.CALCULATING);
    }

    //////////////////////////
    // Platform Fee         //
    //////////////////////////
    // function testOwnerCanSetFee() public {
    //     // prank as the owner of the smart contract and set the platform fee
    //     // uint256 feeBefore = rafflePool.getPlatformFee();
    //     address OWNER = vm.addr(deployerKey);
    //     vm.prank(OWNER);
    //     rafflePool.adjustPlatformFee(100);
    //     assertEq(rafflePool.getPlatformFee(), 100);
    // }

    //////////////////////////
    // fulfillRandomWords
    //////////////////////////
    // Fuzz test, by passing a parameter we can automatically test multiple values in one run
    function testFulfillRandomWordsCanOnlyBeCalledAfterPerformUpkeep(uint256 randomRequestId)
        public
        getAndDepositStEth(PLAYER, 1 ether)
        getAndDepositStEth(USER1, 2 ether)
        raffleRebaseAndTimePassed
    {
        // VRFCoordinator should fail with this error message if requestId doesn't exist
        vm.expectRevert("nonexistent request");
        // VRFCoordinator `fulfillRandomWords` takes requestId and consumer address, should fail if no request made
        VRFCoordinatorV2Mock(vrfCoordinatorV2).fulfillRandomWords(randomRequestId, address(rafflePool));
    }

    //////////////////////////
    // Clean up active users
    //////////////////////////

    //////////////////////////
    // Full Test           //
    //////////////////////////
    // Deposit multiple times across multiple users
    // Move through time & rebase so interval has passed and check upkeep returns true
    // Perform upkeep and start request to get random number
    // Pretend to be VRF Coordinator and fulfill request with random number
    // Check that winner is picked and announced
    function testFulfillRandomWordsPicksResetsAndAnnouncesWinner() public skipWhenForking {
        // Deposit multiple times across multiple users
        _depositEthToRafflePool(PLAYER, 1 ether);
        _depositEthToRafflePool(USER1, 2 ether);
        _depositEthToRafflePool(USER2, 3 ether);
        _depositEthToRafflePool(USER3, 4 ether);
        console.log(block.timestamp);

        // Move through time & rebase so interval has passed and check upkeep returns true
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 1 days);
            _depositEthToRafflePool(PLAYER, 1 ether); // deposit 1 steth each day
            StEth.rebase();
        }
        vm.warp(block.timestamp + 1);

        (bool upkeepNeeded,) = rafflePool.checkUpkeep("");
        assertEq(upkeepNeeded, true, "Upkeep not needed");

        // Perform upkeep and listen for request id, this is passed to VRFCoordinator to request random number
        vm.recordLogs();
        rafflePool.performUpkeep("");
        Vm.Log[] memory requestLogs = vm.getRecordedLogs();
        bytes32 requestId = requestLogs[1].topics[1];

        // Pretend to be VRF Coordinator and fulfill request with random number
        vm.recordLogs();
        VRFCoordinatorV2Mock(vrfCoordinatorV2).fulfillRandomWords(uint256(requestId), address(rafflePool));
        Vm.Log[] memory entries = vm.getRecordedLogs();
        console.log("Events recorded", entries.length);
        console.log("Event 0: ", uint256(entries[0].topics[1])); // Random word
        console.log("Event 1: ", uint256(entries[1].topics[1])); // Scaled random number
        console.log("Winner: ", address(uint160(uint256(entries[2].topics[1])))); // Winning address
        console.log("Raffle Prize: ", abi.decode(entries[2].data, (uint256))); // Raffle prize
        uint256 rafflePrize = abi.decode(entries[2].data, (uint256)); // `PickedWinner(winner, rafflePrize)` event data
        (uint256 seed, uint96 payment,) = abi.decode(entries[3].data, (uint256, uint96, bool));
        console.log("RequestId: ", uint256(entries[3].topics[1]));
        console.log("Output Seed: ", seed);
        console.log("LINK Payment: ", payment);

        // uint256 randomWord = uint256(entries[0].topics[1]);
        // uint256 scaledRandomNumber = uint256(entries[1].topics[1]);
        // string memory pickedWinner = vm.toString(entries[2].topics[1]);

        // uint256 randomWordsFulfilledRequestid = uint256(entries[3].topics[1]);
        // uint256 randomWordsFulfilledOutputSeed = uint256(entries[3].topics[2]);
        // uint256 randomWordsFulfilledPayment = uint256(entries[3].topics[3]);

        assert(rafflePool.getRecentWinner() != address(0)); // check winner is assigned (assumes stateless test)
        assert(rafflePool.getRaffleState() == RafflePool.RaffleState.OPEN);
        assertEq(rafflePool.getLastTimestamp(), block.timestamp, "Last timestamp not updated");

        // Check winner is allocated value, i.e. balance is greater than balance at start of raffle
        if (rafflePool.getRecentWinner() == PLAYER) {
            assertGt(rafflePool.getUserDeposit(PLAYER), 8 ether);
            assertApproxEqAbs(rafflePool.getUserDeposit(PLAYER), 8 ether + rafflePrize, 16 wei); // 8 transactions so allowing 16 wei deviation
        } else if (rafflePool.getRecentWinner() == USER1) {
            assertGt(rafflePool.getUserDeposit(USER1), 2 ether);
        } else if (rafflePool.getRecentWinner() == USER2) {
            assertGt(rafflePool.getUserDeposit(USER2), 3 ether);
        } else if (rafflePool.getRecentWinner() == USER3) {
            assertGt(rafflePool.getUserDeposit(PLAYER), 4 ether);
        }

        assertEq(rafflePool.getPlatformFeeBalance(), 0, "Initial state has zero fee"); // Will return 0 unless we increase platform fee
        assertEq(rafflePool.getStakingRewardsTotal(), 0, "Raffle prize not reset");
    }

    function testFuzzFulillRandomWordsRaffleProcess(uint256 _randomWord) public skipWhenForking {
        string memory path = "tests/raffleFuzzSimple.txt";
        // Deposit multiple times across multiple users
        _depositEthToRafflePool(PLAYER, 1 ether);
        _depositEthToRafflePool(USER1, 2 ether);
        _depositEthToRafflePool(USER2, 3 ether);
        _depositEthToRafflePool(USER3, 4 ether);

        // Move through time & rebase so interval has passed and check upkeep returns true
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 1 days);
            // _depositEthToRafflePool(PLAYER, 1 ether); // deposit 1 steth each day
            StEth.rebase();
        }
        vm.warp(block.timestamp + 1);

        uint256 finalBalance = StEth.balanceOf(address(rafflePool));
        console.log("Final Balance: ", finalBalance);

        // (bool upkeepNeeded,) = rafflePool.checkUpkeep("");
        // assertEq(upkeepNeeded, true);

        // Perform upkeep and listen for request id, this is passed to VRFCoordinator to request random number
        vm.recordLogs();
        rafflePool.performUpkeep("");
        Vm.Log[] memory requestLogs = vm.getRecordedLogs();
        bytes32 requestId = requestLogs[1].topics[1];
        // Pretend to be VRF Coordinator and fulfill request with random number
        // Since we are mocking locally, we are not getting true randomness of networks
        // Instead we are just using the requestId to generate a random number
        // So the VRF Coordinator will return the same number for each requestId
        // To get around this, we can use the `fulfillRandomWordsWithOverride` function
        // We can pass our own random words array to this function, and it will use that instead of generating its own
        // Then can easily integrate with Foundry Fuzz testing
        // Pass 3rd parameter as empty array to use default random words, seeded from requestId 1
        // 3rd parameter format is uint256[]
        // Create an array of length 1 and assign _randomWord to the first position
        uint256[] memory wordsArray = new uint256[](1);
        wordsArray[0] = _randomWord;
        VRFCoordinatorV2Mock(vrfCoordinatorV2).fulfillRandomWordsWithOverride(
            uint256(requestId), address(rafflePool), wordsArray
        );

        address winningUser = rafflePool.getRecentWinner();
        assertEq(rafflePool.getLastTimestamp(), block.timestamp, "Last timestamp not updated");
        vm.writeLine(path, vm.toString(winningUser));

        // Check winner is allocated value
        console.log("Winner New Balance", rafflePool.getUserDeposit(winningUser));
        console.log(rafflePool.getPlatformFeeBalance()); // Will return 0 unless we increase platform fee

        // // Check that winner is picked and announced
        assert(rafflePool.getRaffleState() == RafflePool.RaffleState.OPEN);
    }

    function testFuzzFulfillRaffleProcess(uint8 _userCount, uint8 _depositAmount, uint256 _randomWord) public {
        // use fuzz parameters and modulo function to vary userCount and deposit time (before or after start)
        uint256 userCount = 10;
        uint256 numUsersBeforeStart = _userCount % userCount + 1;
        uint256 depositAmount = (_depositAmount % 100) + 1 ether; // vary deposit amount between 1 and 100 ether
        for (uint256 i = 1; i < numUsersBeforeStart; i++) {
            address user = address(uint160(i));
            hoax(user, 100 ether);
            rafflePool.depositEth{value: depositAmount}();
        }

        // Rebase steth each day
        for (uint256 i = 0; i < 4; i++) {
            vm.warp(block.timestamp + 1 days);
            StEth.rebase();
        }

        for (uint256 i = numUsersBeforeStart; i < userCount + 1; i++) {
            address user = address(uint160(i));
            // hoax - cheatcode sets up prank & deals ether
            hoax(user, 100 ether);
            rafflePool.depositEth{value: 1 ether}();
        }
        for (uint256 i = 0; i < 4; i++) {
            vm.warp(block.timestamp + 3 days);
            StEth.rebase();
        }
        assertEq(rafflePool.getActiveDepositorsCount(), userCount);
        (bool upkeepNeeded,) = rafflePool.checkUpkeep("");
        assertEq(upkeepNeeded, true, "Upkeep not needed");

        // Perform upkeep and listen for request id, this is passed to VRFCoordinator to request random number
        vm.recordLogs();
        rafflePool.performUpkeep("");
        Vm.Log[] memory requestLogs = vm.getRecordedLogs();
        bytes32 requestId = requestLogs[1].topics[1];

        uint256[] memory wordsArray = new uint256[](1);
        wordsArray[0] = _randomWord;
        VRFCoordinatorV2Mock(vrfCoordinatorV2).fulfillRandomWordsWithOverride(
            uint256(requestId), address(rafflePool), wordsArray
        );
    }
    // Could probably utilise a while loop to improve randomness

    //////////////////////////
    // Raffle Scaling Test  //
    //////////////////////////

    // set up perform raffle help
    function _performRaffleHelper(uint256 _randomWord) internal {
        // Perform upkeep and listen for request id, this is passed to VRFCoordinator to request random number
        vm.recordLogs();
        rafflePool.performUpkeep("");
        Vm.Log[] memory requestLogs = vm.getRecordedLogs();
        bytes32 requestId = requestLogs[1].topics[1];

        uint256[] memory wordsArray = new uint256[](1);
        wordsArray[0] = _randomWord;
        VRFCoordinatorV2Mock(vrfCoordinatorV2).fulfillRandomWordsWithOverride(
            uint256(requestId), address(rafflePool), wordsArray
        );
        assertEq(rafflePool.getLastTimestamp(), block.timestamp, "Last timestamp not updated");
    }

    function testFulfilRaffleSingle(uint256 _randomWord) public {
        // Test gas usage at different user counts
        uint256 userCount = 10;
        for (uint256 i = 1; i < userCount + 1; i++) {
            address user = address(uint160(i));
            hoax(user, 100 ether);
            rafflePool.depositEth{value: 100}();
        }
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 7 days);
            StEth.rebase();
        }

        _performRaffleHelper(_randomWord);

        // to simplify, users can deposit in 1 of 7 days
    }

    function testFulfilRaffleMultiDeposit(uint256 _randomWord) public {
        // Test Raffle num 1, 10, 50, 100, 500, 1000
        uint256 userCount = 100;
        for (uint256 i = 1; i < userCount + 1; i++) {
            address user = address(uint160(i));
            hoax(user, 10 ether);
            rafflePool.depositEth{value: 10 ether}();
        }
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 7 days);
            StEth.rebase();
        }
        _performRaffleHelper(_randomWord);

        // Raffle 2
        vm.warp(block.timestamp + 10);
        for (uint256 i = 1; i < (userCount / 2) + 1; i++) {
            address user = address(uint160(i));
            hoax(user, 10 ether);
            rafflePool.depositEth{value: 10 ether}();
        }
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 7 days);
            StEth.rebase();
        }
        _performRaffleHelper(_randomWord);

        // Raffle 3
        vm.warp(block.timestamp + 1);
        for (uint256 i = 1; i < (userCount / 2) + 1; i++) {
            address user = address(uint160(i));
            hoax(user, 10 ether);
            rafflePool.depositEth{value: 10 ether}();
        }
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 7 days);
            StEth.rebase();
        }
        _performRaffleHelper(_randomWord);
    }

    //////////////////////////
    // Active Users Array   //
    //////////////////////////

    //////////////////////////
    // Invariants           //
    //////////////////////////
    // Function to check for duplicates in activeUsers
    function _hasDuplicates() internal returns (bool) {
        string memory path = "tests/array_activeUsers.txt";
        address[] memory s_activeUsers = rafflePool.getActiveDepositors();
        vm.writeLine(path, vm.toString(s_activeUsers.length));
        for (uint256 i = 0; i < s_activeUsers.length; i++) {
            for (uint256 j = i + 1; j < s_activeUsers.length; j++) {
                if (s_activeUsers[i] == s_activeUsers[j]) {
                    return true; // Found a duplicate
                }
            }
        }
        return false;
    }

    function invariant_testActiveUsersNeverContainsDuplicates() public {
        assertEq(_hasDuplicates(), false, "Active users array contains duplicates");
    }

    // function _sumOfUserTwabs() internal returns (bool) {
    //     // get user number
    //     uint256 userCount = rafflePool.getActiveDepositorsCount();
    //     // calculate user twab
    //     for (uint256 i = 0; i < userCount; i++) {

    //         uint256 userTwab = rafflePool.getTwab(user, 0, block.timestamp);
    //         // add to total twab
    //         totalTwab += userTwab;
    //     }
    // }

    // function invariant_testTotalTwabIsAlwaysSumOfUserTwabs() public {
    //     uint256 totalTwab = rafflePool.getTwab(address(0), 0, block.timestamp);
    //     assertEq(_hasDuplicates(), false, "Active users array contains duplicates");
    // }
}
