// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "../lib/forge-std/src/Script.sol";
import {StakePool} from "../src/StakePool.sol";

contract DeployStakePool is Script {
    function run() external returns (StakePool) {
        vm.startBroadcast();
        StakePool stakePool = new StakePool(0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F);
        vm.stopBroadcast();
        return stakePool;
    }
}
