# StakePool
[Git Source](https://github.com/jhellingsdata/stake-well/blob/876a208256f933daf256e715a8b09c75146af820/contracts/src/StakePool.sol)


## State Variables
### i_stETH

```solidity
IERC20Permit public immutable i_stETH;
```


### i_owner

```solidity
address private immutable i_owner;
```


### s_totalUserDeposits

```solidity
uint256 public s_totalUserDeposits;
```


### s_stakingRewardsTotal

```solidity
uint256 public s_stakingRewardsTotal;
```


### s_userDeposit
*Mapping of user address to their deposit amount (in stETH)*


```solidity
mapping(address user => uint256 amount) private s_userDeposit;
```


## Functions
### moreThanZero


```solidity
modifier moreThanZero(uint256 amount);
```

### constructor


```solidity
constructor(address _stETH);
```

### depositEth


```solidity
function depositEth() external payable moreThanZero(msg.value);
```

### depositStEth


```solidity
function depositStEth(uint256 amountStEth) external moreThanZero(amountStEth);
```

### depositStEthWithPermit


```solidity
function depositStEthWithPermit(uint256 amountStEth, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
    external
    moreThanZero(amountStEth);
```

### withdrawEth


```solidity
function withdrawEth(uint256 amount) external;
```

### withdrawStEth


```solidity
function withdrawStEth(uint256 amount) external;
```

### totalBalance


```solidity
function totalBalance() public view returns (uint256);
```

### balanceOf


```solidity
function balanceOf(address user) public view returns (uint256);
```

### totalUserDeposits


```solidity
function totalUserDeposits() public view returns (uint256);
```

## Events
### StakeDeposited

```solidity
event StakeDeposited(address indexed user, uint256 indexed amount);
```

### MintAndStakeDeposited

```solidity
event MintAndStakeDeposited(address indexed user, uint256 indexed amount);
```

### StakeDepositedWithPermit

```solidity
event StakeDepositedWithPermit(address indexed user, uint256 indexed amount);
```

### StakeWithdrawn

```solidity
event StakeWithdrawn(address indexed user, uint256 indexed amount);
```

## Errors
### StakePool__MintFailed

```solidity
error StakePool__MintFailed();
```

### StakePool__NeedsMoreThanZero

```solidity
error StakePool__NeedsMoreThanZero();
```

### StakePool__InsufficientStEthBalance

```solidity
error StakePool__InsufficientStEthBalance();
```

### StakePool__TransferFailed

```solidity
error StakePool__TransferFailed();
```

### StakePool__WithdrawalFailed

```solidity
error StakePool__WithdrawalFailed();
```

