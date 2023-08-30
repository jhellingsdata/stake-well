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

import {IERC20Permit} from "./IERC20Permit.sol";
import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import {VRFConsumerBaseV2} from "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title An stETH no-loss RafflePool Contract
 * @author J. Hellings
 * @notice This contract is for creating a staking raffle vault/pool for stETH.
 * @notice stETH staking rewards are used for no-loss raffle.
 * @notice This will duplicate our vault functionality from `StakePool.sol`.
 * @dev Implements Chainlink VRFv2 for random number generation.
 */

contract RafflePool is VRFConsumerBaseV2, Ownable {
    ///////////////////
    // Errors
    ///////////////////
    error RafflePool__NeedsMoreThanZero();
    error RafflePool__MintFailed();
    error RafflePool__InsufficientAllowance();
    error RafflePool__StEthTransferFailed();
    error RafflePool__WithdrawalFailed();
    error RafflePool__InsufficientStEthBalance();
    error RafflePool__UpkeepNotNeeded(uint256 raffleBalance, uint256 raffleState);

    ///////////////////
    // Type Declarations
    ///////////////////
    enum RaffleState {
        OPEN,
        CALCULATING // Waiting for Chainlink VRF
    }

    // track TWABs for each user, represents a user's balance at a particular time
    struct BalanceLog {
        uint256 balance;
        uint256 timestamp;
    }

    ///////////////////
    // State Variables
    ///////////////////
    IERC20Permit private immutable i_stETH;
    /* VRF Variables */
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    // uint32 private constant NUM_WORDS = 1;
    uint32 private immutable i_callbackGasLimit;
    uint32 private immutable i_numWords; // Can change to facilitate multi-strategy raffles, e.g. multiple winners
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;

    /* Raffle Variables */
    uint256 private s_totalUserDeposits;
    uint256 private s_stakingRewardsTotal;
    address[] private s_activeUsers;
    address[] private s_tempActiveUsers;
    mapping(address => uint256) private s_userDeposit;
    mapping(address => uint256) private s_lastActiveTimestamp;

    // map user address to BalanceLogs array, to be updated with each transaction
    mapping(address => BalanceLog[]) private s_userTwabs;
    BalanceLog[] private s_totalDepositTwabs; // array for tracking total deposit balance over time

    // @dev Duration of the raffle in seconds
    uint256 private immutable i_interval;

    uint256 private s_lastTimestamp;
    address private s_recentWinner;
    RaffleState private s_raffleState;

    ///////////////////
    // Events
    ///////////////////
    event MintAndDepositSuccessful(address indexed depositor, uint256 amount);
    event WithdrawSuccessful(address indexed withdrawer, uint256 amount);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event PickedWinner(address indexed winner, uint256 amount);
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

    ///////////////////
    // Functions
    ///////////////////
    constructor(
        address steth,
        uint256 interval,
        address vrfCoordinatorV2,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint32 numWords
    ) VRFConsumerBaseV2(vrfCoordinatorV2) Ownable(msg.sender) {
        i_stETH = IERC20Permit(steth);
        i_interval = interval;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_numWords = numWords;
        s_raffleState = RaffleState.OPEN;
        s_lastTimestamp = block.timestamp;
    }

    ///////////////////
    // External Functions
    ///////////////////
    /*
    * @notice Likely need to add reentrancy guard, can't follow checks-effects-interactions pattern
    */
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

    function pickWinner() external onlyOwner {
        // if ((block.timestamp - s_lastTimestamp) < i_interval) {
        //     revert();
        // }
        s_raffleState = RaffleState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, // gas lane
            i_subscriptionId, // id that's funded with link
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            i_numWords
        );
        emit RequestedRaffleWinner(requestId);
    }

    function performUpkeep(bytes calldata /* performData */ ) external {
        (bool upkeepNeeded,) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert RafflePool__UpkeepNotNeeded(s_stakingRewardsTotal, uint256(s_raffleState));
        }
        s_stakingRewardsTotal = i_stETH.balanceOf(address(this)) - s_totalUserDeposits;
        s_raffleState = RaffleState.CALCULATING;
        i_vrfCoordinator.requestRandomWords(
            i_gasLane, // gas lane
            i_subscriptionId, // id that's funded with link
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            i_numWords
        );
    }

    ///////////////////
    // Public Functions
    ///////////////////

    // Called periodically to update the staking rewards
    function updateStakingRewards() external {
        uint256 currentBalance = i_stETH.balanceOf(address(this));
        uint256 expectedBalance = s_totalUserDeposits + s_stakingRewardsTotal;

        if (currentBalance > expectedBalance) {
            s_stakingRewardsTotal += currentBalance - expectedBalance;
            emit StakingRewardsUpdated(s_stakingRewardsTotal);
        }
    }

    /*
    * @dev Used by Chainlink Automation nodes call to determine if the contract needs upkeep.
    * The following should be true for this to return true:
    * 1. Time interval has passed between raffle run
    * 2. Raffle is open
    * 3. The contract has staking rewards
    * 4. (Implicit) The subscription is funded with LINK
    */
    function checkUpkeep(bytes memory /* checkData */ )
        public
        view
        returns (bool upkeepNeeded, bytes memory /* performData */ )
    {
        bool timePassed = (block.timestamp - s_lastTimestamp) >= i_interval;
        bool isOpen = RaffleState.OPEN == s_raffleState;
        bool hasBalance = s_stakingRewardsTotal > 0;
        bool hasUsers = s_activeUsers.length > 0;
        upkeepNeeded = timePassed && isOpen && hasBalance && hasUsers;
        return (upkeepNeeded, "0x0");
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
        s_lastActiveTimestamp[userAddress] = block.timestamp; // May be rudundant
        s_userTwabs[userAddress].push(BalanceLog({balance: s_userDeposit[userAddress], timestamp: block.timestamp}));
        s_totalDepositTwabs.push(BalanceLog(s_totalUserDeposits, block.timestamp));
    }

    function fulfillRandomWords(uint256, /* requestId */ uint256[] memory randomWords) internal override {
        // 1. Calculate the sum of all TWABs for the time period of interest (`totalTWAB`).
        // 2. Scale the random number from Chainlink VRF to the range `[0, totalTWAB]` using modulo (`%`). This will give us a "ticket number" in the virtual array.
        // 3. Iterate over users, summing their TWABs, until the sum exceeds the ticket number. The current user is the winner.

        uint256 totalTwab = calculateTwab(address(0), s_lastTimestamp, block.timestamp);
        uint256 scaledNumber = (randomWords[0] % totalTwab);
        // Initialise a running total of TWABs
        uint256 runningTotal = 0;
        address winner;
        for (uint256 i = 0; i < s_activeUsers.length; i++) {
            // Calculate TWAB only if a winner has not been found
            if (winner == address(0)) {
                runningTotal += calculateTwab(s_activeUsers[i], s_lastTimestamp, block.timestamp);
                // If the running total exceeds the ticket number and a winner has not yet been determined, set this user as the winner
                if (runningTotal > scaledNumber && winner == address(0)) {
                    winner = s_activeUsers[i];
                }
            }
            // If user balance == 0, remove them from the active users list
            if (s_userDeposit[s_activeUsers[i]] != 0) {
                s_tempActiveUsers.push(s_activeUsers[i]);
            }
        }
        // After determining the winner
        _cleanupUsers();
        s_raffleState = RaffleState.OPEN;
        // Update the last timestamp for next raffle
        s_lastTimestamp = block.timestamp;
        // Allocate stETH raffle rewards to winning user
        // ToDo: consider case if winning user has 0 balance, will still have been removed from active users list
        s_userDeposit[winner] += s_stakingRewardsTotal;
        s_recentWinner = winner;
        emit PickedWinner(winner, s_stakingRewardsTotal);
    }

    // // This function can be called before updating the s_userDeposit for a deposit operation
    // function _addPlayer(address _user) internal {
    //     if (s_userDeposit[_user] == 0) {
    //         s_activeUsers.push(_user);
    //         s_playerIndex[_user] = s_activeUsers.length; // Arrays are 1-indexed in the context of this solution
    //     }
    // }

    // // This function can be called after updating the s_userDeposit for a withdrawal operation
    // function _removePlayer(address _user) internal {
    //     if (s_userDeposit[_user] == 0) {
    //         uint256 indexToRemove = s_playerIndex[_user] - 1; // Adjust for 0-indexed array
    //         address lastAddress = s_activeUsers[s_activeUsers.length - 1];

    //         // Swap with the last element if not already the last one
    //         if (indexToRemove != s_activeUsers.length - 1) {
    //             s_activeUsers[indexToRemove] = lastAddress;
    //             s_playerIndex[lastAddress] = indexToRemove + 1; // Adjust for 1-indexed mapping
    //         }

    //         s_activeUsers.pop();
    //         delete s_playerIndex[_user];
    //     }
    // }

    // Temporarily public
    function calculateTwab(address userAddress, uint256 s_startTime, uint256 s_endTime) public view returns (uint256) {
        BalanceLog[] storage twabs; // pointer to storage-based arrays
        if (userAddress == address(0)) {
            twabs = s_totalDepositTwabs;
        } else {
            twabs = s_userTwabs[userAddress];
        }

        uint256 precedingIndex = findPrecedingTimestampIndex(twabs, s_startTime);

        uint256 balanceCumulative = 0;
        uint256 prevTimestamp = s_startTime;
        uint256 prevBalance = precedingIndex == type(uint256).max ? 0 : twabs[precedingIndex].balance;

        // Start loop from 0 if precedingIndex is max, otherwise from precedingIndex + 1
        uint256 loopStart = (precedingIndex == type(uint256).max) ? 0 : precedingIndex + 1;

        for (uint256 i = loopStart; i < twabs.length; i++) {
            if (twabs[i].timestamp > s_endTime) {
                break;
            }

            uint256 duration = uint256(twabs[i].timestamp - prevTimestamp);
            balanceCumulative += prevBalance * duration;

            prevTimestamp = twabs[i].timestamp;
            prevBalance = twabs[i].balance;
        }

        uint256 finalDuration = uint256(s_endTime - prevTimestamp);
        balanceCumulative += prevBalance * finalDuration;

        return balanceCumulative / (s_endTime - s_startTime);
    }

    function findPrecedingTimestampIndex(BalanceLog[] storage twabs, uint256 _s_lastTimestamp)
        internal
        view
        returns (uint256)
    {
        uint256 result = type(uint256).max; // Initialising with "not found" value
        if (twabs.length == 0) {
            return result; // Empty array case
        }

        if (twabs[0].timestamp > _s_lastTimestamp) {
            return result; // joined after current period
        }

        uint256 start = 0;
        uint256 end = twabs.length - 1;
        uint256 mid;

        while (start <= end) {
            mid = start + (end - start) / 2;

            if (twabs[mid].timestamp <= _s_lastTimestamp) {
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

    // internal & private view & pure functions

    // Swap the roles of s_activeUsers and s_tempActiveUsers
    function _cleanupUsers() internal {
        // define new storage pointer variable temp & make it point to where s_activeUsers currently points in storage
        address[] storage temp = s_activeUsers;
        // make s_activeUsers point to where s_tempActiveUsers is pointing
        s_activeUsers = s_tempActiveUsers;
        // make s_tempActiveUsers point to where temp is pointing.
        // since temp was originally pointing to where s_activeUsers was stored,
        // s_tempActiveUsers now points there. This makes s_tempActiveUsers the temporary array for the next raffle.
        s_tempActiveUsers = temp;

        // Clear the now-temporary array for the next raffle
        delete s_tempActiveUsers;
    }

    // function _isActiveForRaffle(address user) internal view returns (bool) {
    //     return (s_userDeposit[user] > 0) || (s_lastActiveTimestamp[user] > s_lastTimestamp);
    // }

    ///////////////////
    // Getter Functions
    ///////////////////
    /* Return total stETH contract balance */
    function getTotalBalance() external view returns (uint256) {
        return i_stETH.balanceOf(address(this));
    }

    /* Return user's stETH contract balance */
    function getUserDeposit(address user) external view returns (uint256) {
        return s_userDeposit[user];
    }

    /* Return value of total user deposits (i.e. exactly equals cumulative sum of user deposits, excludes subsequent stETH rebases) */
    function getTotalUserDeposits() external view returns (uint256) {
        return s_totalUserDeposits;
    }

    function getStakingRewardsTotal() external view returns (uint256) {
        return s_stakingRewardsTotal;
    }

    function getRaffleState() external view returns (RaffleState) {
        return s_raffleState;
    }

    // note: may want to fetch in batches
    function getActiveDepositors() external view returns (address[] memory) {
        return s_activeUsers;
    }

    function getActiveDepositorsCount() external view returns (uint256) {
        return s_activeUsers.length;
    }

    function getRecentWinner() external view returns (address) {
        return s_recentWinner;
    }

    // Temporary getters
    function getUserBalanceLog(address user) external view returns (BalanceLog[] memory) {
        return s_userTwabs[user];
    }

    function getTotalBalanceLog() external view returns (BalanceLog[] memory) {
        return s_totalDepositTwabs;
    }
}
