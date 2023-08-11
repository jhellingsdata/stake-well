// SPDX-License-Identifier: MIT

// Fund the contract with ETH
// Fund the contract with stETH
// Withdraw stETH

pragma solidity ^0.8.19;

import {Script} from "../lib/forge-std/src/Script.sol";
import {DevOpsTools} from "../lib/DevOpsTools.sol";
import {StakePool} from "../src/StakePool.sol";

contract DepositEthPool is Script {
    uint256 constant SEND_VALUE = 0.1 ether;

    function depositStEthPool(address mostRecentDeployed) public {
        vm.startBroadcast();
        StakePool(payable(mostRecentDeployed)).depositEth(value: SEND_VALUE);
        vm.stopBroadcast();
        console.log("Deposited %s Eth to pool", SEND_VALUE)
    }
    function run() external {
        address mostRecentlyDeployed = DevOpsTools.get_most_recent_deployment(

        );
    }
}

contract DepositStEthPool is Script {}
