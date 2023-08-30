// SPDX-License-Identifier: MIT

// Fund the contract with ETH
// Fund the contract with stETH
// Withdraw stETH

pragma solidity ^0.8.20;

import {Script, console} from "../lib/forge-std/src/Script.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {RafflePool} from "../src/RafflePool.sol";
import {VRFCoordinatorV2Mock} from "../test/mocks/VRFCoordinatorV2Mock.sol";
import {LinkToken} from "../test/mocks/LinkToken.sol";
import {DevOpsTools} from "../lib/foundry-devops/src/DevOpsTools.sol";

// import {StakePool} from "../src/StakePool.sol";

// import {DevOpsTools} from "../lib/DevOpsTools.sol";
// contract DepositEthPool is Script {
//     uint256 constant SEND_VALUE = 0.1 ether;

//     function depositStEthPool(address mostRecentDeployed) public {
//         vm.startBroadcast();
//         StakePool(payable(mostRecentDeployed)).depositEth(value: SEND_VALUE);
//         vm.stopBroadcast();
//         console.log("Deposited %s Eth to pool", SEND_VALUE)
//     }
//     function run() external {
//         address mostRecentlyDeployed = DevOpsTools.get_most_recent_deployment(

//         );
//     }
// }

contract CreateSubscription is Script {
    function createSubscriptionUsingConfig() public returns (uint64) {
        HelperConfig helperConfig = new HelperConfig();
        (,, address vrfCoordinatorV2,,,,,, uint256 deployerPrivateKey) = helperConfig.activeNetworkConfig();
        return createSubscription(vrfCoordinatorV2, deployerPrivateKey);
    }

    function createSubscription(address vrfCoordinatorV2, uint256 deployerPrivateKey) public returns (uint64) {
        // console.log("Creating subscription on ChainId: ", block.chainid);
        vm.startBroadcast(deployerPrivateKey);
        uint64 subId = VRFCoordinatorV2Mock(vrfCoordinatorV2).createSubscription();
        vm.stopBroadcast();
        if (block.chainid != 31337) {
            console.log("Created subscription with id: ", subId, " on ChainId: ", block.chainid);
            console.log("Update subscriptionId in HelperConfig.s.sol");
        }
        return subId;
    }

    function run() external returns (uint64) {
        return createSubscriptionUsingConfig();
    }
}

contract FundSubscription is Script {
    uint96 public constant FUND_AMOUNT = 5 ether;

    function fundSubscriptionUsingConfig() public {
        HelperConfig helperConfig = new HelperConfig();
        (,, address vrfCoordinatorV2,, uint64 subId,,, address link, uint256 deployerPrivateKey) =
            helperConfig.activeNetworkConfig();
        fundSubscription(vrfCoordinatorV2, subId, link, deployerPrivateKey);
    }

    function fundSubscription(address vrfCoordinatorV2, uint64 subId, address link, uint256 deployerPrivateKey)
        public
    {
        if (block.chainid != 31337) {
            console.log("Funding subscription: ", subId);
            console.log("Using vrfCoordinatorV2: ", vrfCoordinatorV2);
            console.log("On ChainId: ", block.chainid);
        }
        if (block.chainid == 31337) {
            vm.startBroadcast(deployerPrivateKey);
            VRFCoordinatorV2Mock(vrfCoordinatorV2).fundSubscription(subId, FUND_AMOUNT);
            vm.stopBroadcast();
        } else {
            console.log(LinkToken(link).balanceOf(msg.sender));
            console.log(msg.sender);
            console.log(LinkToken(link).balanceOf(address(this)));
            console.log(address(this));
            vm.startBroadcast(deployerPrivateKey);
            LinkToken(link).transferAndCall(vrfCoordinatorV2, FUND_AMOUNT, abi.encode(subId));
            vm.stopBroadcast();
        }
    }

    function run() external {
        fundSubscriptionUsingConfig();
    }
}

contract AddConsumer is Script {
    function addConsumer(address rafflePool, address vrfCoordinatorV2, uint64 subId, uint256 deployerPrivateKey)
        public
    {
        if (block.chainid != 31337) {
            console.log("Adding consumer contract: ", rafflePool);
            console.log("Using vrfCoordinatorV2: ", vrfCoordinatorV2);
            console.log("On ChainId: ", block.chainid);
        }
        vm.startBroadcast(deployerPrivateKey);
        VRFCoordinatorV2Mock(vrfCoordinatorV2).addConsumer(subId, rafflePool);
        vm.stopBroadcast();
    }

    function addConsumerUsingConfig(address mostRecentlyDeployed) public {
        HelperConfig helperConfig = new HelperConfig();
        (,, address vrfCoordinatorV2,, uint64 subId,,,, uint256 deployerPrivateKey) = helperConfig.activeNetworkConfig();
        addConsumer(mostRecentlyDeployed, vrfCoordinatorV2, subId, deployerPrivateKey);
    }

    function run() external {
        address mostRecentlyDeployed = DevOpsTools.get_most_recent_deployment("RafflePool", block.chainid);
        addConsumerUsingConfig(mostRecentlyDeployed);
    }
}
