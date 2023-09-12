// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Test, console} from "../../lib/forge-std/src/Test.sol";
import {Vm} from "../../lib/forge-std/src/Vm.sol";
import {CommonBase} from "../../lib/forge-std/src/Base.sol";
import {StdCheats} from "../../lib/forge-std/src/StdCheats.sol";
import {StdUtils} from "../../lib/forge-std/src/StdUtils.sol";
import {DeployRafflePool} from "../../script/DeployRafflePool.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {VRFCoordinatorV2Mock} from "../mocks/VRFCoordinatorV2Mock.sol";
import {RafflePool} from "../../src/RafflePool.sol";
import {IERC20Permit} from "../../src/interfaces/IERC20Permit.sol";
import {StEthMock} from "../mocks/StEthToken.sol";
import {InvariantTest} from "../../lib/forge-std/src/InvariantTest.sol";

contract RafflePoolHandler is CommonBase, StdCheats, StdUtils {
    RafflePool private rafflePool;
    StEthMock public StEth;

    // track time change
    uint256 private totalTimeChange;

    constructor(RafflePool _rafflePool, StEthMock _StEth) {
        rafflePool = _rafflePool;
        StEth = _StEth;
    }

    receive() external payable {}

    // Bound amount to be positve and less than balance
    function depositEth(uint256 amount) external {
        amount = bound(amount, 0, address(this).balance);
        rafflePool.depositEth{value: amount}();
    }

    function withdrawStEth(uint256 amount) external {
        amount = bound(amount, 0, StEth.balanceOf(address(this)));
        rafflePool.withdrawStEth(amount);
    }

    function warpBlockTimestamp(uint256 _warpTime) external {
        // use modulo so time can be incrememted by within a day
        uint256 warpTime = _warpTime % 86400;
        vm.warp(block.timestamp + warpTime);
        totalTimeChange += warpTime;
    }

    // set up function for fulfilling raffle
    function fulfillRaffle() external {}

    // check if time change has exceeded 1 week
    function _checkTimeChange() internal view returns (bool) {
        return totalTimeChange >= 604800;
    }

    // reset `totoalTimeChange` to 0
    function _resetTimeChange() internal {
        totalTimeChange = 0;
    }
}
