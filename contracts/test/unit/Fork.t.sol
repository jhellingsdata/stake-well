// SDPX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "../../lib/forge-std/src/Test.sol";
import {StdUtils} from "../../lib/forge-std/src/StdUtils.sol";
import {IERC20Permit} from "../../src/IERC20Permit.sol";

contract ForkTest is Test {
    IERC20Permit public stETH;

    function setUp() public {
        //     stETH = IERC20Permit(0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84);
        stETH = IERC20Permit(0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F);
    }

    function testDeposit() public {
        address PLAYER = address(123);
        uint256 balBefore = stETH.balanceOf(PLAYER);
        console.log("Balance before: ", balBefore / 1e18);

        uint256 totalBefore = stETH.totalSupply();
        console.log("Total supply before: ", totalBefore / 1e18);
        deal(address(stETH), PLAYER, 1e18, true); // mints 1 stETH to PLAYER & increments total supply by 1 stETH

        uint256 balAfter = stETH.balanceOf(PLAYER);
        console.log("Balance after: ", balAfter / 1e18);

        uint256 totalAfter = stETH.totalSupply();
        console.log("Total supply after: ", totalAfter / 1e18);
    }
}
