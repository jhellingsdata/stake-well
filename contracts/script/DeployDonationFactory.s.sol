// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Script} from "../lib/forge-std/src/Script.sol";
import {DonationFactory} from "../src/DonationFactory.sol";
import {HelperConfigDonation} from "./HelperConfigDonation.s.sol";

contract DeployDonationFactory is Script {
    function run() external returns (DonationFactory, HelperConfigDonation) {
        HelperConfigDonation helperConfig = new HelperConfigDonation();
        (address steth, uint256 deployerPrivateKey) = helperConfig.activeNetworkConfig();

        // if we are on a local Anvil chain, set genesis timestamp to current time: 1693409871
        if (block.chainid == 31337) {
            vm.warp(1693408871);
        }
        vm.startBroadcast(deployerPrivateKey);
        DonationFactory donationFactory = new DonationFactory(
            steth
        );
        vm.stopBroadcast();

        return (donationFactory, helperConfig);
    }
}
