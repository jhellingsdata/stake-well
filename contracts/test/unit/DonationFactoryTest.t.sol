// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Test, console} from "../../lib/forge-std/src/Test.sol";
import {Vm} from "../../lib/forge-std/src/Vm.sol";
import {DonationFactory} from "../../src/DonationFactory.sol";
import {DonationPool} from "../../src/DonationPool.sol";
import {IERC20Permit} from "../../src/interfaces/IERC20Permit.sol";
import {StEthMock} from "../mocks/StEthToken.sol";
import {DeployDonationFactory} from "../../script/DeployDonationFactory.s.sol";
import {HelperConfigDonation} from "../../script/HelperConfigDonation.s.sol";
import {SigUtils} from "../mocks/utils/SigUtils.sol";

contract DonationFactoryTest is Test {
    ///////////////////
    // Events
    ///////////////////
    event DonationPoolCreated(
        address indexed donationPool, address indexed beneficiary, uint256 indexed poolIndex, string title
    );
    event ProtocolFeeWithdrawn(uint256 amount);
    event ProtocolFeeAdjusted(uint256 newFee);

    DonationFactory donationFactory;
    HelperConfigDonation helperConfig;
    SigUtils sigUtils;
    StEthMock stEthMock;

    uint256 ownerKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint256 platformFee;
    address steth;
    uint256 userPrivateKey;
    address public BENEFICIARY;
    address public MANAGER;
    address public USER1;
    address public USER2;
    address public OWNER;
    uint256 STARTING_USER_BALANCE = 100 ether;

    function setUp() external {
        DeployDonationFactory deployer = new DeployDonationFactory();
        (donationFactory, helperConfig) = deployer.run();

        // deploy donation factory
        (
            steth, // stETH
            platformFee, // platformFee
                // deployerKey // deployerPrivateKey
        ) = helperConfig.activeNetworkConfig();
        stEthMock = StEthMock(payable(steth));
        sigUtils = new SigUtils(stEthMock.DOMAIN_SEPARATOR()); // for permit
        OWNER = vm.addr(ownerKey);
        userPrivateKey = 0x456;
        BENEFICIARY = vm.addr(0x123);
        MANAGER = vm.addr(0x234);
        USER1 = vm.addr(userPrivateKey);
        USER2 = vm.addr(0x789);
        vm.deal(MANAGER, STARTING_USER_BALANCE);
        vm.deal(USER1, STARTING_USER_BALANCE);
        vm.deal(USER2, STARTING_USER_BALANCE);
    }

    /////////////////////////
    // Modifiers          //
    ////////////////////////
    modifier getStEth(address _address) {
        vm.prank(_address);
        (bool success,) = address(steth).call{value: STARTING_USER_BALANCE}("");
        _;
    }

    function testFactoryCreatesDonationPool() public {
        // create donation pool
        string memory title = "test";
        vm.prank(MANAGER);
        donationFactory.createDonationPool(MANAGER, BENEFICIARY, title);
        // check donation pool created
        assertEq(donationFactory.getDonationPoolsCount(), 1);
    }

    function testFactoryEmitsCreationEvent() public {
        string memory title = "test";
        vm.recordLogs();
        // check topics in emitted event
        vm.startPrank(MANAGER);
        vm.recordLogs();
        donationFactory.createDonationPool(MANAGER, BENEFICIARY, title);
        Vm.Log[] memory entries = vm.getRecordedLogs();
        vm.stopPrank();
        // Vm.Log[] memory entries = vm.getRecordedLogs();
        assertEq(entries[0].topics.length, 4);
    }

    function testFactoryAddsDonationPoolToPoolsArray() public {
        string memory title = "test";
        vm.recordLogs();
        vm.prank(MANAGER);
        donationFactory.createDonationPool(MANAGER, BENEFICIARY, title);
        Vm.Log[] memory entries = vm.getRecordedLogs();
        address poolAddress = address(uint160(uint256(entries[1].topics[1]))); // newly deployed address
        assertEq(donationFactory.getDonationPoolAddress(0), poolAddress);
    }

    ///////////////////
    // Operator Fee
    ///////////////////
    function testFactoryOwnerCanSetFee() public {
        uint256 newFee = 1000;
        vm.prank(OWNER);
        donationFactory.adjustPlatformFee(newFee);
        assertEq(donationFactory.getCurrentPlatformFee(), newFee);
    }

    function testFactoryOwnerCannotSetFeeAboveLimit() public {
        vm.startPrank(OWNER);
        uint256 newFee = 2000;
        // uint256 oldFee = donationFactory.getCurrentPlatformFee();
        vm.expectRevert(DonationFactory.DonationFactory__ExceedsMaxProtocolFee.selector);
        donationFactory.adjustPlatformFee(newFee);
        assertEq(donationFactory.getCurrentPlatformFee(), platformFee);
        vm.stopPrank();
    }

    function testFactoryOwnerCanWithdrawFee() public {
        // test withdraw rewards works if all conditions are met
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);
        uint256 depositAmount = 10 ether;
        vm.prank(USER1);
        pool.depositEth{value: depositAmount}();
        // mock steth rebase
        stEthMock.rebase();
        // check rewards has increase
        assertGt(pool.getCampaignRewardsBalance(), 0);
        // withdraw rewards
        vm.prank(MANAGER);
        pool.withdrawRewards();

        // check factory balance has increased
        assertGt(donationFactory.getFactoryFeeBalance(), 0);

        // withdraw fee
        vm.prank(OWNER);
        donationFactory.withdrawPlatformFee();
        assertApproxEqAbs(donationFactory.getFactoryFeeBalance(), 0, 2 wei);
    }

    ///////////////////
    // Helper
    ///////////////////
    function _deployDonationPool() internal {
        // create donation pool
        uint256 oldPoolCount = donationFactory.getDonationPoolsCount();
        string memory title = "test";
        vm.prank(MANAGER);
        donationFactory.createDonationPool(MANAGER, BENEFICIARY, title);
        assertEq(donationFactory.getDonationPoolsCount(), oldPoolCount + 1);
    }

    ///////////////////
    // Factory Getters
    ///////////////////
    function testFactoryGetters() public {
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);
        assertEq(donationFactory.getCurrentPlatformFee(), platformFee);
        assertEq(donationFactory.getDonationPoolsCount(), 1);
        assertEq(donationFactory.getDonationPoolManager(0), MANAGER);
        assertEq(donationFactory.getDonationPoolBeneficiary(0), BENEFICIARY);
        assertEq(donationFactory.getDonationPoolContributorsCount(0), 0);
        assertEq(address(donationFactory), pool.getFactoryAddress());
    }

    ///////////////////
    // Pool Getters
    ///////////////////
    function testPoolGetters() public {
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);
        assertEq(pool.getCampaignManager(), MANAGER);
        assertEq(pool.getCampaignBeneficiary(), BENEFICIARY);
        assertEq(pool.getCampaignFee(), platformFee);
    }

    ///////////////////
    // Pool Deposit Eth
    ///////////////////
    function testPoolDepositRecordsUserDeposit() public {
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);
        // deposit
        uint256 depositAmount = 10 ether;
        vm.prank(USER1);
        pool.depositEth{value: depositAmount}();
        assertApproxEqAbs(pool.getUserDepositBalance(USER1), 10 ether, 2 wei);
    }

    function testPoolUserDepositUpdatesTotalBalance() public {
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);
        // deposit
        uint256 depositAmount = 10 ether;
        vm.prank(USER1);
        pool.depositEth{value: depositAmount}();
        assertApproxEqAbs(pool.getCampaignDepositBalance(), 10 ether, 2 wei);
    }

    function testPoolDepositRecordsUserAdditionalUser() public {
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);
        uint256 depositAmount = 10 ether;
        vm.prank(USER1);
        pool.depositEth{value: depositAmount}();
        assertEq(pool.getContributorCount(), 1);
        assertEq(pool.getContributorAddress(0), USER1);
        assertEq(pool.getUserContributorsIndex(USER1), 1); // user index is 1-indexed
    }

    ///////////////////
    // Pool Deposit StEth
    ///////////////////

    function testPoolRecordsStEthDepositWithPermit() public getStEth(USER1) {
        // 1. Add stETH balance to mock player
        // 2. Call steth contract to get player nonce
        // 3. Generate permit message for player to sign
        // 4. Sign off-chain permit
        // 5. Split signature into r, s, v & call deposit with permit
        // 6. Assert rafflePool records stETH deposit
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);

        // Generate message to sign, then sign by PLAYER, then split into r, s, v & pass to deposit with permit
        IERC20Permit stethPermit = IERC20Permit(steth);
        uint256 _nonce = stethPermit.nonces(USER1);
        SigUtils.Permit memory permit = SigUtils.Permit({
            owner: USER1,
            spender: poolAddress,
            value: 1e18,
            nonce: _nonce,
            deadline: block.timestamp + 1 days
        });
        bytes32 digest = sigUtils.getTypedDataHash(permit);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userPrivateKey, digest);
        vm.prank(USER1);
        pool.depositStEthWithPermit(1 ether, permit.deadline, v, r, s);
        // assert
        assertApproxEqAbs(pool.getUserDepositBalance(USER1), 1 ether, 2 wei);
    }

    ///////////////////
    // Pool Withdraw
    ///////////////////
    function testPoolRecordsUserWithdraw() public {
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);
        uint256 depositAmount = 10 ether;
        vm.prank(USER1);
        pool.depositEth{value: depositAmount}();
        // withdraw
        uint256 withdrawAmount = 5 ether;
        vm.prank(USER1);
        pool.withdrawStEth(withdrawAmount);
        assertApproxEqAbs(pool.getUserDepositBalance(USER1), 5 ether, 2 wei);
    }

    function testPoolUserWithdrawFailsIfInsufficientBalance() public {
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);
        uint256 depositAmount = 10 ether;
        vm.prank(USER1);
        pool.depositEth{value: depositAmount}();
        // withdraw
        uint256 withdrawAmount = 15 ether;
        vm.prank(USER1);
        vm.expectRevert(DonationPool.DonationPool__InsufficientStEthBalance.selector);
        pool.withdrawStEth(withdrawAmount);
        assertApproxEqAbs(pool.getUserDepositBalance(USER1), 10 ether, 2 wei);
    }

    ///////////////////
    // Pool Rewards
    ///////////////////
    function testPoolWithdrawRewardsRevertsIfNotManagerRole() public {
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);
        uint256 depositAmount = 10 ether;
        vm.prank(USER1);
        pool.depositEth{value: depositAmount}();
        // User attempts to withdraw rewards but doesn't have manager role
        vm.prank(USER2);
        vm.expectRevert();
        pool.withdrawRewards();
    }

    function testPoolWithdrawRewardsFailsIfInsufficientBalance() public {
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);
        uint256 depositAmount = 10 ether;
        vm.prank(USER1);
        pool.depositEth{value: depositAmount}();
        // Pool manager attempts to withdraw but no staking rewards
        vm.prank(MANAGER);
        vm.expectRevert(DonationPool.DonationPool__InsufficientRewardsBalance.selector);
        pool.withdrawRewards();
    }

    function testPoolWithdrawRewardsSuccessfulIfRewardsPositive() public {
        // test withdraw rewards works if all conditions are met
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);
        uint256 depositAmount = 10 ether;
        vm.prank(USER1);
        pool.depositEth{value: depositAmount}();
        // mock steth rebase
        stEthMock.rebase();

        // check rewards has increase
        assertGt(pool.getCampaignRewardsBalance(), 0);
        // withdraw rewards
        vm.prank(MANAGER);
        pool.withdrawRewards();
    }

    function testPoolWithdrawRewardsSendsFeeToFactoryContract() public {
        // test withdraw rewards works if all conditions are met
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);
        uint256 depositAmount = 10 ether;
        vm.prank(USER1);
        pool.depositEth{value: depositAmount}();
        // mock steth rebase
        stEthMock.rebase();
        // check rewards has increase
        assertGt(pool.getCampaignRewardsBalance(), 0);
        // withdraw rewards
        vm.prank(MANAGER);
        pool.withdrawRewards();

        // check factory balance has increased
        assertGt(donationFactory.getFactoryFeeBalance(), 0);
    }

    function testPoolWithdrawRewardsResetsPoolRewards() public {
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);
        uint256 depositAmount = 10 ether;
        vm.prank(USER1);
        pool.depositEth{value: depositAmount}();
        stEthMock.rebase();
        assertGt(pool.getCampaignRewardsBalance(), 0);
        // withdraw rewards
        vm.prank(MANAGER);
        pool.withdrawRewards();

        // check rewards balance is now zero
        assertApproxEqAbs(pool.getCampaignRewardsBalance(), 1, 1 wei);
    }

    ///////////////////
    // Pool Contributors Array
    ///////////////////
    function testPoolConributorsArrayNeverAddsDuplicateUser() public {
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);
        uint256 depositAmount = 10 ether;
        vm.prank(USER1);
        pool.depositEth{value: depositAmount}();
        uint256 numUsers = pool.getContributorCount();
        assertEq(numUsers, 1);
        // deposit again
        vm.prank(USER1);
        pool.depositEth{value: depositAmount}();
        assertEq(pool.getContributorCount(), numUsers);
    }

    function testPoolUserWithdrawalRemovesUserFromContributorsArray() public {
        // test that user is removed from contributors array when they withdraw
        _deployDonationPool();
        address poolAddress = donationFactory.getDonationPoolAddress(0);
        DonationPool pool = DonationPool(poolAddress);

        // deposit
        uint256 depositAmount = 10 ether;
        vm.prank(USER1);
        pool.depositEth{value: depositAmount}();
        assertEq(pool.getContributorCount(), 1);
        // withdraw
        assertEq(pool.getCampaignDepositBalance(), pool.getUserDepositBalance(USER1));
        uint256 userDepositBalance = pool.getUserDepositBalance(USER1);
        vm.prank(USER1);
        pool.withdrawStEth(userDepositBalance);
        assertEq(pool.getContributorCount(), 0);
    }
}
