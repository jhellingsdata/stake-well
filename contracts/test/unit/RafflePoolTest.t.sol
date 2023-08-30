// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Test, console} from "../../lib/forge-std/src/Test.sol";
import {stdStorage, StdStorage} from "../../lib/forge-std/src/Test.sol";
import {Vm} from "../../lib/forge-std/src/Vm.sol";
import {StdCheats} from "../../lib/forge-std/src/StdCheats.sol";
import {StdUtils} from "../../lib/forge-std/src/StdUtils.sol";
import {DeployRafflePool} from "../../script/DeployRafflePool.s.sol";
import {CreateSubscription} from "../../script/Interactions.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {VRFCoordinatorV2Mock} from "../mocks/VRFCoordinatorV2Mock.sol";
import {RafflePool} from "../../src/RafflePool.sol";
import {IERC20Permit} from "../../src/IERC20Permit.sol";
import {StEthMock} from "../mocks/StEthToken.sol";
import {SigUtils} from "../mocks/utils/SigUtils.sol";

contract RafflePoolTest is StdCheats, Test {
    RafflePool rafflePool;
    HelperConfig helperConfig;
    SigUtils sigUtils;

    StEthMock public StEth;
    address steth;
    uint256 interval;
    address vrfCoordinatorV2;
    bytes32 gasLane;
    uint64 subscriptionId;
    uint32 callbackGasLimit;
    uint32 numWords;
    address link;

    uint256 ownerPrivateKey;
    address public PLAYER;
    address public USER1;
    address public USER2;
    address public USER3;
    uint256 public constant STARTING_USER_BALANCE = 10 ether;
    // stETHMock public constant STETH_BALANCE = 1 ether;

    function setUp() external {
        DeployRafflePool deployer = new DeployRafflePool();
        (rafflePool, helperConfig) = deployer.run();
        ownerPrivateKey = 0xABC;
        PLAYER = vm.addr(ownerPrivateKey);
        USER1 = vm.addr(0x123);
        USER2 = vm.addr(0x456);
        USER3 = vm.addr(0x789);
        vm.deal(PLAYER, STARTING_USER_BALANCE);
        vm.deal(USER1, STARTING_USER_BALANCE / 2);
        vm.deal(USER2, STARTING_USER_BALANCE / 5);
        vm.deal(USER3, STARTING_USER_BALANCE / 10);
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
        StEth = StEthMock(payable(steth));
        sigUtils = new SigUtils(StEth.DOMAIN_SEPARATOR());
    }

    /////////////////////////
    // Modifiers          //
    ////////////////////////
    modifier getStEth(address _address) {
        // for (uint256 i = 0; i < _addresses.length; i++) {
        //     vm.prank(_addresses[i]);
        //     steth.submit{value: 1 ether}(address(0));
        // }
        vm.prank(_address);
        (bool success,) = address(steth).call{value: STARTING_USER_BALANCE}("");
        _;
    }

    /////////////////////////
    // Initial State       //
    /////////////////////////

    function testRafflePoolInitsInOpenState() public view {
        assert(rafflePool.getRaffleState() == RafflePool.RaffleState.OPEN);
    }

    //////////////////////////
    // Deposit ETH          //
    //////////////////////////
    function testRafflePoolRevertsWhenDepositingEthWithZeroValue() public {
        // Arrange
        vm.prank(PLAYER);
        // Act
        vm.expectRevert(RafflePool.RafflePool__NeedsMoreThanZero.selector);
        // Assert
        rafflePool.depositEth();
    }

    function testRafflePoolRecordsEthDeposit() public {
        // Arrange
        vm.prank(PLAYER);
        // Act
        rafflePool.depositEth{value: STARTING_USER_BALANCE}();
        // Assert
        // console.log(rafflePool.getUserDeposit(PLAYER));
        // assert(rafflePool.getUserDeposit(msg.sender) == STARTING_USER_BALANCE);
        assertApproxEqAbs(rafflePool.getUserDeposit(PLAYER), STARTING_USER_BALANCE, 2 wei);
    }

    //////////////////////////
    // Deposit stETH        //
    //////////////////////////

    function testStEthBalanceUpdatesAfterRafflePoolMint() public {
        vm.prank(PLAYER);
        (bool success,) = address(steth).call{value: STARTING_USER_BALANCE}("");
        assert(success == true);
        assertApproxEqAbs(IERC20Permit(steth).balanceOf(PLAYER), STARTING_USER_BALANCE, 2 wei);
    }

    function testRafflePoolRevertsWhenDepositingStEthWithZeroValue() public {
        // Arrange
        vm.prank(PLAYER);
        // Act
        vm.expectRevert(RafflePool.RafflePool__NeedsMoreThanZero.selector);
        // Assert
        rafflePool.depositStEth(0);
    }

    function testRafflePoolRecordsStEthDepositWithApprove() public {
        // 1. Add stETH balance to mock player
        // 2. Give spending allowance to rafflePool
        // 3. Deposit stETH to rafflePool
        // 4. Assert rafflePool records stETH deposit
        vm.startPrank(PLAYER);
        (bool success,) = address(steth).call{value: STARTING_USER_BALANCE}("");
        assert(success == true);
        IERC20Permit(steth).approve(address(rafflePool), 10e18);
        rafflePool.depositStEth(STARTING_USER_BALANCE);
        vm.stopPrank();
        assertApproxEqAbs(rafflePool.getUserDeposit(PLAYER), STARTING_USER_BALANCE, 2 wei);
    }

    function testRafflePoolRecordsStEthDepositWithPermit() public {
        // 1. Add stETH balance to mock player
        // 2. Call steth contract to get player nonce
        // 3. Generate permit message for player to sign
        // 2. Sign off-chain permit
        // 3. Split signature into r, s, v & call deposit with permit
        // 4. Assert rafflePool records stETH deposit
        vm.prank(PLAYER);
        (bool success,) = address(steth).call{value: STARTING_USER_BALANCE}("");
        assert(success == true);

        // Generate message to sign, then sign by PLAYER, then split into r, s, v & pass to deposit with permit
        IERC20Permit stethPermit = IERC20Permit(steth);
        uint256 _nonce = stethPermit.nonces(PLAYER);
        SigUtils.Permit memory permit =
            SigUtils.Permit({owner: PLAYER, spender: address(rafflePool), value: 1e18, nonce: _nonce, deadline: 1 days});
        bytes32 digest = sigUtils.getTypedDataHash(permit);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ownerPrivateKey, digest);
        vm.prank(PLAYER);
        rafflePool.depositStEthWithPermit(1 ether, permit.deadline, v, r, s);
        // assert
        assertApproxEqAbs(rafflePool.getUserDeposit(PLAYER), 1 ether, 2 wei);
    }

    function testERC20TransferWithoutFunctionCall() public {}

    // using stdStorage for StdStorage;

    // function testFindMapping() public {
    //     uint256 slot = stdstore.target(address(this)).sig(this.balanceOf.selector).with_key(alice).find();
    //     bytes32 data = vm.load(address(this), bytes32(slot));
    //     assertEqDecimal(uint256(data), mintAmount, decimals());
    // }

    // ** Skipping some tests for now because I'm not sure how to mock the stETH token contract

    //////////////////////////
    // Clean up active users
    //////////////////////////
}
