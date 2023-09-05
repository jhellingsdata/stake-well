# DonationPool
[Git Source](https://github.com/jhellingsdata/stake-well/blob/876a208256f933daf256e715a8b09c75146af820/contracts/src/DonationPool.sol)

**Inherits:**
AccessControl, ReentrancyGuard


## State Variables
### i_stETH

```solidity
IERC20Permit private immutable i_stETH;
```


### MANAGER_ROLE

```solidity
bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
```


### s_campaign

```solidity
Campaign private s_campaign;
```


### s_userDeposit

```solidity
mapping(address => uint256) private s_userDeposit;
```


### s_userIndex

```solidity
mapping(address => uint256) private s_userIndex;
```


## Functions
### moreThanZero


```solidity
modifier moreThanZero(uint256 amount);
```

### constructor


```solidity
constructor(address steth, address _manager, address _beneficiary);
```

### depositEth


```solidity
function depositEth() external payable nonReentrant;
```

### depositStEth


```solidity
function depositStEth(uint256 amount) external nonReentrant moreThanZero(amount);
```

### depositStEthWithPermit


```solidity
function depositStEthWithPermit(uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
    external
    nonReentrant
    moreThanZero(amount);
```

### withdrawStEth


```solidity
function withdrawStEth(uint256 amount) external nonReentrant moreThanZero(amount);
```

### endCampaign


```solidity
function endCampaign() external;
```

### withdrawRewards


```solidity
function withdrawRewards() external;
```

### _addBalance


```solidity
function _addBalance(address userAddress, uint256 amount) internal;
```

### _addShares


```solidity
function _addShares() internal;
```

### _subtractBalance


```solidity
function _subtractBalance(address userAddress, uint256 amount) internal;
```

### _subtractShares


```solidity
function _subtractShares() internal;
```

### _addPlayer


```solidity
function _addPlayer(address _user) internal;
```

### _removePlayer


```solidity
function _removePlayer(address _user) internal;
```

### getCampaignInfo


```solidity
function getCampaignInfo() external view returns (address[] memory);
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

### RewardsWithdrawSuccessful

```solidity
event RewardsWithdrawSuccessful(address indexed withdrawer, uint256 amount);
```

## Errors
### DonationPool__NeedsMoreThanZero

```solidity
error DonationPool__NeedsMoreThanZero();
```

### DonationPool__MintFailed

```solidity
error DonationPool__MintFailed();
```

### DonationPool__StEthTransferFailed

```solidity
error DonationPool__StEthTransferFailed();
```

### DonationPool__InsufficientAllowance

```solidity
error DonationPool__InsufficientAllowance();
```

### DonationPool__InsufficientStEthBalance

```solidity
error DonationPool__InsufficientStEthBalance();
```

### DonationPool__WithdrawalFailed

```solidity
error DonationPool__WithdrawalFailed();
```

### DonationPool__NotAuthorised

```solidity
error DonationPool__NotAuthorised();
```

## Structs
### Campaign

```solidity
struct Campaign {
    address manager;
    address beneficiary;
    address[] contributors;
    uint256 totalDepositBalance;
    uint256 totalShares;
}
```

