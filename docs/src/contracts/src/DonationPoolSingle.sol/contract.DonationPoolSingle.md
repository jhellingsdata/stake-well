# DonationPoolSingle
[Git Source](https://github.com/jhellingsdata/stake-well/blob/876a208256f933daf256e715a8b09c75146af820/contracts/src/DonationPoolSingle.sol)

**Inherits:**
AccessControl


## State Variables
### i_stETH

```solidity
IERC20Permit private immutable i_stETH;
```


### s_userDeposit

```solidity
mapping(address => mapping(uint256 => uint256)) private s_userDeposit;
```


### s_totalUserDeposits

```solidity
mapping(uint256 => uint256) private s_totalUserDeposits;
```


### s_playerIndex

```solidity
mapping(address => uint256) private s_playerIndex;
```


## Functions
### moreThanZero


```solidity
modifier moreThanZero(uint256 amount);
```

### constructor


```solidity
constructor(address steth);
```

### depositEth


```solidity
function depositEth(uint256 campaignId) external payable;
```

### depositStEth


```solidity
function depositStEth(uint256 campaignId, uint256 amount) external moreThanZero(amount);
```

### depositStEthWithPermit


```solidity
function depositStEthWithPermit(uint256 campaignId, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
    external
    moreThanZero(amount);
```

### withdrawStEth


```solidity
function withdrawStEth(uint256 campaignId, uint256 amount) external moreThanZero(amount);
```

### _addBalance


```solidity
function _addBalance(address userAddress, uint256 campaignId, uint256 amount) internal;
```

### _subtractBalance


```solidity
function _subtractBalance(address userAddress, uint256 campaignId, uint256 amount) internal;
```

## Events
### WithdrawSuccessful

```solidity
event WithdrawSuccessful(address indexed withdrawer, uint256 amount);
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

### RafflePool__StEthTransferFailed

```solidity
error RafflePool__StEthTransferFailed();
```

### RafflePool__InsufficientAllowance

```solidity
error RafflePool__InsufficientAllowance();
```

### RafflePool__InsufficientStEthBalance

```solidity
error RafflePool__InsufficientStEthBalance();
```

### RafflePool__WithdrawalFailed

```solidity
error RafflePool__WithdrawalFailed();
```

## Structs
### Campaign

```solidity
struct Campaign {
    address manager;
    address beneficiary;
    address[] contributors;
    uint256 totalDepositBalance;
    uint256 totalRewards;
}
```

