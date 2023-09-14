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
    StEthMock stEthMock;

    uint256 ownerKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint256 platformFee;
    address steth;
    address public BENEFICIARY;
    address public MANAGER;
    address public USER1;
    address public USER2;

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
        BENEFICIARY = vm.addr(0x123);
        MANAGER = vm.addr(0x234);
        USER1 = vm.addr(0x456);
        USER2 = vm.addr(0x789);
        vm.deal(MANAGER, 10 ether);
        vm.deal(MANAGER, 10 ether);
        vm.deal(MANAGER, 10 ether);
    }

    function testFactoryCreatesDonationPool() public {
        // create donation pool
        string memory title = "test";
        vm.prank(MANAGER);
        donationFactory.createDonationPool(MANAGER, BENEFICIARY, title);
        // check donation pool created
        assertEq(donationFactory.getDonationPoolsCount(), 1);

        // assertEq(donationPool.beneficiary(), BENEFICIARY);
        // assertEq(donationPool.title(), title);
        // assertEq(donationPool.manager(), address(this));
        // assertEq(donationPool.stETH(), address(stEthMock));
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
}
