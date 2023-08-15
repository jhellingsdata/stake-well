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

pragma solidity ^0.8.19;

import "./IERC20Permit.sol";
import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import {VRFConsumerBaseV2} from "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

/**
 * @title An stETH no-loss RafflePool Contract
 * @author J Hellings
 * @notice This contract is for creating a staking raffle vault/pool for stETH.
 * @notice stETH staking rewards are used for no-loss raffle.
 * @notice This will duplicate our vault functionality from `StakePool.sol`.
 * @dev Implements Chainlink VRFv2 for random number generation.
 */

contract RafflePool is VRFConsumerBaseV2 {
    ///////////////////
    // Errors
    ///////////////////
    error StakePool__NeedsMoreThanZero();
    error StakePool__MintFailed();
    error StakePool__TransferFailed();
    error StakePool__WithdrawalFailed();
    error StakePool__InsufficientStEthBalance();

    ///////////////////
    // Type Declarations
    ///////////////////
    enum RaffleState {
        OPEN,
        CALCULATING // Waiting for Chainlink VRF
    }

    ///////////////////
    // State Variables
    ///////////////////
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint8 private constant NUM_WORDS = 1;

    IERC20Permit public i_stETH;
    uint256 public s_totalUserDeposits;
    uint256 public s_stakingRewardsTotal;
    address[] private s_players;
    mapping(address => uint256) private s_userDeposit;
    mapping(address => uint256) private s_playerIndex;

    // @dev Duration of the raffle in seconds
    uint256 private immutable i_interval;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint256 private s_lastTimestamp;
    address private s_recentWinner;
    RaffleState private s_raffleState;

    ///////////////////
    // Events
    ///////////////////
    event PickedWinner(address indexed winner);

    ///////////////////
    // Modifiers
    ///////////////////
    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert StakePool__NeedsMoreThanZero();
        }
        _;
    }

    ///////////////////
    // Functions
    ///////////////////
    constructor(
        address _stETH,
        uint256 interval,
        address vrfCoordinatorV2,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_stETH = IERC20Permit(_stETH);
        i_interval = interval;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;

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
        // Save stETH contract balance before deposit
        uint256 oldBalance = i_stETH.balanceOf(address(this));
        (bool success,) = address(i_stETH).call{value: msg.value}("");
        if (!success) revert StakePool__MintFailed();
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
    }

    // Following Checks-Effects-Interactions
    function depositStEthWithPermit(uint256 amountStEth, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        external
        moreThanZero(amountStEth)
    {
        s_stakingRewardsTotal = totalBalance() - s_totalUserDeposits;
        s_userDeposit[msg.sender] += amountStEth;
        s_totalUserDeposits += amountStEth;
        _addPlayer(msg.sender);

        i_stETH.permit(msg.sender, address(this), amountStEth, deadline, v, r, s);
        bool success = i_stETH.transferFrom(msg.sender, address(this), amountStEth);
        if (!success) revert StakePool__TransferFailed();
    }

    function withdrawStEth(uint256 amount) external moreThanZero(amount) {
        // Check that the user has enough stETH deposited
        if (s_userDeposit[msg.sender] < amount) {
            revert StakePool__InsufficientStEthBalance();
        }
        // Update truthful staking rewards total
        s_stakingRewardsTotal = totalBalance() - s_totalUserDeposits;
        s_userDeposit[msg.sender] -= amount;
        s_totalUserDeposits -= amount;
        _removePlayer(msg.sender);

        // Transfer stETH from this contract to the user
        bool success = i_stETH.transfer(msg.sender, amount);
        if (!success) revert StakePool__WithdrawalFailed();
    }

    function pickWinner() external {
        // if ((block.timestamp - s_lastTimestamp) < i_interval) {
        //     revert();
        // }
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, // gas lane
            i_subscriptionId, // id that's funded with link
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
    }

    ///////////////////
    // Public Functions
    ///////////////////

    /* Return total stETH contract balance */
    function totalBalance() public view returns (uint256) {
        return i_stETH.balanceOf(address(this));
    }

    /* Return user's stETH contract balance */
    function balanceOf(address user) public view returns (uint256) {
        return s_userDeposit[user];
    }

    /* Return value of total user deposits (i.e. exactly equals cumulative sum of user deposits, excludes subsequent stETH rebases) */
    function totalUserDeposits() public view returns (uint256) {
        return s_totalUserDeposits;
    }

    ///////////////////
    // Internal Functions
    ///////////////////
    function fulfillRandomWords(uint256, /* requestId */ uint256[] memory randomWords) internal override {
        // 1. Calculate the sum of all TWABs for the time period of interest (`totalTWAB`).
        // 2. Scale the random number from Chainlink VRF to the range `[0, totalTWAB]` using modulo (`%`). This will give us a "ticket number" in the virtual array.
        // 3. Iterate over users, summing their TWABs, until the sum exceeds the ticket number. The current user is the winner.
        uint256 scaledNumber = randomWords[0] % s_players.length;

        // Allocate stETH raffle rewards to winning user
        // s_userDeposit[winner] += s_stakingRewardsTotal;
        // s_recentWinner = winner;
        // emit PickedWinner(winner);
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
}
