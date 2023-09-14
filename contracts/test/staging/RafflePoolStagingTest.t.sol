// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Test, console} from "../../lib/forge-std/src/Test.sol";
import {Vm} from "../../lib/forge-std/src/Vm.sol";
import {StdCheats} from "../../lib/forge-std/src/StdCheats.sol";
import {DeployRafflePool} from "../../script/DeployRafflePool.s.sol";
import {CreateSubscription} from "../../script/Interactions.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {VRFCoordinatorV2Mock} from "../mocks/VRFCoordinatorV2Mock.sol";
import {RafflePool} from "../../src/RafflePool.sol";
import {IERC20Permit} from "../../src/interfaces/IERC20Permit.sol";

contract RafflePoolTest is StdCheats, Test {
    /* Events */

    /* State Variables */

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
    uint256 public constant STARTING_USER_BALANCE = 10 ether;

    function setUp() external {
        DeployRafflePool deployer = new DeployRafflePool();
        (rafflePool, helperConfig) = deployer.run();
        vm.deal(PLAYER, STARTING_USER_BALANCE);
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
    }

    /////////////////////////
    // fulfillRandomWords //
    ////////////////////////
}
