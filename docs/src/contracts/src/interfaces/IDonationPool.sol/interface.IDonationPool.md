# IDonationPool
[Git Source](https://github.com/jhellingsdata/stake-well/blob/876a208256f933daf256e715a8b09c75146af820/contracts/src/interfaces/IDonationPool.sol)


## Functions
### depositEth


```solidity
function depositEth() external payable;
```

### depositStEth


```solidity
function depositStEth(uint256 _amount) external;
```

### depositStEthWithPermit


```solidity
function depositStEthWithPermit(uint256 _amount, uint256 _deadline, uint8 _v, bytes32 _r, bytes32 _s) external;
```

### withdrawStEth


```solidity
function withdrawStEth(uint256 _amount) external;
```

