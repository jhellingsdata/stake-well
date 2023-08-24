// SDPX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "../../lib/forge-std/src/Test.sol";
import {StdUtils} from "../../lib/forge-std/src/StdUtils.sol";
import {StdCheats} from "../../lib/forge-std/src/StdCheats.sol";
import {IERC20Permit} from "../../src/IERC20Permit.sol";

import {StEthMock} from "../mocks/StEthToken.sol";

contract StEthTest is StdCheats, Test {
    StEthMock public stETH;
    // address public PLAYER = makeAddr("player");
    address player;
    uint256 public constant STARTING_USER_BALANCE = 10 ether;
    uint256 constant SENDER_PRIVATE_KEY = 111;

    function setUp() public {
        stETH =
        new StEthMock{value: 445728713247296939121423 wei}({initialSupply: 445728713247296939121423, initialTotalShares: 380519077399654903647201});

        player = makeAddr("player");
        vm.deal(player, STARTING_USER_BALANCE);
    }

    function testTotalSupplyIsSet() public {
        assertEq(stETH.totalSupply(), 445728713247296939121423);
    }

    function testTotalSharesIsSet() public {
        assertEq(stETH.totalShares(), 380519077399654903647201);
    }

    function testMintUsingSubmit() public {
        // Arrange
        uint256 startingUserStEthBalance = stETH.balanceOf(player);

        uint256 startingTotalPooledEth = stETH.totalSupply();

        // Act
        vm.startPrank(player);
        stETH.submit{value: 1 ether}(address(0));
        vm.stopPrank();

        // Assert
        uint256 endingUserStEthBalance = stETH.balanceOf(player);
        uint256 endingTotalPooledEth = stETH.totalSupply();
        // console.log("Starting user stETH balance: ", startingUserStEthBalance);
        // console.log("Starting total stETH supply: ", startingTotalStEthSupply);
        // console.log("Ending user stETH balance: ", endingUserStEthBalance);
        // console.log("Additional total stETH supply: ", endingTotalStEthSupply - startingTotalStEthSupply);
        assertApproxEqAbs(startingUserStEthBalance + endingUserStEthBalance, 1 ether, 2 wei);
        assertEq(endingTotalPooledEth, startingTotalPooledEth + 1 ether);
    }

    // function testMint() public {
    //     vm.prank(PLAYER);
    //     uint256 balBefore = stETH.balanceOf(PLAYER);
    //     console.log("Balance before: ", balBefore / 1e18);

    //     uint256 totalBefore = stETH.totalSupply();
    //     console.log("Total supply before: ", totalBefore / 1e18);
    //     stETH.submit{value: 1 ether}(address(0));

    //     uint256 balAfter = stETH.balanceOf(PLAYER);
    //     console.log("Balance after: ", balAfter / 1e18);

    //     uint256 totalAfter = stETH.totalSupply();
    //     console.log("Total supply after: ", totalAfter / 1e18);
    //     vm.stopPrank();
    // }
}
