// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IERC20Permit} from "./interfaces/IERC20Permit.sol";
import {DonationPool} from "./DonationPool.sol";

contract DonationFactory {
    ///////////////////
    // Errors
    ///////////////////
    error DonationFactory__NotAuthorisedToCreate();
    error DonationFactory__WithdrawalFailed();
    error DonationFactory__ExceedsMaxProtocolFee();
    error ReentrancyGuardReentrantCall();

    ///////////////////
    // State Variables
    ///////////////////
    IERC20Permit private immutable i_stETH;
    address private immutable i_owner;
    mapping(address => uint256) public donationPoolIndex;
    DonationPool[] private s_donationPools;
    uint256 private s_platformFee;
    uint256 private locked = 1; // Solmate reentrancy guard

    ///////////////////
    // Events
    ///////////////////
    event DonationPoolCreated(
        address indexed donationPool, address indexed beneficiary, uint256 indexed poolIndex, string title
    );
    event ProtocolFeeWithdrawn(uint256 amount);
    event ProtocolFeeAdjusted(uint256 newFee);

    ///////////////////
    // Modifiers    //
    ///////////////////
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert DonationFactory__NotAuthorisedToCreate();
        }
        _;
    }

    modifier nonReentrant() virtual {
        if (locked == 2) {
            revert ReentrancyGuardReentrantCall();
        }
        locked = 2;
        _;
        locked = 1;
    }

    ///////////////////
    // Functions     //
    ///////////////////
    constructor(address steth, uint256 platformFee) {
        i_owner = msg.sender;
        i_stETH = IERC20Permit(steth);
        s_platformFee = platformFee;
    }

    ///////////////////
    // External Functions
    ///////////////////
    function createDonationPool(address _manager, address _beneficiary, string memory _title) external {
        DonationPool newDonationPool = new DonationPool(address(i_stETH), _manager, _beneficiary, s_platformFee);
        s_donationPools.push(newDonationPool);
        emit DonationPoolCreated(address(newDonationPool), _beneficiary, s_donationPools.length - 1, _title);
    }

    function withdrawPlatformFee() external onlyOwner {
        uint256 platformFeeBalance = i_stETH.balanceOf(address(this));
        emit ProtocolFeeWithdrawn(platformFeeBalance);
        bool success = i_stETH.transfer(msg.sender, platformFeeBalance);
        if (!success) revert DonationFactory__WithdrawalFailed();
    }

    function adjustPlatformFee(uint256 newFee) external onlyOwner {
        _adjustPlatformFee(newFee);
    }

    ///////////////////
    // Internal Functions
    ///////////////////
    function _adjustPlatformFee(uint256 newFee) internal {
        // fee must be between 0 -> 15%
        if (newFee > 1500) {
            revert DonationFactory__ExceedsMaxProtocolFee();
        }
        s_platformFee = newFee;
        emit ProtocolFeeAdjusted(newFee);
    }

    ///////////////////
    // Getter Functions
    ///////////////////
    function getDonationPoolsCount() external view returns (uint256) {
        return s_donationPools.length;
    }

    function getDonationPoolAddress(uint256 index) external view returns (address) {
        return address(s_donationPools[index]);
    }

    function getDonationPoolIndex(address _donationPool) external view returns (uint256) {
        return donationPoolIndex[_donationPool];
    }

    function getDonationPoolBeneficiary(uint256 _index) external view returns (address) {
        return s_donationPools[_index].getCampaignBeneficiary();
    }

    function getDonationPoolManager(uint256 _index) external view returns (address) {
        return s_donationPools[_index].getCampaignManager();
    }

    function getDonationPoolContributorsCount(uint256 _index) external view returns (uint256) {
        return s_donationPools[_index].getContributorCount();
    }

    function getDonationPoolDepositBalance(uint256 _index) external view returns (uint256) {
        return s_donationPools[_index].getCampaignDepositBalance();
    }

    function getCampaignRewardsBalance(uint256 _index) external view returns (uint256) {
        return i_stETH.balanceOf(address(s_donationPools[_index])) - s_donationPools[_index].getCampaignDepositBalance();
    }

    function getCurrentPlatformFee() external view returns (uint256) {
        return s_platformFee;
    }

    function getFactoryFeeBalance() external view returns (uint256) {
        return i_stETH.balanceOf(address(this));
    }
}
