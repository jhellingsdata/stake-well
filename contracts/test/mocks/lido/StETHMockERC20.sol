// SPDX-FileCopyrightText: 2021 Lido <info@lido.fi>

// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0; // latest available for using OZ

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

//TODO: use StETHMock from 0.4.24 instead of this ERC20 based impl
contract StETHMockERC20 is ERC20, ERC20Burnable {
    constructor() ERC20("Liquid staked Lido Ether", "StETH") {}

    uint256 public totalShares;
    uint256 public totalPooledEther;

    function mint(address recipient, uint256 amount) public {
        _mint(recipient, amount);
    }

    function slash(address holder, uint256 amount) public {
        _burn(holder, amount);
    }

    function submit(address /*referral*/ ) external payable returns (uint256) {
        uint256 sharesToMint = getSharesByPooledEth(msg.value);
        _mint(msg.sender, sharesToMint);
        return sharesToMint;
    }

    function setTotalShares(uint256 _totalShares) public {
        totalShares = _totalShares;
    }

    function setTotalPooledEther(uint256 _totalPooledEther) public {
        totalPooledEther = _totalPooledEther;
    }

    function getPooledEthByShares(uint256 _sharesAmount) public view returns (uint256) {
        if (totalShares == 0) {
            return 0;
        }
        return _sharesAmount * totalPooledEther / totalShares;
    }

    function getSharesByPooledEth(uint256 _pooledEthAmount) public view returns (uint256) {
        if (totalPooledEther == 0) {
            return 0;
        }
        return _pooledEthAmount * totalShares / totalPooledEther;
    }
}
