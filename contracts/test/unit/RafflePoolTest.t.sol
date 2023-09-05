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
        assertApproxEqAbs(rafflePool.getUserDeposit(_address), preDepositBalance + _amount, 2 wei);
    }

    function _checkAllowanceExceedsAmountOrApprove(address _address, uint256 _amount) internal {
        uint256 allowance = StEth.allowance(_address, address(rafflePool));
        // if not, approve allowance
        if (allowance < _amount) {
            StEth.approve(address(rafflePool), type(uint256).max);
        }
        assert(allowance >= _amount);
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
            preTransferUserShares - postTransferUserShares, postTransferRafflePoolShares - preTransferRafflePoolShares
        );
        assertApproxEqAbs(
            preTransferUserBalance - postTransferUserBalance,
            postTransferRafflePoolBalance - preTransferRafflePoolBalance,
            2 wei
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

    function testERC20TransferWithoutFunctionCall() public {}

    // using stdStorage for StdStorage;

    // function testFindMapping() public {
    //     uint256 slot = stdstore.target(address(this)).sig(this.balanceOf.selector).with_key(alice).find();
    //     bytes32 data = vm.load(address(this), bytes32(slot));
    //     assertEqDecimal(uint256(data), mintAmount, decimals());
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
    function testFulfillRandomWordsPicksResetsAndAnnouncesWinner(uint256 _randomWord) public skipWhenForking {
        // Deposit multiple times across multiple users
        _depositEthToRafflePool(PLAYER, 1 ether);
        _depositEthToRafflePool(USER1, 2 ether);
        _depositEthToRafflePool(USER2, 3 ether);
        _depositEthToRafflePool(USER3, 4 ether);

        // Move through time & rebase so interval has passed and check upkeep returns true
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 1 days);
            _depositEthToRafflePool(PLAYER, 1 ether); // deposit 1 steth each day
            StEth.rebase();
        }
        vm.warp(block.timestamp + 1);

        uint256 finalBalance = StEth.balanceOf(address(rafflePool));
        console.log("Final Balance: ", finalBalance);

        // (bool upkeepNeeded,) = rafflePool.checkUpkeep("");
        // assertEq(upkeepNeeded, true);

        // Perform upkeep and start request to get random number
        vm.recordLogs();
        rafflePool.performUpkeep("");
        Vm.Log[] memory requestLogs = vm.getRecordedLogs();
        bytes32 requestId = requestLogs[1].topics[1];
        vm.recordLogs();
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
        // Vm.Log[] memory fulfillLogs = vm.getRecordedLogs();
        // uint256 number1 = uint256(fulfillLogs[0].topics[1]);
        // uint256 number2 = uint256(fulfillLogs[1].topics[1]);

        // console.log(number1);
        // console.log(number2);
        // uint256 requestId = rafflePool.getRequestId();
        // assertEq(requestId, 1);
        // assertEq(rafflePool.getRaffleState(), RafflePool.RaffleState.CALCULATING);

        address winningUser = rafflePool.getRecentWinner();
        console.log(winningUser);
        console.log("Active Depositors: ", rafflePool.getActiveDepositorsCount());

        assertEq(rafflePool.getLastTimestamp(), block.timestamp);

        // Check winner is allocated value
        console.log("Winner New Balance", rafflePool.getUserDeposit(winningUser));
        console.log(rafflePool.getPlatformFeeBalance()); // Will return 0 unless we increase platform fee

        // // Pretend to be VRF Coordinator and fulfill request with random number
        // VRFCoordinatorV2Mock vrfCoordinatorV2Mock = VRFCoordinatorV2Mock(vrfCoordinatorV2);
        // vrfCoordinatorV2Mock.fulfillRandomWords(requestId, numWords, gasLane, 1);

        // // Check that winner is picked and announced
        // assertEq(rafflePool.getRaffleState(), RafflePool.RaffleState.OPEN);
        // assertEq(rafflePool.getRaffleWinner(), USER1);
    }

    function testFuzzFulfillRaffleProcess() public {
        uint256 additionalUsers = 10;
        uint256 startIndex = 1;
        for (uint256 i = startIndex; i < startIndex + additionalUsers; i++) {
            address user = address(uint160(i));
            // hoax - cheatcode sets up prank & deals ether
            hoax(user, 2 ether);
            rafflePool.depositEth{value: 1 ether}();
        }
    }
}
