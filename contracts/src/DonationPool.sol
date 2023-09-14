// Layout of Contract:
// version
// imports
// errors
// interfaces, libraries, contracts
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// internal & private view & pure functions
// external & public view & pure functions

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IERC20Permit} from "./interfaces/IERC20Permit.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract DonationPool is AccessControl {
    ///////////////////
    // Errors
    ///////////////////
    error DonationPool__NeedsMoreThanZero();
    error DonationPool__MintFailed();
    error DonationPool__StEthTransferFailed();
    error DonationPool__InsufficientRewardsBalance();
    error DonationPool__InsufficientStEthBalance();
    error DonationPool__WithdrawalFailed();
    error DonationPool__NotAuthorised();
    error ReentrancyGuardReentrantCall();
    ///////////////////
    // Type Declarations
    ///////////////////

    struct Campaign {
        address manager;
        address beneficiary;
        address[] contributors;
        uint256 totalDepositBalance;
        uint256 totalShares; // store total shares instead of total rewards, this can also be used to get live steth balance
    }

    ///////////////////
    // State Variables
    ///////////////////
    IERC20Permit private immutable i_stETH;
    uint256 private immutable i_platformFee;
    address private immutable i_factoryAddress;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    uint256 private locked = 1; // Solmate reentrancy guard
    Campaign private s_campaign;

    // map user address to campaignId mapping to deposit amount
    mapping(address => uint256) private s_userDeposit;
    mapping(address => uint256) private s_userIndex; // index of player in contributors array

    ///////////////////
    // Events
    ///////////////////
    event MintAndDepositSuccessful(address indexed depositor, uint256 amount, uint256 newBalance);
    event DepositSuccessful(address indexed depositor, uint256 amount, uint256 newBalance);
    event WithdrawSuccessful(address indexed withdrawer, uint256 amount, uint256 newBalance);
    event RewardsWithdrawSuccessful(address indexed withdrawer, uint256 amount);

    ///////////////////
    // Modifiers
    ///////////////////
    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert DonationPool__NeedsMoreThanZero();
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
    // Functions
    ///////////////////
    constructor(address steth, address _manager, address _beneficiary, uint256 _platformFee) {
        _grantRole(MANAGER_ROLE, _manager);
        i_stETH = IERC20Permit(steth);
        s_campaign = Campaign({
            manager: _manager,
            beneficiary: _beneficiary,
            contributors: new address[](0),
            totalDepositBalance: 0,
            totalShares: 0
        });
        i_platformFee = _platformFee;
        i_factoryAddress = msg.sender;
    }

    ///////////////////
    // External Functions
    ///////////////////

    function depositEth() external payable nonReentrant {
        uint256 beforeDeposit = i_stETH.balanceOf(address(this));
        (bool success,) = address(i_stETH).call{value: msg.value}("");
        // uint256 shares = i_stETH.submit{value: msg.value}(address(0));
        if (!success) revert DonationPool__MintFailed();
        uint256 afterDeposit = i_stETH.balanceOf(address(this));
        uint256 actualMintedAmount = afterDeposit - beforeDeposit;
        _addBalance(msg.sender, actualMintedAmount);
        emit MintAndDepositSuccessful(msg.sender, actualMintedAmount, s_campaign.totalDepositBalance);
    }

    function depositStEthWithPermit(uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        external
        nonReentrant
        moreThanZero(amount)
    {
        i_stETH.permit(msg.sender, address(this), amount, deadline, v, r, s);
        uint256 beforeDeposit = i_stETH.balanceOf(address(this));
        bool success = i_stETH.transferFrom(msg.sender, address(this), amount);
        if (!success) revert DonationPool__StEthTransferFailed();
        uint256 afterDeposit = i_stETH.balanceOf(address(this));
        uint256 actualAmount = afterDeposit - beforeDeposit;
        _addBalance(msg.sender, actualAmount);
        emit DepositSuccessful(msg.sender, actualAmount, s_userDeposit[msg.sender]);
    }

    function withdrawStEth(uint256 amount) external nonReentrant moreThanZero(amount) {
        if (s_userDeposit[msg.sender] < amount) {
            revert DonationPool__InsufficientStEthBalance();
        }
        // Update user deposit balance & emit event
        _subtractBalance(msg.sender, amount);
        emit WithdrawSuccessful(msg.sender, amount, s_userDeposit[msg.sender]);
        bool success = i_stETH.transfer(msg.sender, amount);
        if (!success) revert DonationPool__WithdrawalFailed();
    }

    function withdrawRewards() external nonReentrant {
        // calculate fee amount and send to factory contract
        _checkRole(MANAGER_ROLE, msg.sender);
        // update truthful rewards total
        uint256 poolBalance = i_stETH.balanceOf(address(this));
        // revert if donationAmount is < userDeposits
        if (poolBalance <= s_campaign.totalDepositBalance) revert DonationPool__InsufficientRewardsBalance();
        uint256 totalRewards = i_stETH.balanceOf(address(this)) - s_campaign.totalDepositBalance;
        // split staking rewards between platform fee and raffle prize
        uint256 platformFeeAmount = (totalRewards * i_platformFee) / 10000;
        uint256 donationAmount = totalRewards - platformFeeAmount;

        emit RewardsWithdrawSuccessful(s_campaign.beneficiary, donationAmount);
        bool feeSuccess = i_stETH.transfer(i_factoryAddress, platformFeeAmount);
        bool success = i_stETH.transfer(s_campaign.beneficiary, donationAmount);
        // revert if either withdrawal failed
        if (!success || !feeSuccess) revert DonationPool__WithdrawalFailed();
    }

    ///////////////////
    // Internal Functions
    ///////////////////
    function _addBalance(address userAddress, uint256 amount) internal {
        _addUser(msg.sender);
        s_userDeposit[userAddress] += amount;
        s_campaign.totalDepositBalance += amount;
    }

    function _subtractBalance(address userAddress, uint256 amount) internal {
        s_userDeposit[userAddress] -= amount;
        s_campaign.totalDepositBalance -= amount;
        _removeUser(msg.sender);
    }

    // This function can be called before updating the s_userDeposit for a deposit operation
    function _addUser(address _user) internal {
        if (s_userDeposit[_user] == 0) {
            s_campaign.contributors.push(_user);
            s_userIndex[_user] = s_campaign.contributors.length; // Arrays are 1-indexed in the context of this solution
        }
    }

    // This function can be called after updating the s_userDeposit for a withdrawal operation
    function _removeUser(address _user) internal {
        if (s_userDeposit[_user] == 0) {
            uint256 indexToRemove = s_userIndex[_user] - 1; // Adjust for 0-indexed array
            address lastAddress = s_campaign.contributors[s_campaign.contributors.length - 1];

            // Swap with the last element if not already the last one
            if (indexToRemove != s_campaign.contributors.length - 1) {
                s_campaign.contributors[indexToRemove] = lastAddress;
                s_userIndex[lastAddress] = indexToRemove + 1; // Adjust for 1-indexed mapping
            }

            s_campaign.contributors.pop();
            delete s_userIndex[_user];
        }
    }

    ///////////////////
    // Private Functions
    ///////////////////

    ///////////////////
    // Getters
    ///////////////////

    function getCampaignManager() external view returns (address) {
        return s_campaign.manager;
    }

    function getCampaignBeneficiary() external view returns (address) {
        return s_campaign.beneficiary;
    }

    function getContributorCount() external view returns (uint256) {
        return s_campaign.contributors.length;
    }

    function getContributorAddress(uint256 index) external view returns (address) {
        return s_campaign.contributors[index];
    }

    function getCampaignDepositBalance() external view returns (uint256) {
        return s_campaign.totalDepositBalance;
    }

    function getCampaignRewardsBalance() external view returns (uint256) {
        return i_stETH.balanceOf(address(this)) - s_campaign.totalDepositBalance;
    }

    function getUserDepositBalance(address userAddress) external view returns (uint256) {
        return s_userDeposit[userAddress];
    }

    function getUserContributorsIndex(address userAddress) external view returns (uint256) {
        return s_userIndex[userAddress];
    }

    function getFactoryAddress() external view returns (address) {
        return i_factoryAddress;
    }

    function getCampaignFee() external view returns (uint256) {
        return i_platformFee;
    }
}
