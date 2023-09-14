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
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DonationPool is AccessControl, ReentrancyGuard {
    ///////////////////
    // Errors
    ///////////////////
    error DonationPool__NeedsMoreThanZero();
    error DonationPool__MintFailed();
    error DonationPool__StEthTransferFailed();
    error DonationPool__InsufficientAllowance();
    error DonationPool__InsufficientStEthBalance();
    error DonationPool__WithdrawalFailed();
    error DonationPool__NotAuthorised();

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

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
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

    ///////////////////
    // Functions
    ///////////////////
    constructor(address steth, address _manager, address _beneficiary) {
        _grantRole(MANAGER_ROLE, _manager);
        i_stETH = IERC20Permit(steth);
        s_campaign = Campaign({
            manager: _manager,
            beneficiary: _beneficiary,
            contributors: new address[](0),
            totalDepositBalance: 0,
            totalShares: 0
        });
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

    function depositStEth(uint256 amount) external nonReentrant moreThanZero(amount) {
        // Ensure the allowance is sufficient
        uint256 allowance = i_stETH.allowance(msg.sender, address(this));
        if (allowance < amount) revert DonationPool__InsufficientAllowance();
        uint256 beforeDeposit = i_stETH.balanceOf(address(this));
        bool success = i_stETH.transferFrom(msg.sender, address(this), amount);
        if (!success) revert DonationPool__StEthTransferFailed();
        uint256 afterDeposit = i_stETH.balanceOf(address(this));
        uint256 actualAmount = afterDeposit - beforeDeposit;
        _addBalance(msg.sender, actualAmount);
        emit DepositSuccessful(msg.sender, actualAmount, s_userDeposit[msg.sender]);
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

    function endCampaign() external {
        // How should we handle someone ending a campaign? What should we do with user deposits?
        // To end a campaign:
        // 1. Manager withdrawals all rewards (if any) to beneficiary
        // 2. Manager initiates transfer of user deposits back to user's wallets
    }

    function withdrawRewards() external {
        _checkRole(MANAGER_ROLE, msg.sender);
        // update truthful rewards total
        uint256 totalRewards = i_stETH.balanceOf(address(this)) - s_campaign.totalDepositBalance;
        bool success = i_stETH.transfer(s_campaign.beneficiary, totalRewards);
        if (!success) revert DonationPool__WithdrawalFailed();
        emit RewardsWithdrawSuccessful(s_campaign.beneficiary, totalRewards);
    }

    ///////////////////
    // Public Functions
    ///////////////////

    ///////////////////
    // Internal Functions
    ///////////////////
    function _addBalance(address userAddress, uint256 amount) internal {
        s_userDeposit[userAddress] += amount;
        s_campaign.totalDepositBalance += amount;
    }

    function _subtractBalance(address userAddress, uint256 amount) internal {
        s_userDeposit[userAddress] -= amount;
        s_campaign.totalDepositBalance -= amount;
    }

    // This function can be called before updating the s_userDeposit for a deposit operation
    function _addPlayer(address _user) internal {
        if (s_userDeposit[_user] == 0) {
            s_campaign.contributors.push(_user);
            s_userIndex[_user] = s_campaign.contributors.length; // Arrays are 1-indexed in the context of this solution
        }
    }

    // This function can be called after updating the s_userDeposit for a withdrawal operation
    function _removePlayer(address _user) internal {
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
}
