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

import {IERC20Permit} from "../../src/interfaces/IERC20Permit.sol";
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
    error RafflePool__RaffleDrawInProgress();
    error RafflePool__InsufficientAllowance();
    error RafflePool__StEthTransferFailed();
    error RafflePool__WithdrawalFailed();
    error RafflePool__InsufficientStEthBalance();
    error RafflePool__UpkeepNotNeeded(uint256 raffleBalance, uint256 raffleState);
    error RafflePool__ExceedsMaxProtocolFee();
    error ReentrancyGuardReentrantCall();

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
    uint256 private locked = 1; // Solmate reentrancy guard
    /* Raffle Variables */
    uint256 private immutable i_interval; // raffle duration
    uint256 private s_lastTimestamp; // timestamp of last raffle draw
    uint256 private s_totalUserDeposits;
    uint256 private s_stakingRewardsTotal;
    uint256 private s_platformFee;
    uint256 private s_platformFeeBalance;
    address private s_recentWinner;
    address[] private s_activeUsers;
    address[] private s_tempActiveUsers;
    mapping(address => uint256) private s_userDeposit;
    mapping(address => uint256) private s_lastActiveTimestamp;

    // map user address to BalanceLogs array, to be updated with each transaction
    mapping(address => BalanceLog[]) private s_userTwabs;
    BalanceLog[] private s_totalDepositTwabs; // array for tracking total deposit balance over time

    RaffleState private s_raffleState;

    ///////////////////
    // Events
    ///////////////////
    event MintAndDepositSuccessful(address indexed depositor, uint256 amount, uint256 newBalance);
    event DepositSuccessful(address indexed depositor, uint256 amount, uint256 newBalance);
    event WithdrawSuccessful(address indexed withdrawer, uint256 amount, uint256 newBalance);
    event PickedWinner(address indexed winner, uint256 amount);
    event StakingRewardsUpdated(uint256 newRewardsTotal);
    event ProtocolFeeWithdrawn(uint256 amount);
    event ProtocolFeeAdjusted(uint256 newFee);

    // Temporary events for testing
    event RequestedRaffleWinner(uint256 indexed requestId);
    event RandomWord(uint256 indexed randomWord);
    event ScaledRandomNumber(uint256 indexed scaledNum);

    ///////////////////
    // Modifiers
    ///////////////////

    modifier nonReentrant() virtual {
        if (locked == 2) {
            revert ReentrancyGuardReentrantCall();
        }
        locked = 2;
        _;
        locked = 1;
    }

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
    function depositEth() external payable nonReentrant moreThanZero(msg.value) {
        _checkRaffleState();
        _addUser(msg.sender);
        uint256 beforeDeposit = i_stETH.balanceOf(address(this));
        (bool success,) = address(i_stETH).call{value: msg.value}("");
        if (!success) revert RafflePool__MintFailed();
        uint256 afterDeposit = i_stETH.balanceOf(address(this));
        uint256 actualMintedAmount = afterDeposit - beforeDeposit;
        _addBalance(msg.sender, actualMintedAmount);
        _updateBalanceLogs(msg.sender);
        emit MintAndDepositSuccessful(msg.sender, actualMintedAmount, s_userDeposit[msg.sender]);
    }

    function depositStEth(uint256 amount) external nonReentrant moreThanZero(amount) {
        // Ensure the allowance is sufficient
        uint256 allowance = i_stETH.allowance(msg.sender, address(this));
        if (allowance < amount) revert RafflePool__InsufficientAllowance();
        _checkRaffleState();
        _addUser(msg.sender);
        uint256 beforeDeposit = i_stETH.balanceOf(address(this));
        bool success = i_stETH.transferFrom(msg.sender, address(this), amount);
        if (!success) revert RafflePool__StEthTransferFailed();
        uint256 afterDeposit = i_stETH.balanceOf(address(this));
        uint256 actualAmount = afterDeposit - beforeDeposit;
        _addBalance(msg.sender, actualAmount);
        _updateBalanceLogs(msg.sender);
        emit DepositSuccessful(msg.sender, actualAmount, s_userDeposit[msg.sender]);
    }

    function depositStEthWithPermit(uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        external
        nonReentrant
        moreThanZero(amount)
    {
        _checkRaffleState();
        _addUser(msg.sender);
        uint256 beforeDeposit = i_stETH.balanceOf(address(this));
        i_stETH.permit(msg.sender, address(this), amount, deadline, v, r, s);
        bool success = i_stETH.transferFrom(msg.sender, address(this), amount);
        if (!success) revert RafflePool__StEthTransferFailed();
        uint256 afterDeposit = i_stETH.balanceOf(address(this));
        uint256 actualAmount = afterDeposit - beforeDeposit;
        _addBalance(msg.sender, actualAmount);
        _updateBalanceLogs(msg.sender);
        emit DepositSuccessful(msg.sender, actualAmount, s_userDeposit[msg.sender]);
    }
    // CEI Pattern

    function withdrawStEth(uint256 amount) external moreThanZero(amount) {
        if (s_userDeposit[msg.sender] < amount) {
            revert RafflePool__InsufficientStEthBalance();
        }
        _checkRaffleState();
        // Update user deposit balance & total deposit balance & logs
        _subtractBalance(msg.sender, amount);
        _updateBalanceLogs(msg.sender);
        emit WithdrawSuccessful(msg.sender, amount, s_userDeposit[msg.sender]);
        bool success = i_stETH.transfer(msg.sender, amount);
        if (!success) revert RafflePool__WithdrawalFailed();
    }

    function performUpkeep(bytes calldata /* performData */ ) external {
        (bool upkeepNeeded,) = checkUpkeep("");
        uint256 stakingRewardsTotal = i_stETH.balanceOf(address(this)) - s_totalUserDeposits;
        // split staking rewards between platform fee and raffle prize
        uint256 s_platformFeeAmount = (stakingRewardsTotal * s_platformFee) / 10000;
        s_platformFeeBalance += s_platformFeeAmount;
        stakingRewardsTotal -= s_platformFeeAmount;
        if (!upkeepNeeded) {
            revert RafflePool__UpkeepNotNeeded(stakingRewardsTotal, uint256(s_raffleState));
        }
        s_stakingRewardsTotal = stakingRewardsTotal;
        s_raffleState = RaffleState.CALCULATING;
        // Temporary for tests - don't need `requestId` for production
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, // gas lane
            i_subscriptionId, // id that's funded with link
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            i_numWords
        );
        // Temporary for tests
        emit RequestedRaffleWinner(requestId);
    }
    // checks-effects-interactions pattern

    function withdrawPlatformFee() external onlyOwner {
        uint256 platformFeeBalance = s_platformFeeBalance;
        s_platformFeeBalance = 0;
        emit ProtocolFeeWithdrawn(platformFeeBalance);
        bool success = i_stETH.transfer(msg.sender, platformFeeBalance);
        if (!success) revert RafflePool__WithdrawalFailed();
    }

    function adjustPlatformFee(uint256 newFee) external onlyOwner {
        _adjustPlatformFee(newFee);
    }

    ///////////////////
    // Public Functions
    ///////////////////

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
        bool hasPrize = (i_stETH.balanceOf(address(this)) - s_totalUserDeposits) > 0;
        // bool hasPrize = stakingRewardsTotal > 0;
        upkeepNeeded = timePassed && isOpen && hasPrize;
        return (upkeepNeeded, "0x0");
    }

    ///////////////////
    // Internal Functions
    ///////////////////
    /*  @param userAddress
    *   @dev Adds user to active users list if they are not already in it and haven't been active in this raffle period.
    *   @dev If user is already in active users list, do nothing.
    *   @dev If user has been active in this raffle period, do nothing.
    *   @note This function is called whenever a user deposits or withdraws.
    *   @note This function must be called before updating the user's balance.
    */
    function _addUser(address userAddress) internal {
        // If user is depositing for the first time, add them to active users list
        if (s_userDeposit[userAddress] == 0 && s_lastActiveTimestamp[userAddress] < s_lastTimestamp) {
            // before adding to list, check where user was last active after the current raffle period
            // if they were active, it means they have had a positive balance in this raffle,
            // and so should will already be in the active users list
            s_activeUsers.push(userAddress);
        }
    }

    function _addBalance(address userAddress, uint256 amount) internal {
        s_userDeposit[userAddress] += amount;
        s_totalUserDeposits += amount;
        s_lastActiveTimestamp[userAddress] = block.timestamp;
    }

    function _subtractBalance(address userAddress, uint256 amount) internal {
        s_userDeposit[userAddress] -= amount;
        s_totalUserDeposits -= amount;
        s_lastActiveTimestamp[userAddress] = block.timestamp;
    }

    function _updateBalanceLogs(address userAddress) internal {
        // s_lastActiveTimestamp[userAddress] = block.timestamp; // May be rudundant
        s_userTwabs[userAddress].push(BalanceLog({balance: s_userDeposit[userAddress], timestamp: block.timestamp}));
        s_totalDepositTwabs.push(BalanceLog(s_totalUserDeposits, block.timestamp));
    }

    function _adjustPlatformFee(uint256 newFee) internal {
        // fee must be between 0 -> 15%
        if (newFee > 1500) {
            revert RafflePool__ExceedsMaxProtocolFee();
        }
        s_platformFee = newFee;
        emit ProtocolFeeAdjusted(newFee);
    }

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

    function fulfillRandomWords(uint256, /* requestId */ uint256[] memory randomWords) internal override {
        // 1. Calculate the sum of all TWABs for the time period of interest (`totalTWAB`).
        // 2. Scale the random number from Chainlink VRF to the range `[0, totalTWAB]` using modulo (`%`). This will give us a "ticket number" in the virtual array.
        // 3. Iterate over users, summing their TWABs, until the sum exceeds the ticket number. The current user is the winner.
        // emit RandomWord(randomWords[0]);
        uint256 lastTimestamp = s_lastTimestamp;
        uint256 currentTimestamp = block.timestamp;
        uint256 totalTwab = _calculateTwab(address(0), lastTimestamp, currentTimestamp);
        uint256 scaledNumber = (randomWords[0] % totalTwab);
        // emit ScaledRandomNumber(scaledNumber);
        // Initialise a running total of TWABs
        uint256 runningTotal = 0;
        address winner;
        uint256 totalPlayers = s_activeUsers.length;
        for (uint256 i = 0; i < totalPlayers;) {
            // Calculate TWAB only if a winner has not been found
            address player = s_activeUsers[i];
            if (winner == address(0)) {
                // if last active was before raffle period, user TWAB = their current balance
                if (s_lastActiveTimestamp[player] < currentTimestamp) {
                    runningTotal += s_userDeposit[player];
                } else {
                    runningTotal += _calculateTwab(player, lastTimestamp, currentTimestamp);
                }
                // If the running total exceeds the ticket number and a winner has not yet been determined, set this user as the winner
                if (runningTotal > scaledNumber && winner == address(0)) {
                    winner = player;
                }
            }
            // If user balance == 0, remove them from the active users list
            if (s_userDeposit[player] != 0) {
                s_tempActiveUsers.push(player);
            }
            unchecked {
                i++;
            }
        }

        s_raffleState = RaffleState.OPEN;
        // Update the last timestamp for next raffle
        s_lastTimestamp = currentTimestamp;
        // Allocate stETH raffle rewards to winning user
        s_recentWinner = winner;
        _cleanupUsers();
        _allocateRewards(winner, s_stakingRewardsTotal);
        emit PickedWinner(winner, s_stakingRewardsTotal);
        // reset staking rewards count to zero
        s_stakingRewardsTotal = 0;
    }

    /*
    * @dev Allocate stETH rewards to winning user
    * @param winner: address of winning user
    * @param rafflePrize: amount of stETH to allocate to winning user
    * @note If the user zero balance, add them to active users array.
    */
    function _allocateRewards(address winner, uint256 rafflePrize) internal {
        if (s_userDeposit[winner] == 0) {
            s_activeUsers.push(winner);
        }
        _addBalance(winner, rafflePrize);
    }

    function _calculateTwab(address userAddress, uint256 s_startTime, uint256 s_endTime)
        internal
        view
        returns (uint256)
    {
        BalanceLog[] storage twabs; // pointer to storage-based arrays
        if (userAddress == address(0)) {
            twabs = s_totalDepositTwabs;
        } else {
            twabs = s_userTwabs[userAddress];
        }

        uint256 precedingIndex = _findPrecedingTimestampIndex(twabs, s_startTime);

        uint256 balanceCumulative = 0;
        uint256 prevTimestamp = s_startTime;
        uint256 prevBalance = precedingIndex == type(uint256).max ? 0 : twabs[precedingIndex].balance;

        // Start loop from 0 if precedingIndex is max, otherwise from precedingIndex + 1
        uint256 loopStart = (precedingIndex == type(uint256).max) ? 0 : precedingIndex + 1;

        for (uint256 i = loopStart; i < twabs.length;) {
            if (twabs[i].timestamp > s_endTime) {
                break;
            }

            uint256 duration = uint256(twabs[i].timestamp - prevTimestamp);
            balanceCumulative += prevBalance * duration;

            prevTimestamp = twabs[i].timestamp;
            prevBalance = twabs[i].balance;
            unchecked {
                i++;
            }
        }

        uint256 finalDuration = uint256(s_endTime - prevTimestamp);
        balanceCumulative += prevBalance * finalDuration;

        return balanceCumulative / (s_endTime - s_startTime);
    }

    function _findPrecedingTimestampIndex(BalanceLog[] storage twabs, uint256 _s_lastTimestamp)
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

    function _checkRaffleState() internal view {
        if (s_raffleState != RaffleState.OPEN) {
            revert RafflePool__RaffleDrawInProgress();
        }
    }

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

    function getActiveDepositorsCount() external view returns (uint256) {
        return s_activeUsers.length;
    }

    function getRecentWinner() external view returns (address) {
        return s_recentWinner;
    }

    function getLastTimestamp() external view returns (uint256) {
        return s_lastTimestamp;
    }

    function getInterval() external view returns (uint256) {
        return i_interval;
    }

    function getPlatformFee() external view returns (uint256) {
        return s_platformFee;
    }

    function getPlatformFeeBalance() external view returns (uint256) {
        return s_platformFeeBalance;
    }

    function getLastUserBalanceLog(address user) external view returns (BalanceLog memory) {
        return s_userTwabs[user][s_userTwabs[user].length - 1];
    }

    function getLastTotalBalanceLog() external view returns (BalanceLog memory) {
        return s_totalDepositTwabs[s_totalDepositTwabs.length - 1];
    }

    // Temporary getters for testing
    function getActiveDepositors() external view returns (address[] memory) {
        return s_activeUsers;
    }

    function getUserBalanceLog(address user) external view returns (BalanceLog[] memory) {
        return s_userTwabs[user];
    }

    function getTotalBalanceLog() external view returns (BalanceLog[] memory) {
        return s_totalDepositTwabs;
    }

    // calculateTwab
    function getTwab(address userAddress, uint256 s_startTime, uint256 s_endTime) external view returns (uint256) {
        return _calculateTwab(userAddress, s_startTime, s_endTime);
    }
}
