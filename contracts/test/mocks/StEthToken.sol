// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC20Permit} from "../../src/interfaces/IERC20Permit.sol";

contract StEthMock is IERC20Permit {
    // Represents the internal shares used to calculate balances.

    mapping(address => uint256) internal shares;

    // Allowances are nominated in tokens, not token shares.
    mapping(address => mapping(address => uint256)) private allowances;

    uint256 public totalShares;
    uint256 public totalPooledEther;

    address internal constant INITIAL_TOKEN_HOLDER = address(0xdead);
    uint256 internal constant INFINITE_ALLOWANCE = ~uint256(0);

    event TransferShares(address indexed from, address indexed to, uint256 sharesValue);

    event SharesBurnt(
        address indexed account, uint256 preRebaseTokenAmount, uint256 postRebaseTokenAmount, uint256 sharesAmount
    );

    /*//////////////////////////////////////////////////////////////
                            METADATA STORAGE
    //////////////////////////////////////////////////////////////*/

    string public name = "Liquid staked Ether 2.0";

    string public symbol = "stETH";

    uint8 public immutable decimals = 18;

    constructor(uint256 initialSupply, uint256 initialTotalShares) payable {
        // _bootstrapInitialHolder
        uint256 balance = address(this).balance;
        assert(balance != 0);

        setTotalPooledEther(initialSupply);
        _mintInitialShares(initialTotalShares);
        INITIAL_CHAIN_ID = block.chainid;
        INITIAL_DOMAIN_SEPARATOR = computeDomainSeparator();
    }

    // function name() public pure returns (string memory) {
    //     return "Liquid staked Ether 2.0";
    // }

    // function symbol() public pure returns (string memory) {
    //     return "stETH";
    // }

    // function decimals() public pure returns (uint8) {
    //     return 18;
    // }

    function totalSupply() public view override returns (uint256) {
        return _getTotalPooledEther();
    }

    function getTotalPooledEther() public view returns (uint256) {
        return _getTotalPooledEther();
    }

    function transfer(address _recipient, uint256 _amount) public returns (bool) {
        _transfer(msg.sender, _recipient, _amount);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowances[_owner][_spender];
    }

    function approve(address _spender, uint256 _amount) public returns (bool) {
        _approve(msg.sender, _spender, _amount);
        return true;
    }

    function transferFrom(address _sender, address _recipient, uint256 _amount) public returns (bool) {
        _spendAllowance(_sender, msg.sender, _amount);
        _transfer(_sender, _recipient, _amount);
        return true;
    }

    function increaseAllowance(address _spender, uint256 _addedValue) public returns (bool) {
        _approve(msg.sender, _spender, allowances[msg.sender][_spender] + _addedValue);
        return true;
    }

    function decreaseAllowance(address _spender, uint256 _subtractedValue) public returns (bool) {
        uint256 currentAllowance = allowances[msg.sender][_spender];
        require(currentAllowance >= _subtractedValue, "ALLOWANCE_BELOW_ZERO");
        _approve(msg.sender, _spender, currentAllowance - _subtractedValue);
        return true;
    }

    function getTotalShares() public view returns (uint256) {
        return _getTotalShares();
    }

    function sharesOf(address _account) public view returns (uint256) {
        return _sharesOf(_account);
    }

    function getSharesByPooledEth(uint256 _ethAmount) public view returns (uint256) {
        return _ethAmount * _getTotalShares() / _getTotalPooledEther();
    }

    function getPooledEthByShares(uint256 _sharesAmount) public view returns (uint256) {
        return _sharesAmount * _getTotalPooledEther() / _getTotalShares();
    }

    function transferShares(address _recipient, uint256 _sharesAmount) public returns (uint256) {
        _transferShares(msg.sender, _recipient, _sharesAmount);
        uint256 tokensAmount = getPooledEthByShares(_sharesAmount);
        _emitTransferEvents(msg.sender, _recipient, tokensAmount, _sharesAmount);
        return tokensAmount;
    }

    function transferSharesFrom(address _sender, address _recipient, uint256 _sharesAmount) public returns (uint256) {
        uint256 tokensAmount = getPooledEthByShares(_sharesAmount);
        _spendAllowance(_sender, msg.sender, tokensAmount);
        _transferShares(_sender, _recipient, _sharesAmount);
        _emitTransferEvents(_sender, _recipient, tokensAmount, _sharesAmount);
        return tokensAmount;
    }

    function balanceOf(address _account) public view override returns (uint256) {
        return getPooledEthByShares(_sharesOf(_account));
    }

    function setTotalShares(uint256 _totalShares) public {
        totalShares = _totalShares;
    }

    function setTotalPooledEther(uint256 _totalPooledEther) public {
        totalPooledEther = _totalPooledEther;
    }

    function _transfer(address _sender, address _recipient, uint256 _amount) internal {
        uint256 _sharesToTransfer = getSharesByPooledEth(_amount);
        _transferShares(_sender, _recipient, _sharesToTransfer);
        _emitTransferEvents(_sender, _recipient, _amount, _sharesToTransfer);
    }

    function _approve(address _owner, address _spender, uint256 _amount) internal {
        require(_owner != address(0), "APPROVE_FROM_ZERO_ADDR");
        require(_spender != address(0), "APPROVE_TO_ZERO_ADDR");

        allowances[_owner][_spender] = _amount;
        emit Approval(_owner, _spender, _amount);
    }

    function _spendAllowance(address _owner, address _spender, uint256 _amount) internal {
        uint256 currentAllowance = allowances[_owner][_spender];
        if (currentAllowance != INFINITE_ALLOWANCE) {
            require(currentAllowance >= _amount, "ALLOWANCE_EXCEEDED");
            _approve(_owner, _spender, currentAllowance - _amount);
        }
    }

    function _getTotalShares() internal view returns (uint256) {
        return totalShares;
    }

    function _sharesOf(address _account) internal view returns (uint256) {
        return shares[_account];
    }

    function _transferShares(address _sender, address _recipient, uint256 _sharesAmount) internal {
        require(_sender != address(0), "TRANSFER_FROM_ZERO_ADDR");
        require(_recipient != address(0), "TRANSFER_TO_ZERO_ADDR");
        require(_recipient != address(this), "TRANSFER_TO_STETH_CONTRACT");

        uint256 currentSenderShares = shares[_sender];
        require(_sharesAmount <= currentSenderShares, "BALANCE_EXCEEDED");

        shares[_sender] = currentSenderShares - _sharesAmount;
        shares[_recipient] = shares[_recipient] + _sharesAmount;
    }

    function _mintShares(address _recipient, uint256 _sharesAmount) internal returns (uint256 newTotalShares) {
        require(_recipient != address(0), "MINT_TO_ZERO_ADDR");

        newTotalShares = _getTotalShares() + _sharesAmount;
        totalShares = newTotalShares;

        shares[_recipient] = shares[_recipient] + _sharesAmount;
    }

    function _burnShares(address _account, uint256 _sharesAmount) internal returns (uint256 newTotalShares) {
        require(_account != address(0), "BURN_FROM_ZERO_ADDR");

        uint256 accountShares = shares[_account];
        require(_sharesAmount <= accountShares, "BALANCE_EXCEEDED");

        uint256 preRebaseTokenAmount = getPooledEthByShares(_sharesAmount);

        newTotalShares = _getTotalShares() - _sharesAmount;
        totalShares = newTotalShares;

        shares[_account] = accountShares - _sharesAmount;

        uint256 postRebaseTokenAmount = getPooledEthByShares(_sharesAmount);

        emit SharesBurnt(_account, preRebaseTokenAmount, postRebaseTokenAmount, _sharesAmount);
    }

    function _emitTransferEvents(address _from, address _to, uint256 _tokenAmount, uint256 _sharesAmount) internal {
        emit Transfer(_from, _to, _tokenAmount);
        emit TransferShares(_from, _to, _sharesAmount);
    }

    function _emitTransferAfterMintingShares(address _to, uint256 _sharesAmount) internal {
        _emitTransferEvents(address(0), _to, getPooledEthByShares(_sharesAmount), _sharesAmount);
    }

    function _mintInitialShares(uint256 _sharesAmount) internal {
        _mintShares(INITIAL_TOKEN_HOLDER, _sharesAmount);
        _emitTransferAfterMintingShares(INITIAL_TOKEN_HOLDER, _sharesAmount);
    }

    function _getTotalPooledEther() internal view virtual returns (uint256) {
        return totalPooledEther;
    }

    //////////////////////////
    // Deposit
    //////////////////////////
    receive() external payable {
        submit(address(0));
    }
    // ETH is sent to the contract and stETH is minted in return.

    fallback() external payable {
        require(msg.data.length == 0, "NON_EMPTY_DATA");
        submit(address(0));
    }

    function submit(address /*referral*/ ) public payable returns (uint256) {
        uint256 sharesToMint = getSharesByPooledEth(msg.value);
        mintShares(msg.sender, sharesToMint);
        setTotalPooledEther(_getTotalPooledEther() + msg.value);
        return sharesToMint;
    }

    // Internal function to mint new stETH.
    function mintShares(address _to, uint256 _sharesAmount) internal returns (uint256 newTotalShares) {
        newTotalShares = _mintShares(_to, _sharesAmount);
        _emitTransferAfterMintingShares(_to, _sharesAmount);
        // shares[account] = (sharesAmount * totalShares) / totalSupply();
        // totalShares += shares[account];
    }

    // Function to simulate the daily token rebase.
    function rebase() external {
        uint256 newTotalSupply = totalSupply() * 10001368 / 10000000; // Approximation of (1 + 0.05)^(1/365)
        setTotalPooledEther(newTotalSupply);
    }

    function burnShares(address _account, uint256 _sharesAmount) public returns (uint256 newTotalShares) {
        return _burnShares(_account, _sharesAmount);
    }

    //////////////////////////
    // Permit Functions    //
    //////////////////////////

    /*//////////////////////////////////////////////////////////////
                            EIP-2612 STORAGE
    //////////////////////////////////////////////////////////////*/

    uint256 internal immutable INITIAL_CHAIN_ID;

    bytes32 internal immutable INITIAL_DOMAIN_SEPARATOR;

    mapping(address => uint256) public nonces;

    /*//////////////////////////////////////////////////////////////
                             EIP-2612 LOGIC
    //////////////////////////////////////////////////////////////*/

    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        public
        virtual
    {
        require(deadline >= block.timestamp, "PERMIT_DEADLINE_EXPIRED");

        // Unchecked because the only math done is incrementing
        // the owner's nonce which cannot realistically overflow.
        unchecked {
            address recoveredAddress = ecrecover(
                keccak256(
                    abi.encodePacked(
                        "\x19\x01",
                        DOMAIN_SEPARATOR(),
                        keccak256(
                            abi.encode(
                                keccak256(
                                    "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                                ),
                                owner,
                                spender,
                                value,
                                nonces[owner]++,
                                deadline
                            )
                        )
                    )
                ),
                v,
                r,
                s
            );

            require(recoveredAddress != address(0) && recoveredAddress == owner, "INVALID_SIGNER");

            allowances[recoveredAddress][spender] = value;
        }

        emit Approval(owner, spender, value);
    }

    function DOMAIN_SEPARATOR() public view virtual returns (bytes32) {
        return block.chainid == INITIAL_CHAIN_ID ? INITIAL_DOMAIN_SEPARATOR : computeDomainSeparator();
    }

    function computeDomainSeparator() internal view virtual returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name)),
                keccak256("2"),
                block.chainid
            )
        );
    }
}
