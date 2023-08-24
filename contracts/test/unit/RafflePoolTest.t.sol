// SDPX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {DeployRafflePool} from "../../script/DeployRafflePool.s.sol";
import {RafflePool} from "../../src/RafflePool.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {Test, console} from "../../lib/forge-std/src/Test.sol";
import {Vm} from "../../lib/forge-std/src/Vm.sol";
import {StdCheats} from "../../lib/forge-std/src/StdCheats.sol";
import {VRFCoordinatorV2Mock} from "../mocks/VRFCoordinatorV2Mock.sol";
import {CreateSubscription} from "../../script/Interactions.s.sol";

contract RafflePoolTest is StdCheats, Test {
    RafflePool rafflePool;
    HelperConfig helperConfig;

    address steth;
    uint256 interval;
    address vrfCoordinatorV2;
    bytes32 gasLane;
    uint64 subscriptionId;
    uint32 callbackGasLimit;
    uint32 numWords;
    address link;

    address public PLAYER = makeAddr("player");
    uint256 public constant STARTING_USER_BALANCE = 1 ether;
    // stETHMock public constant STETH_BALANCE = 1 ether;

    function setUp() external {
        DeployRafflePool deployer = new DeployRafflePool();
        (rafflePool, helperConfig) = deployer.run();
        vm.deal(PLAYER, STARTING_USER_BALANCE);
        (
            , // stETH
            interval,
            vrfCoordinatorV2,
            gasLane,
            subscriptionId,
            callbackGasLimit,
            numWords,
            , // link
                // deployerPrivateKey
        ) = helperConfig.activeNetworkConfig(); // now these are all getting saved as state vars so can use them in tests below
    }

    function testRafflePoolInitsInOpenState() public view {
        assert(rafflePool.getRaffleState() == RafflePool.RaffleState.OPEN);
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
        console.log(rafflePool.getUserDeposit(PLAYER));
        // assert(rafflePool.getUserDeposit(msg.sender) == STARTING_USER_BALANCE);
    }

    // function testRafflePoolRecordsStEthDeposit() public {
    //     vm.prank(PLAYER);
    //     rafflePool.depositStEth
    // }

    // ** Skipping some tests for now because I'm not sure how to mock the stETH token contract

    //////////////////////////
    // Clean up active users
    //////////////////////////
}
