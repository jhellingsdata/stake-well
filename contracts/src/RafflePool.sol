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

import "./IERC20Permit.sol";
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
    error RafflePool__TransferFailed();
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
    struct Twab {
        uint256 balance;
        uint256 timestamp;
    }

    ///////////////////
    // State Variables
    ///////////////////
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    // uint8 private constant NUM_WORDS = 1;

    IERC20Permit public i_stETH;
    uint256 private s_totalUserDeposits;
    uint256 private s_stakingRewardsTotal;
    address[] private s_players;
    mapping(address => uint256) private s_userDeposit;
    mapping(address => uint256) private s_playerIndex;

    // map user address to TWABs array, to be updated with each transaction
    mapping(address => Twab[]) private s_userTwabs;
    Twab[] private s_totalDepositTwabs; // array for tracking total deposit balance TWAB over time

    // @dev Duration of the raffle in seconds
    uint256 private immutable i_interval;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint8 private immutable i_numWords; // Will allow multi-strategy raffles, e.g. multiple winners
    uint256 private s_lastTimeStamp;
    address private s_recentWinner;
    RaffleState private s_raffleState;

    ///////////////////
    // Events
    ///////////////////
    event RequestedRaffleWinner(uint256 indexed requestId);
    event PickedWinner(address indexed winner);

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
        uint8 numWords
    ) VRFConsumerBaseV2(vrfCoordinatorV2) Ownable(msg.sender) {
        i_stETH = IERC20Permit(steth);
        i_interval = interval;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_numWords = numWords;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
    }

    ///////////////////
    // External Functions
    ///////////////////
    /*
    * @notice Likely need to add reentrancy guard, can't follow checks-effects-interactions pattern
    */
    function depositEth() external payable moreThanZero(msg.value) {
        // Save stETH contract balance before deposit
        uint256 oldBalance = i_stETH.balanceOf(address(this));
        (bool success,) = address(i_stETH).call{value: msg.value}("");
        if (!success) revert RafflePool__MintFailed();
        // Check the contract's stETH balance after minting
        uint256 newBalance = i_stETH.balanceOf(address(this));
        // Calculate the amount of stETH minted
        uint256 mintedStETH = newBalance - oldBalance;
        // Update the user's deposited balance
        s_userDeposit[msg.sender] += mintedStETH;
        s_totalUserDeposits += mintedStETH;
        // Update truthful staking rewards total
        s_stakingRewardsTotal = newBalance - s_totalUserDeposits;
        _addPlayer(msg.sender);

        // Add a new Twab to the user's array of Twabs
        s_userTwabs[msg.sender].push(Twab(s_userDeposit[msg.sender], uint32(block.timestamp)));
        // Push total supply observations
        s_totalDepositTwabs.push(Twab(s_totalUserDeposits, uint32(block.timestamp)));
    }

    // Following Checks-Effects-Interactions
    function depositStEthWithPermit(uint256 amountStEth, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        external
        moreThanZero(amountStEth)
    {
        s_stakingRewardsTotal = i_stETH.balanceOf(address(this)) - s_totalUserDeposits;
        s_userDeposit[msg.sender] += amountStEth;
        s_totalUserDeposits += amountStEth;
        s_userTwabs[msg.sender].push(Twab(s_userDeposit[msg.sender], uint32(block.timestamp)));
        s_totalDepositTwabs.push(Twab(s_totalUserDeposits, uint32(block.timestamp)));
        _addPlayer(msg.sender);

        i_stETH.permit(msg.sender, address(this), amountStEth, deadline, v, r, s);
        bool success = i_stETH.transferFrom(msg.sender, address(this), amountStEth);
        if (!success) revert RafflePool__TransferFailed();
    }

    function withdrawStEth(uint256 amount) external moreThanZero(amount) {
        // Check that the user has enough stETH deposited
        if (s_userDeposit[msg.sender] < amount) {
            revert RafflePool__InsufficientStEthBalance();
        }
        // Update truthful staking rewards total
        s_stakingRewardsTotal = i_stETH.balanceOf(address(this)) - s_totalUserDeposits;
        s_userDeposit[msg.sender] -= amount;
        s_totalUserDeposits -= amount;
        s_userTwabs[msg.sender].push(Twab(s_userDeposit[msg.sender], uint32(block.timestamp)));
        s_totalDepositTwabs.push(Twab(s_totalUserDeposits, uint32(block.timestamp)));
        _removePlayer(msg.sender); // remove player if they withdraw all their stETH

        // Transfer stETH from this contract to the user
        bool success = i_stETH.transfer(msg.sender, amount);
        if (!success) revert RafflePool__WithdrawalFailed();
    }

    function pickWinner() external onlyOwner {
        // if ((block.timestamp - s_lastTimeStamp) < i_interval) {
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
        bool timePassed = (block.timestamp - s_lastTimeStamp) >= i_interval;
        bool isOpen = RaffleState.OPEN == s_raffleState;
        bool hasBalance = s_stakingRewardsTotal > 0;
        // bool hasPlayers = s_players.length > 0;
        upkeepNeeded = timePassed && isOpen && hasBalance;
        return (upkeepNeeded, "0x0");
    }

    ///////////////////
    // Internal Functions
    ///////////////////
    function fulfillRandomWords(uint256, /* requestId */ uint256[] memory randomWords) internal override {
        // 1. Calculate the sum of all TWABs for the time period of interest (`totalTWAB`).
        // 2. Scale the random number from Chainlink VRF to the range `[0, totalTWAB]` using modulo (`%`). This will give us a "ticket number" in the virtual array.
        // 3. Iterate over users, summing their TWABs, until the sum exceeds the ticket number. The current user is the winner.

        uint256 totalTwab = calculateTwab(address(0), s_lastTimeStamp, block.timestamp);
        uint256 scaledNumber = randomWords[0] % totalTwab;
        // Initialise a running total of TWABs
        uint256 runningTotal = 0;
        address winner;
        for (uint256 i = 0; i < s_players.length; i++) {
            runningTotal += calculateTwab(s_players[i], s_lastTimeStamp, block.timestamp);
            // If the running total exceeds the ticket number, this user is the winner
            if (runningTotal > scaledNumber) {
                winner = s_players[i];
            }
        }
        // Update the last timestamp
        s_lastTimeStamp = block.timestamp;
        // Allocate stETH raffle rewards to winning user
        s_userDeposit[winner] += s_stakingRewardsTotal;
        s_recentWinner = winner;
        emit PickedWinner(winner);
    }

    // This function can be called after updating the s_userDeposit for a deposit operation
    function _addPlayer(address _user) internal {
        if (s_userDeposit[_user] == 0) {
            s_players.push(_user);
            s_playerIndex[_user] = s_players.length; // Arrays are 1-indexed in the context of this solution
        }
    }

    // This function can be called after updating the s_userDeposit for a withdrawal operation
    function _removePlayer(address _user) internal {
        if (s_userDeposit[_user] == 0) {
            uint256 indexToRemove = s_playerIndex[_user] - 1; // Adjust for 0-indexed array
            address lastAddress = s_players[s_players.length - 1];

            // Swap with the last element if not already the last one
            if (indexToRemove != s_players.length - 1) {
                s_players[indexToRemove] = lastAddress;
                s_playerIndex[lastAddress] = indexToRemove + 1; // Adjust for 1-indexed mapping
            }

            s_players.pop();
            delete s_playerIndex[_user];
        }
    }

    // Temporarily public
    function calculateTwab(address userAddress, uint256 s_startTime, uint256 s_endTime) public view returns (uint256) {
        Twab[] storage twabs; // pointer to storage-based arrays
        if (userAddress == address(0)) {
            twabs = s_totalDepositTwabs;
        } else {
            twabs = s_userTwabs[userAddress];
        }

        uint256 precedingIndex = findPrecedingTimeStampIndex(twabs, s_startTime);

        uint256 balanceCumulative = 0;
        uint256 prevTimeStamp = s_startTime;
        uint256 prevBalance = precedingIndex == type(uint256).max ? 0 : twabs[precedingIndex].balance;

        for (uint256 i = precedingIndex + 1; i < twabs.length; i++) {
            if (twabs[i].timestamp > s_endTime) {
                break;
            }

            uint256 duration = uint256(twabs[i].timestamp - prevTimeStamp);
            balanceCumulative += prevBalance * duration;

            prevTimeStamp = twabs[i].timestamp;
            prevBalance = twabs[i].balance;
        }

        uint256 finalDuration = uint256(s_endTime - prevTimeStamp);
        balanceCumulative += prevBalance * finalDuration;

        return balanceCumulative / (s_endTime - s_startTime);
    }

    function findPrecedingTimeStampIndex(Twab[] storage twabs, uint256 _s_lastTimeStamp)
        internal
        view
        returns (uint256)
    {
        if (twabs.length == 0) {
            return type(uint256).max; // Empty array case
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
    function getPlayers() external view returns (address[] memory) {
        return s_players;
    }

    function getNumberOfPlayers() external view returns (uint256) {
        return s_players.length;
    }

    function getRecentWinner() external view returns (address) {
        return s_recentWinner;
    }
}
