// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Script} from "../lib/forge-std/src/Script.sol";
import {StEthMock} from "../test/mocks/StEthToken.sol";

contract HelperConfigDonation is Script {
    NetworkConfig public activeNetworkConfig;

    struct NetworkConfig {
        address steth;
        uint256 platformFee; // 10000 = 100%
        uint256 deployerPrivateKey;
    }

    uint256 public DEFAULT_ANVIL_PRIVATE_KEY = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    constructor() {
        if (block.chainid == 5) {
            // goerli
            activeNetworkConfig = getGoerliEthConfig();
        } else {
            // local Anvil
            activeNetworkConfig = getOrCreateAnvilEthConfig();
        }
    }

    function getGoerliEthConfig() public view returns (NetworkConfig memory goerliNetworkConfig) {
        goerliNetworkConfig = NetworkConfig({
            steth: 0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F,
            platformFee: 200,
            deployerPrivateKey: vm.envUint("GOERLI_PRIVATE_KEY")
        });
    }

    function getOrCreateAnvilEthConfig() public returns (NetworkConfig memory anvilNetworkConfig) {
        if (activeNetworkConfig.steth != address(0)) {
            return activeNetworkConfig;
        }

        uint256 stethInitialSupply = 445728713247296939121423;
        uint256 stethInitialTotalShares = 380519077399654903647201;
        uint256 PLATFORM_FEE = 200; // 2%

        vm.startBroadcast();
        StEthMock steth =
        new StEthMock{value: stethInitialSupply}({initialSupply: stethInitialSupply, initialTotalShares: stethInitialTotalShares});
        vm.stopBroadcast();

        anvilNetworkConfig = NetworkConfig({
            steth: address(steth),
            platformFee: PLATFORM_FEE,
            deployerPrivateKey: DEFAULT_ANVIL_PRIVATE_KEY
        });
    }
}
