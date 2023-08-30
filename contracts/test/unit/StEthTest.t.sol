// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "../../lib/forge-std/src/Test.sol";
import {StdUtils} from "../../lib/forge-std/src/StdUtils.sol";
import {StdCheats} from "../../lib/forge-std/src/StdCheats.sol";
import {IERC20Permit} from "../../src/IERC20Permit.sol";
import {SigUtils} from "../mocks/utils/SigUtils.sol";

import {StEthMock} from "../mocks/StEthToken.sol";

contract StEthTest is StdCheats, Test {
    StEthMock public steth;
    // address public PLAYER = makeAddr("PLAYER");
    SigUtils internal sigUtils;
    uint256 internal ownerPrivateKey;
    uint256 internal spenderPrivateKey;
    address internal OWNER;
    address internal spender;
    address PLAYER;
    uint256 public constant STARTING_USER_BALANCE = 10 ether;
    uint256 constant SENDER_PRIVATE_KEY = 111;

    function setUp() public {
        steth =
        new StEthMock{value: 445728713247296939121423 wei}({initialSupply: 445728713247296939121423, initialTotalShares: 380519077399654903647201});
        sigUtils = new SigUtils(steth.DOMAIN_SEPARATOR());
        ownerPrivateKey = 0xABC;
        spenderPrivateKey = 0x123;

        OWNER = vm.addr(ownerPrivateKey);
        spender = vm.addr(spenderPrivateKey);

        PLAYER = makeAddr("PLAYER");
        vm.deal(PLAYER, STARTING_USER_BALANCE);
        vm.deal(OWNER, STARTING_USER_BALANCE);
    }

    /* Modifiers */
    // Set up modifier to add steth to PLAYER balance for tests
    // Allow array of addresses to be passed to modifier, add steth balance to each address in array.
    // eg, this style of modifier:
    // modifier raffleEntered() {
    //     vm.prank(PLAYER);
    //     raffle.enterRaffle{value: raffleEntranceFee}();
    //     vm.warp(block.timestamp + automationUpdateInterval + 1);
    //     vm.roll(block.number + 1);
    //     _;
    // }
    // address[] memory _addresses
    modifier getStEth(address _address) {
        // for (uint256 i = 0; i < _addresses.length; i++) {
        //     vm.prank(_addresses[i]);
        //     steth.submit{value: 1 ether}(address(0));
        // }
        vm.prank(_address);
        steth.submit{value: 5 ether}(address(0));
        _;
    }

    function testTotalSupplyIsSet() public {
        assertEq(steth.totalSupply(), 445728713247296939121423);
    }

    function testTotalSharesIsSet() public {
        assertEq(steth.totalShares(), 380519077399654903647201);
    }

    /////////////////////////
    // Mint stETH          //
    /////////////////////////

    function testMintUsingSubmit() public {
        // Arrange
        uint256 startingUserStEthBalance = steth.balanceOf(PLAYER);

        uint256 startingTotalPooledEth = steth.totalSupply();

        // Act
        vm.startPrank(PLAYER);
        steth.submit{value: 1 ether}(address(0));
        vm.stopPrank();

        // Assert
        uint256 endingUserStEthBalance = steth.balanceOf(PLAYER);
        uint256 endingTotalPooledEth = steth.totalSupply();
        // console.log("Starting user steth balance: ", startingUserStEthBalance);
        // console.log("Starting total steth supply: ", startingTotalStEthSupply);
        // console.log("Ending user steth balance: ", endingUserStEthBalance);
        // console.log("Additional total steth supply: ", endingTotalStEthSupply - startingTotalStEthSupply);
        assertApproxEqAbs(startingUserStEthBalance + endingUserStEthBalance, 1 ether, 2 wei);
        assertEq(endingTotalPooledEth, startingTotalPooledEth + 1 ether);
    }

    function testMintUsingFallback() public {
        // Arrange
        uint256 startingUserStEthBalance = steth.balanceOf(PLAYER);
        uint256 startingTotalPooledEth = steth.totalSupply();

        // Act
        vm.prank(PLAYER);
        (bool success,) = address(steth).call{value: 1 ether}("");
        assert(success == true);

        // Assert
        uint256 endingUserStEthBalance = steth.balanceOf(PLAYER);
        uint256 endingTotalPooledEth = steth.totalSupply();
        assertApproxEqAbs(startingUserStEthBalance + endingUserStEthBalance, 1 ether, 2 wei);
        assertEq(endingTotalPooledEth, startingTotalPooledEth + 1 ether);
    }

    //////////////////////////
    // EIP-2612 Permit      //
    //////////////////////////

    function test_Permit() public getStEth(OWNER) {
        SigUtils.Permit memory permit =
            SigUtils.Permit({owner: OWNER, spender: spender, value: 1e18, nonce: 0, deadline: 1 days});

        bytes32 digest = sigUtils.getTypedDataHash(permit);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, digest);

        steth.permit(permit.owner, permit.spender, permit.value, permit.deadline, v, r, s);

        assertEq(steth.allowance(OWNER, spender), 1e18);
        assertEq(steth.nonces(OWNER), 1);
    }

    function test_TransferFromLimitedPermit() public getStEth(OWNER) {
        SigUtils.Permit memory permit =
            SigUtils.Permit({owner: OWNER, spender: spender, value: 1e18, nonce: 0, deadline: 1 days});

        bytes32 digest = sigUtils.getTypedDataHash(permit);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, digest);

        steth.permit(permit.owner, permit.spender, permit.value, permit.deadline, v, r, s);

        uint256 shares = steth.getSharesByPooledEth(1 ether);
        uint256 preOwnerBalance = steth.balanceOf(OWNER);
        vm.prank(spender);
        // steth.transferFrom(OWNER, spender, 1e18);
        steth.transferSharesFrom(OWNER, spender, shares);
        uint256 postOwnerBalance = steth.balanceOf(OWNER);

        assertApproxEqAbs(preOwnerBalance - postOwnerBalance, 1e18, 2 wei);
        assertApproxEqAbs(steth.balanceOf(spender), 1e18, 2 wei);
        assertApproxEqAbs(steth.allowance(OWNER, spender), 0, 2 wei);
    }

    //////////////////////////
    // Mock Rebase          //
    //////////////////////////

    function testRebaseIncreasesTokenSupply() public {
        uint256 startingTotalSupply = steth.totalSupply();
        steth.rebase();
        uint256 endingTotalSupply = steth.totalSupply();
        assertGt(endingTotalSupply, startingTotalSupply);
    }

    function testRebaseDoesntIncreaseTokenShares() public {
        uint256 startingTotalShares = steth.totalShares();
        steth.rebase();
        uint256 endingTotalShares = steth.totalShares();
        assertEq(endingTotalShares, startingTotalShares);
    }

    function testRebaseIncreasesUserBalance() public getStEth(PLAYER) {
        uint256 startingUserBalance = steth.balanceOf(PLAYER);
        steth.rebase();
        uint256 endingUserBalance = steth.balanceOf(PLAYER);
        assertGt(endingUserBalance, startingUserBalance);
    }

    // function testMint() public {
    //     vm.prank(PLAYER);
    //     uint256 balBefore = steth.balanceOf(PLAYER);
    //     console.log("Balance before: ", balBefore / 1e18);

    //     uint256 totalBefore = steth.totalSupply();
    //     console.log("Total supply before: ", totalBefore / 1e18);
    //     steth.submit{value: 1 ether}(address(0));

    //     uint256 balAfter = steth.balanceOf(PLAYER);
    //     console.log("Balance after: ", balAfter / 1e18);

    //     uint256 totalAfter = steth.totalSupply();
    //     console.log("Total supply after: ", totalAfter / 1e18);
    //     vm.stopPrank();
    // }
}
