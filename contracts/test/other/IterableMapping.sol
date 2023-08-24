// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

// Iterate a mapping by internally keeping track of all the keys in the mapping
// This will allows us to track the size of the mapping and iterate over it

contract IterableMapping {
    // Mapping to track balance of an address
    mapping(address => uint256) public balances;
    // Mapping to track whether key is inserted or not
    mapping(address => bool) public inserted; // When we insert new data into 'balances' mapping, we'll set the address to true in this mapping
    // Array to track all the keys in the mapping
    address[] public keys;

    // Function to set balance of mapping balances
    function set(address _key, uint256 _val) external {
        balances[_key] = _val;
        // Keep track of whether key is newly inserted
        // If newly inserted, we append to array of keys
        // This allows us to get all the values stored in the `balances` mapping
        if (!inserted[_key]) {
            inserted[_key] = true;
            keys.push(_key);
        }
    }

    function getSize() external view returns (uint256) {
        return keys.length;
    }

    function first() external view returns (uint256) {
        return balances[keys[0]];
    }

    function last() external view returns (uint256) {
        return balances[keys[keys.length - 1]];
    }
}
