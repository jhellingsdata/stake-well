# IERC20Permit
[Git Source](https://github.com/jhellingsdata/stake-well/blob/876a208256f933daf256e715a8b09c75146af820/contracts/src/interfaces/IERC20Permit.sol)


## Functions
### totalSupply


```solidity
function totalSupply() external view returns (uint256);
```

### balanceOf


```solidity
function balanceOf(address account) external view returns (uint256);
```

### transfer


```solidity
function transfer(address recipient, uint256 amount) external returns (bool);
```

### allowance


```solidity
function allowance(address owner, address spender) external view returns (uint256);
```

### approve


```solidity
function approve(address spender, uint256 amount) external returns (bool);
```

### transferFrom


```solidity
function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
```

### getTotalShares


```solidity
function getTotalShares() external view returns (uint256);
```

### sharesOf


```solidity
function sharesOf(address _account) external view returns (uint256);
```

### getSharesByPooledEth


```solidity
function getSharesByPooledEth(uint256 _ethAmount) external view returns (uint256);
```

### getPooledEthByShares


```solidity
function getPooledEthByShares(uint256 _sharesAmount) external view returns (uint256);
```

### transferShares


```solidity
function transferShares(address _recipient, uint256 _sharesAmount) external returns (uint256);
```

### transferSharesFrom


```solidity
function transferSharesFrom(address _sender, address _recipient, uint256 _sharesAmount) external returns (uint256);
```

### submit


```solidity
function submit(address _referral) external payable returns (uint256);
```

### permit


```solidity
function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
    external;
```

### nonces

*Returns the current nonce for `owner`. This value must be
included whenever a signature is generated for {permit}.
Every successful call to {permit} increases ``owner``'s nonce by one. This
prevents a signature from being used multiple times.*


```solidity
function nonces(address owner) external view returns (uint256);
```

### DOMAIN_SEPARATOR

*Returns the domain separator used in the encoding of the signature for {permit}, as defined by {EIP712}.*


```solidity
function DOMAIN_SEPARATOR() external view returns (bytes32);
```

## Events
### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
```

### Approval

```solidity
event Approval(address indexed owner, address indexed spender, uint256 value);
```

