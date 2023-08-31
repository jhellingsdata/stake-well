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

contract CharityPool is AccessControl {
    ///////////////////
    // Errors
    ///////////////////
    error RafflePool__NeedsMoreThanZero();
    error RafflePool__MintFailed();
    error RafflePool__StEthTransferFailed();
    error RafflePool__InsufficientAllowance();
    error RafflePool__InsufficientStEthBalance();
    error RafflePool__WithdrawalFailed();

    ///////////////////
    // Type Declarations
    ///////////////////
    struct Campaign {
        address manager;
        address beneficiary;
        address[] contributors;
        uint256 totalDepositBalance;
        uint256 totalRewards;
    }

    ///////////////////
    // State Variables
    ///////////////////
    IERC20Permit private immutable i_stETH;

    // map user address to campaignId mapping to deposit amount
    mapping(address => mapping(uint256 => uint256)) private s_userDeposit;
    mapping(uint256 => uint256) private s_totalUserDeposits;

    mapping(address => uint256) private s_playerIndex; // index of player in contributors array

    ///////////////////
    // Events
    ///////////////////
    event WithdrawSuccessful(address indexed withdrawer, uint256 amount);

    ///////////////////
    // Modifiers
    ///////////////////
    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert RafflePool__NeedsMoreThanZero();
        }
        _;
    }

    ///////////////////
    // Functions
    ///////////////////
    constructor(address steth) {
        i_stETH = IERC20Permit(steth);
    }

    ///////////////////
    // External Functions
    ///////////////////

    function depositEth(uint256 campaignId) external payable {
        uint256 beforeDeposit = i_stETH.balanceOf(address(this));
        (bool success,) = address(i_stETH).call{value: msg.value}("");
        if (!success) revert RafflePool__MintFailed();
        uint256 afterDeposit = i_stETH.balanceOf(address(this));
        uint256 actualMintedAmount = afterDeposit - beforeDeposit;
        _addBalance(msg.sender, campaignId, actualMintedAmount);
    }

    function depositStEth(uint256 campaignId, uint256 amount) external moreThanZero(amount) {
        // Ensure the allowance is sufficient
        uint256 allowance = i_stETH.allowance(msg.sender, address(this));
        if (allowance < amount) revert RafflePool__InsufficientAllowance();
        _addBalance(msg.sender, campaignId, amount);
        bool success = i_stETH.transferFrom(msg.sender, address(this), amount);
        if (!success) revert RafflePool__StEthTransferFailed();
    }

    function depositStEthWithPermit(uint256 campaignId, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        external
        moreThanZero(amount)
    {
        _addBalance(msg.sender, campaignId, amount);
        i_stETH.permit(msg.sender, address(this), amount, deadline, v, r, s);
        bool success = i_stETH.transferFrom(msg.sender, address(this), amount);
        if (!success) revert RafflePool__StEthTransferFailed();
    }

    function withdrawStEth(uint256 campaignId, uint256 amount) external moreThanZero(amount) {
        if (s_userDeposit[msg.sender][campaignId] < amount) {
            revert RafflePool__InsufficientStEthBalance();
        }
        // Update user deposit balance & total deposit balance & logs
        _subtractBalance(msg.sender, campaignId, amount);
        bool success = i_stETH.transfer(msg.sender, amount);
        if (!success) revert RafflePool__WithdrawalFailed();
        emit WithdrawSuccessful(msg.sender, amount);
    }

    ///////////////////
    // Public Functions
    ///////////////////

    ///////////////////
    // Internal Functions
    ///////////////////
    function _addBalance(address userAddress, uint256 campaignId, uint256 amount) internal {
        s_userDeposit[userAddress][campaignId] += amount;
        s_totalUserDeposits[campaignId] += amount;
    }

    function _subtractBalance(address userAddress, uint256 campaignId, uint256 amount) internal {
        s_userDeposit[userAddress][campaignId] -= amount;
        s_totalUserDeposits[campaignId] -= amount;
    }

    // This function can be called before updating the s_userDeposit for a deposit operation
    function _addPlayer(address _user) internal {
        if (s_userDeposit[_user] == 0) {
            s_activeUsers.push(_user);
            s_playerIndex[_user] = s_activeUsers.length; // Arrays are 1-indexed in the context of this solution
        }
    }

    // This function can be called after updating the s_userDeposit for a withdrawal operation
    function _removePlayer(address _user) internal {
        if (s_userDeposit[_user] == 0) {
            uint256 indexToRemove = s_playerIndex[_user] - 1; // Adjust for 0-indexed array
            address lastAddress = s_activeUsers[s_activeUsers.length - 1];

            // Swap with the last element if not already the last one
            if (indexToRemove != s_activeUsers.length - 1) {
                s_activeUsers[indexToRemove] = lastAddress;
                s_playerIndex[lastAddress] = indexToRemove + 1; // Adjust for 1-indexed mapping
            }

            s_activeUsers.pop();
            delete s_playerIndex[_user];
        }
    }

    ///////////////////
    // Private Functions
    ///////////////////
}
