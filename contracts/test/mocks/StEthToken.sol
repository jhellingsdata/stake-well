// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// import {ERC20} from "@solmate/tokens/ERC20.sol";
// ERC20("Mock stETH", "stETH", 18)
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StEthMock is IERC20 {
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

    constructor(uint256 initialSupply, uint256 initialTotalShares) payable {
        // _bootstrapInitialHolder
        uint256 balance = address(this).balance;
        assert(balance != 0);

        setTotalPooledEther(initialSupply);
        _mintInitialShares(initialTotalShares);
    }

    function name() public pure returns (string memory) {
        return "Liquid staked Ether 2.0";
    }

    function symbol() public pure returns (string memory) {
        return "stETH";
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

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

    ///////

    function _getTotalPooledEther() internal view virtual returns (uint256) {
        return totalPooledEther;
    }

    //////////////////////////
    // Deposit
    //////////////////////////
    receive() external payable {}
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

    // function _mintShares(address _recipient, uint256 _sharesAmount) internal returns (uint256 newTotalShares) {
    //     newTotalShares = totalShares + _sharesAmount;
    //     totalShares = newTotalShares;
    //     shares[_recipient] += _sharesAmount;
    // }

    // // Override the balanceOf function to reflect rebase.
    // function balanceOf(address _account) public view override returns (uint256) {
    //     return getPooledEthByShares(_sharesOf(_account));
    // }

    // Function to simulate the daily token rebase.
    function rebase() external {
        uint256 newTotalSupply = totalSupply() * 10001368 / 10000000; // Approximation of (1 + 0.05)^(1/365)
        uint256 mintAmount = newTotalSupply - totalSupply();
        mintShares(address(this), mintAmount);
    }

    function burnShares(address _account, uint256 _sharesAmount) public returns (uint256 newTotalShares) {
        return _burnShares(_account, _sharesAmount);
    }

    // // Optional: Function to burn stETH and retrieve ETH.
    // function burnAndRetrieveETH(uint256 amount) external {
    //     require(balanceOf(msg.sender) >= amount, "Insufficient balance");
    //     uint256 ethAmount = (amount * address(this).balance) / totalSupply();
    //     payable(msg.sender).transfer(ethAmount);
    //     _burn(msg.sender, amount);
    // }

    // // Internal function to burn stETH.
    // function _burn(address account, uint256 amount) internal override {
    //     shares[account] -= (amount * totalShares) / totalSupply();
    //     totalShares -= (amount * totalShares) / totalSupply();
    //     super._burn(account, amount);
    // }

    //////////////////////////
    // Getter Functions
    //////////////////////////

    // function getSharesByPooledEth(uint256 _pooledEthAmount) public view returns (uint256) {
    //     return _pooledEthAmount * totalShares / totalPooledEther;
    // }

    // function getPooledEthByShares(uint256 _sharesAmount) public view returns (uint256) {
    //     return _sharesAmount * totalPooledEther / totalShares;
    // }
}
