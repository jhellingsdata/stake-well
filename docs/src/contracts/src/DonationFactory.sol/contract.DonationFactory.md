# DonationFactory
[Git Source](https://github.com/jhellingsdata/stake-well/blob/876a208256f933daf256e715a8b09c75146af820/contracts/src/DonationFactory.sol)


## State Variables
### i_stETH

```solidity
IERC20Permit private immutable i_stETH;
```


### i_owner

```solidity
address private immutable i_owner;
```


### isDonationPool

```solidity
mapping(address => bool) public isDonationPool;
```


### donationPools

```solidity
DonationPool[] private donationPools;
```


## Functions
### onlyOwner


```solidity
modifier onlyOwner();
```

### constructor


```solidity
constructor(address steth);
```

### createDonationPool


```solidity
function createDonationPool(address _manager, address _beneficiary, string memory _title) external onlyOwner;
```

### temporaryAuthorisation


```solidity
function temporaryAuthorisation() external;
```

### getCampaignCount


```solidity
function getCampaignCount() external view returns (uint256);
```

## Events
### DonationPoolCreated

```solidity
event DonationPoolCreated(
    address indexed donationPool, address indexed beneficiary, uint256 indexed poolIndex, string title
);
```

## Errors
### DonationFactory__NotAuthorisedToCreate

```solidity
error DonationFactory__NotAuthorisedToCreate();
```

