// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IERC20Permit} from "../../src/IERC20Permit.sol";

contract TestRafflePool {
    ///////////////////
    // Errors
    ///////////////////
    error RafflePool__NeedsMoreThanZero();
    error RafflePool__MintFailed();
    error RafflePool__InsufficientAllowance();
    error RafflePool__StEthTransferFailed();
    error RafflePool__WithdrawalFailed();
    error RafflePool__InsufficientStEthBalance();

    ///////////////////
    // Type Declarations
    ///////////////////
    struct BalanceLog {
        uint256 balance; // User deposit balance at that timestamp
        uint256 timestamp; // Block timestamp when the transaction occurred
    }

    ///////////////////
    // State Variables
    ///////////////////
    IERC20Permit private immutable i_stETH;

    uint256 private s_totalUserDeposits;
    uint256 private s_stakingRewardsTotal;

    mapping(address => uint256) private s_userDeposit;
    mapping(address => BalanceLog[]) private s_userTwabs;
    address[] private s_activeUsers;
    address[] private s_tempActiveUsers;
    BalanceLog[] private s_totalDepositTwabs; // array for tracking total deposit balance TWAB over time

    // Events
    event MintAndDepositSuccessful(address indexed depositor, uint256 amount);
    event WithdrawSuccessful(address indexed withdrawer, uint256 amount);
    event StakingRewardsUpdated(uint256 newRewardsTotal);
    ///////////////////
    // Modifiers
    ///////////////////

    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert RafflePool__NeedsMoreThanZero();
        }
        _;
    }

    // Functions
    constructor(address steth) {
        i_stETH = IERC20Permit(steth);
    }

    ///////////////////
    // External Functions
    ///////////////////
    function depositEth() external payable moreThanZero(msg.value) {
        _addUser(msg.sender);
        uint256 beforeDeposit = i_stETH.balanceOf(address(this));
        (bool success,) = address(i_stETH).call{value: msg.value}("");
        if (!success) revert RafflePool__MintFailed();
        uint256 afterDeposit = i_stETH.balanceOf(address(this));
        uint256 actualMintedAmount = afterDeposit - beforeDeposit;
        _addBalance(msg.sender, actualMintedAmount);
        _updateBalanceLogs(msg.sender);
        emit MintAndDepositSuccessful(msg.sender, actualMintedAmount);
    }

    function depositStEth(uint256 amount) external moreThanZero(amount) {
        // Ensure the allowance is sufficient
        uint256 allowance = i_stETH.allowance(msg.sender, address(this));
        if (allowance < amount) revert RafflePool__InsufficientAllowance();
        _addUser(msg.sender);
        _addBalance(msg.sender, amount);
        _updateBalanceLogs(msg.sender);
        bool success = i_stETH.transferFrom(msg.sender, address(this), amount);
        if (!success) revert RafflePool__StEthTransferFailed();
    }

    function depositStEthWithPermit(uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        external
        moreThanZero(amount)
    {
        _addUser(msg.sender);
        _addBalance(msg.sender, amount);
        _updateBalanceLogs(msg.sender);
        i_stETH.permit(msg.sender, address(this), amount, deadline, v, r, s);
        bool success = i_stETH.transferFrom(msg.sender, address(this), amount);
        if (!success) revert RafflePool__StEthTransferFailed();
    }

    function withdrawStEth(uint256 amount) external moreThanZero(amount) {
        if (s_userDeposit[msg.sender] < amount) {
            revert RafflePool__InsufficientStEthBalance();
        }
        // Update user deposit balance & total deposit balance & logs
        _subtractBalance(msg.sender, amount);
        _updateBalanceLogs(msg.sender);
        bool success = i_stETH.transfer(msg.sender, amount);
        if (!success) revert RafflePool__WithdrawalFailed();
        emit WithdrawSuccessful(msg.sender, amount);
    }

    // Called periodically to update the staking rewards, could add to performUpkeep
    function updateStakingRewards() external {
        uint256 currentBalance = i_stETH.balanceOf(address(this));
        uint256 expectedBalance = s_totalUserDeposits + s_stakingRewardsTotal;

        if (currentBalance > expectedBalance) {
            s_stakingRewardsTotal += currentBalance - expectedBalance;
            emit StakingRewardsUpdated(s_stakingRewardsTotal);
        }
    }
    ///////////////////
    // Internal Functions
    ///////////////////

    function _addUser(address userAddress) internal {
        // If user is depositing for the first time, add them to active users list
        if (s_userDeposit[userAddress] == 0) {
            s_activeUsers.push(userAddress);
        }
    }

    function _addBalance(address userAddress, uint256 amount) internal {
        s_userDeposit[userAddress] += amount;
        s_totalUserDeposits += amount;
    }

    function _subtractBalance(address userAddress, uint256 amount) internal {
        s_userDeposit[userAddress] -= amount;
        s_totalUserDeposits -= amount;
    }

    function _updateBalanceLogs(address userAddress) internal {
        s_userTwabs[userAddress].push(BalanceLog({balance: s_userDeposit[userAddress], timestamp: block.timestamp}));
        s_totalDepositTwabs.push(BalanceLog(s_totalUserDeposits, block.timestamp));
    }

    // internal & private view & pure functions
    function _cleanupUsers() internal {
        // Replace s_players with s_tempActivePlayers
        s_activeUsers = s_tempActiveUsers;
        // Clear the temporary array for the next raffle
        delete s_tempActiveUsers;
        // Reinitialise the temporary array
        s_tempActiveUsers = new address[](0);
    }

    // Temporarily public
    function calculateTwab(address userAddress, uint256 startTime, uint256 endTime) public view returns (uint256) {
        BalanceLog[] storage twabs; // pointer to storage-based arrays
        if (userAddress == address(0)) {
            twabs = s_totalDepositTwabs;
        } else {
            twabs = s_userTwabs[userAddress];
        }

        uint256 precedingIndex = findPrecedingTimeStampIndex(twabs, startTime);

        uint256 balanceCumulative = 0;
        uint256 prevTimeStamp = startTime;
        uint256 prevBalance = precedingIndex == type(uint256).max ? 0 : twabs[precedingIndex].balance;

        // Reset precedingIndex for the loop if it was set to max value
        if (precedingIndex == type(uint256).max) {
            precedingIndex = ~precedingIndex; // This will set it to -1 when interpreted as a signed integer
        }

        for (uint256 i = precedingIndex + 1; i < twabs.length; i++) {
            if (twabs[i].timestamp > endTime) {
                break;
            }

            uint256 duration = uint256(twabs[i].timestamp - prevTimeStamp);
            balanceCumulative += prevBalance * duration;

            prevTimeStamp = twabs[i].timestamp;
            prevBalance = twabs[i].balance;
        }

        uint256 finalDuration = uint256(endTime - prevTimeStamp);
        balanceCumulative += prevBalance * finalDuration;

        return balanceCumulative / (endTime - startTime);
    }

    function findPrecedingTimeStampIndex(BalanceLog[] storage twabs, uint256 _s_lastTimeStamp)
        internal
        view
        returns (uint256)
    {
        if (twabs.length == 0) {
            return type(uint256).max; // Empty array case
        }

        if (twabs[0].timestamp > _s_lastTimeStamp) {
            return type(uint256).max; // joined after current period
        }

        uint256 start = 0;
        uint256 end = twabs.length - 1;
        uint256 mid;
        uint256 result = type(uint256).max; // Initialising with "not found" value

        while (start <= end) {
            mid = start + (end - start) / 2;

            if (twabs[mid].timestamp <= _s_lastTimeStamp) {
                result = mid; // Found a potential preceding timestamp
                start = mid + 1;
            } else {
                if (mid == 0) {
                    break; // Prevents underflow
                }
                end = mid - 1;
            }
        }
        return result;
    }

    // Getter Functions
    function getTotalBalance() external view returns (uint256) {
        return i_stETH.balanceOf(address(this));
    }

    function getUserDeposit(address user) external view returns (uint256) {
        return s_userDeposit[user];
    }

    function getTotalUserDeposits() external view returns (uint256) {
        return s_totalUserDeposits;
    }

    function getStakingRewardsTotal() external view returns (uint256) {
        return s_stakingRewardsTotal;
    }

    function getActiveDepositors() external view returns (address[] memory) {
        return s_activeUsers;
    }

    function getActiveDepositorsCount() external view returns (uint256) {
        return s_activeUsers.length;
    }

    // Temporary getters
    function getUserBalanceLog(address user) external view returns (BalanceLog[] memory) {
        return s_userTwabs[user];
    }

    function getTotalBalanceLog() external view returns (BalanceLog[] memory) {
        return s_totalDepositTwabs;
    }
}
