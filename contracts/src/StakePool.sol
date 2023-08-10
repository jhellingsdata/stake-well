// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error TransferFailed();

// Contract should only hold stETH, but users should be able to deposit ETH or stETH.
// If a user deposits ETH, the contract should convert it to stETH by calling Lido's stETH contract.
// The contract should track the amount of stETH deposited by each user, and allow them to withdraw it.
// stETH rebases daily to account for staking rewards, so the contract should track the amount of stETH deposited by each user at the time of deposit.
// The user can only withdraw the amount they deposited, so additional stETH rewards will be left in the contract.
// If a user withdraws stETH, the contract should burn the stETH and send ETH to the user.
// ALternatively, the user can withdraw stETH as stETH into their wallet.

contract StakePool {
    ///////////////////
    // Errors
    error StakePool__MintFailed();
    error StakePool__NeedsMoreThanZero();
    error StakePool__InsufficientStETHBalance();

    ///////////////////
    // State Variables
    ///////////////////
    IERC20 public stETH;

    uint256 public userDepositsTotal;
    uint256 public stakingRewardsTotal;

    /// @dev Mapping of user address to their deposit amount (in stETH)
    mapping(address => uint256) private userDeposits;

    ///////////////////
    // Functions
    ///////////////////
    constructor(address _stETH) {
        stETH = IERC20(_stETH);
    }

    ///////////////////
    // External Functions
    ///////////////////
    function depositETH() external payable returns (bool) {
        // Save stETH contract balance before deposit
        uint256 oldBalance = stETH.balanceOf(address(this));

        // TODO: Write the logic to deposit ETH and convert it to stETH
        if (msg.value == 0) revert StakePool__NeedsMoreThanZero();
        (bool success, ) = address(stETH).call{value: msg.value}("");
        if (!success) revert StakePool__MintFailed();

        // Check the contract's stETH balance after the deposit
        uint256 newBalance = stETH.balanceOf(address(this));

        // Calculate the amount of stETH minted
        uint256 mintedStETH = newBalance - oldBalance;

        // Update the user's deposited balance
        userDeposits[msg.sender] += mintedStETH;

        // Update total user deposits
        userDepositsTotal += mintedStETH;

        // Update total staking rewards
        stakingRewardsTotal = totalBalance() - userDepositsTotal;

        return success;
    }

    function withdrawETH(uint256 amount) external {
        // TODO: Write the logic to burn stETH and withdraw ETH
    }

    /* Withdraw as stETH */
    function withdrawStETH(uint256 amount) external {
        // Check that the user has enough stETH deposited
        if (userDeposits[msg.sender] < amount)
            revert StakePool__InsufficientStETHBalance();

        // Transfer stETH from this contract to the user
        stETH.transfer(msg.sender, amount);

        // Update the user's deposited balance
        userDeposits[msg.sender] -= amount;

        // Update total user deposits
        userDepositsTotal -= amount;

        // Update total staking rewards
        stakingRewardsTotal = totalBalance() - userDepositsTotal;
    }

    ///////////////////
    // Public Functions
    ///////////////////

    /* Return total stETH contract balance */
    function totalBalance() public view returns (uint256) {
        return stETH.balanceOf(address(this));
    }

    /* Return user's stETH contract balance */
    function balanceOf(address user) public view returns (uint256) {
        return userDeposits[user];
    }
}
