// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {IERC20Permit} from "./interfaces/IERC20Permit.sol";
import {DonationPool} from "./DonationPool.sol";

contract DonationFactory {
    ///////////////////
    // Errors
    ///////////////////
    error DonationFactory__NotAuthorisedToCreate();

    ///////////////////
    // Type Declarations
    ///////////////////

    ///////////////////
    // State Variables
    ///////////////////
    IERC20Permit private immutable i_stETH;
    address private immutable i_owner;
    mapping(address => bool) public isDonationPool;
    DonationPool[] private donationPools;

    ///////////////////
    // Events
    ///////////////////
    event DonationPoolCreated(
        address indexed donationPool, address indexed beneficiary, uint256 indexed poolIndex, string title
    );

    ///////////////////
    // Modifiers    //
    ///////////////////
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert DonationFactory__NotAuthorisedToCreate();
        }
        _;
    }

    ///////////////////
    // Functions     //
    ///////////////////
    constructor(address steth) {
        i_owner = msg.sender;
        i_stETH = IERC20Permit(steth);
    }

    ///////////////////
    // External Functions
    ///////////////////
    function createDonationPool(address _manager, address _beneficiary, string memory _title) external onlyOwner {
        DonationPool newDonationPool = new DonationPool(address(i_stETH), _manager, _beneficiary);
        donationPools.push(newDonationPool);
        emit DonationPoolCreated(address(newDonationPool), _beneficiary, donationPools.length - 1, _title);
    }

    // Set up function(s) to allow creation of a donation pool by someone other than factory owner
    function temporaryAuthorisation() external {}

    ///////////////////
    // Getter Functions
    ///////////////////
    function getCampaignInfo(uint256 _index)
        external
        view
        returns (address, address, address[] memory, uint256, uint256)
    {
        return donationPools[_index].getCampaignInfo();
    }

    function getCampaignCount() external view returns (uint256) {
        return donationPools.length;
    }
}
