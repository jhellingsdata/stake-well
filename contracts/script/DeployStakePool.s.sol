// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "../lib/forge-std/src/Script.sol";
import {StakePool} from "../src/StakePool.sol";

contract DeployStakePool is Script {
    function run() external returns (StakePool) {
        vm.startBroadcast();
        StakePool stakePool = new StakePool();
        vm.stopBroadcast();
        return stakePool;
    }
}
