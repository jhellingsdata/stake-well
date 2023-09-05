# RafflePool
[Git Source](https://github.com/jhellingsdata/stake-well/blob/876a208256f933daf256e715a8b09c75146af820/contracts/src/RafflePool.sol)

**Inherits:**
VRFConsumerBaseV2, Ownable

**Author:**
J. Hellings

This contract is for creating a staking raffle vault/pool for stETH.

stETH staking rewards are used for no-loss raffle.

This will duplicate our vault functionality from `StakePool.sol`.

*Implements Chainlink VRFv2 for random number generation.*


## State Variables
### i_stETH

```solidity
IERC20Permit private immutable i_stETH;
```


### i_vrfCoordinator

```solidity
VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
```


### REQUEST_CONFIRMATIONS

```solidity
uint16 private constant REQUEST_CONFIRMATIONS = 3;
```


### i_callbackGasLimit

```solidity
uint32 private immutable i_callbackGasLimit;
```


### i_numWords

```solidity
uint32 private immutable i_numWords;
```


### i_subscriptionId

```solidity
uint64 private immutable i_subscriptionId;
```


### i_gasLane

```solidity
bytes32 private immutable i_gasLane;
```


### i_interval

```solidity
uint256 private immutable i_interval;
```


### s_lastTimestamp

```solidity
uint256 private s_lastTimestamp;
```


### s_totalUserDeposits

```solidity
uint256 private s_totalUserDeposits;
```


### s_stakingRewardsTotal

```solidity
uint256 private s_stakingRewardsTotal;
```


### s_platformFee

```solidity
uint256 private s_platformFee;
```


### s_platformFeeBalance

```solidity
uint256 private s_platformFeeBalance;
```


### s_recentWinner

```solidity
address private s_recentWinner;
```


### s_activeUsers

```solidity
address[] private s_activeUsers;
```


### s_tempActiveUsers

```solidity
address[] private s_tempActiveUsers;
```


### s_userDeposit

```solidity
mapping(address => uint256) private s_userDeposit;
```


### s_userTwabs

```solidity
mapping(address => BalanceLog[]) private s_userTwabs;
```


### s_totalDepositTwabs

```solidity
BalanceLog[] private s_totalDepositTwabs;
```


### s_raffleState

```solidity
RaffleState private s_raffleState;
```


## Functions
### moreThanZero


```solidity
modifier moreThanZero(uint256 amount);
```

### constructor


```solidity
constructor(
    address steth,
    uint256 interval,
    address vrfCoordinatorV2,
    bytes32 gasLane,
    uint64 subscriptionId,
    uint32 callbackGasLimit,
    uint32 numWords
) VRFConsumerBaseV2(vrfCoordinatorV2) Ownable(msg.sender);
```

### depositEth


```solidity
function depositEth() external payable moreThanZero(msg.value);
```

### depositStEth


```solidity
function depositStEth(uint256 amount) external moreThanZero(amount);
```

### depositStEthWithPermit


```solidity
function depositStEthWithPermit(uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
    external
    moreThanZero(amount);
```

### withdrawStEth


```solidity
function withdrawStEth(uint256 amount) external moreThanZero(amount);
```

### performUpkeep


```solidity
function performUpkeep(bytes calldata) external;
```

### withdrawPlatformFee


```solidity
function withdrawPlatformFee() external onlyOwner;
```

### adjustPlatformFee


```solidity
function adjustPlatformFee(uint256 newFee) external onlyOwner;
```

### updateStakingRewards


```solidity
function updateStakingRewards() external;
```

### checkUpkeep


```solidity
function checkUpkeep(bytes memory) public view returns (bool upkeepNeeded, bytes memory);
```

### _addUser


```solidity
function _addUser(address userAddress) internal;
```

### _addBalance


```solidity
function _addBalance(address userAddress, uint256 amount) internal;
```

### _subtractBalance


```solidity
function _subtractBalance(address userAddress, uint256 amount) internal;
```

### _updateBalanceLogs


```solidity
function _updateBalanceLogs(address userAddress) internal;
```

### _adjustPlatformFee


```solidity
function _adjustPlatformFee(uint256 newFee) internal;
```

### fulfillRandomWords


```solidity
function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override;
```

### calculateTwab


```solidity
function calculateTwab(address userAddress, uint256 s_startTime, uint256 s_endTime) internal view returns (uint256);
```

### findPrecedingTimestampIndex


```solidity
function findPrecedingTimestampIndex(BalanceLog[] storage twabs, uint256 _s_lastTimestamp)
    internal
    view
    returns (uint256);
```

### _checkRaffleState


```solidity
function _checkRaffleState() internal view;
```

### _cleanupUsers


```solidity
function _cleanupUsers() internal;
```

### getTotalBalance


```solidity
function getTotalBalance() external view returns (uint256);
```

### getUserDeposit


```solidity
function getUserDeposit(address user) external view returns (uint256);
```

### getTotalUserDeposits


```solidity
function getTotalUserDeposits() external view returns (uint256);
```

### getStakingRewardsTotal


```solidity
function getStakingRewardsTotal() external view returns (uint256);
```

### getRaffleState


```solidity
function getRaffleState() external view returns (RaffleState);
```

### getActiveDepositors


```solidity
function getActiveDepositors() external view returns (address[] memory);
```

### getActiveDepositorsCount


```solidity
function getActiveDepositorsCount() external view returns (uint256);
```

### getRecentWinner


```solidity
function getRecentWinner() external view returns (address);
```

### getLastTimestamp


```solidity
function getLastTimestamp() external view returns (uint256);
```

### getInterval


```solidity
function getInterval() external view returns (uint256);
```

### getPlatformFee


```solidity
function getPlatformFee() external view returns (uint256);
```

### getPlatformFeeBalance


```solidity
function getPlatformFeeBalance() external view returns (uint256);
```

### getLastUserBalanceLog


```solidity
function getLastUserBalanceLog(address user) external view returns (BalanceLog memory);
```

### getLastTotalBalanceLog


```solidity
function getLastTotalBalanceLog() external view returns (BalanceLog memory);
```

### getUserBalanceLog


```solidity
function getUserBalanceLog(address user) external view returns (BalanceLog[] memory);
```

### getTotalBalanceLog


```solidity
function getTotalBalanceLog() external view returns (BalanceLog[] memory);
```

## Events
### MintAndDepositSuccessful

```solidity
event MintAndDepositSuccessful(address indexed depositor, uint256 amount, uint256 newBalance);
```

### DepositSuccessful

```solidity
event DepositSuccessful(address indexed depositor, uint256 amount, uint256 newBalance);
```

### WithdrawSuccessful

```solidity
event WithdrawSuccessful(address indexed withdrawer, uint256 amount, uint256 newBalance);
```

### PickedWinner

```solidity
event PickedWinner(address indexed winner, uint256 amount);
```

### StakingRewardsUpdated

```solidity
event StakingRewardsUpdated(uint256 newRewardsTotal);
```

### ProtocolFeeWithdrawn

```solidity
event ProtocolFeeWithdrawn(uint256 amount);
```

### ProtocolFeeAdjusted

```solidity
event ProtocolFeeAdjusted(uint256 newFee);
```

### RequestedRaffleWinner

```solidity
event RequestedRaffleWinner(uint256 indexed requestId);
```

### RandomWord

```solidity
event RandomWord(uint256 indexed randomWord);
```

### ScaledRandomNumber

```solidity
event ScaledRandomNumber(uint256 indexed scaledNum);
```

## Errors
### RafflePool__NeedsMoreThanZero

```solidity
error RafflePool__NeedsMoreThanZero();
```

### RafflePool__MintFailed

```solidity
error RafflePool__MintFailed();
```

### RafflePool__RaffleDrawInProgress

```solidity
error RafflePool__RaffleDrawInProgress();
```

### RafflePool__InsufficientAllowance

```solidity
error RafflePool__InsufficientAllowance();
```

### RafflePool__StEthTransferFailed

```solidity
error RafflePool__StEthTransferFailed();
```

### RafflePool__WithdrawalFailed

```solidity
error RafflePool__WithdrawalFailed();
```

### RafflePool__InsufficientStEthBalance

```solidity
error RafflePool__InsufficientStEthBalance();
```

### RafflePool__UpkeepNotNeeded

```solidity
error RafflePool__UpkeepNotNeeded(uint256 raffleBalance, uint256 raffleState);
```

### RafflePool__ExceedsMaxProtocolFee

```solidity
error RafflePool__ExceedsMaxProtocolFee();
```

## Structs
### BalanceLog

```solidity
struct BalanceLog {
    uint256 balance;
    uint256 timestamp;
}
```

## Enums
### RaffleState

```solidity
enum RaffleState {
    OPEN,
    CALCULATING
}
```

