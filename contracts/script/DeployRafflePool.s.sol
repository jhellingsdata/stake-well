// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Script} from "../lib/forge-std/src/Script.sol";
import {RafflePool} from "../src/RafflePool.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {CreateSubscription, FundSubscription, AddConsumer} from "./Interactions.s.sol";

contract DeployRafflePool is Script {
    function run() external returns (RafflePool, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        AddConsumer addConsumer = new AddConsumer();
        (
            address steth,
            uint256 interval,
            address vrfCoordinatorV2,
            bytes32 gasLane,
            uint64 subscriptionId,
            uint32 callbackGasLimit,
            uint32 numWords,
            address link,
            uint256 deployerPrivateKey
        ) = helperConfig.activeNetworkConfig();

        if (subscriptionId == 0) {
            CreateSubscription createSubscription = new CreateSubscription();
            subscriptionId = createSubscription.createSubscription(vrfCoordinatorV2, deployerPrivateKey);

            // Fund it
            FundSubscription fundSubscription = new FundSubscription();
            fundSubscription.fundSubscription(vrfCoordinatorV2, subscriptionId, link, deployerPrivateKey);
        }

        // if we are on a local Anvil chain, set genesis timestamp to current time: 1693409871
        if (block.chainid == 31337) {
            vm.warp(1693408871);
        }
        vm.startBroadcast(deployerPrivateKey);
        RafflePool rafflePool = new RafflePool(
            steth,
            interval,
            vrfCoordinatorV2,
            gasLane,
            subscriptionId,
            callbackGasLimit,
            numWords
        );
        vm.stopBroadcast();

        addConsumer.addConsumer(address(rafflePool), vrfCoordinatorV2, subscriptionId, deployerPrivateKey);
        return (rafflePool, helperConfig);
    }
}
