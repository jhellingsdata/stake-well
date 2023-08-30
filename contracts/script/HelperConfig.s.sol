// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Script} from "../lib/forge-std/src/Script.sol";
import {VRFCoordinatorV2Mock} from "../test/mocks/VRFCoordinatorV2Mock.sol";
import {LinkToken} from "../test/mocks/LinkToken.sol";
// import {StETHMock} from "../test/mocks/StETHMock.sol";
// import {IERC20Permit} from "../src/IERC20Permit.sol";
// import {ERC20Mock} from "../lib/openzeppelin-contracts/contracts/mocks/token/ERC20Mock.sol";
import {StEthMock} from "../test/mocks/StEthToken.sol";

contract HelperConfig is Script {
    NetworkConfig public activeNetworkConfig;

    struct NetworkConfig {
        address steth;
        uint256 interval;
        address vrfCoordinatorV2;
        bytes32 gasLane;
        uint64 subscriptionId;
        uint32 callbackGasLimit;
        uint32 numWords;
        address link;
        uint256 deployerPrivateKey;
    }

    uint256 public DEFAULT_ANVIL_PRIVATE_KEY = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    event HelperConfig__CreatedMockVRFCoordinatorV2(address vrfCoordinatorV2);

    constructor() {
        if (block.chainid == 5) {
            // goerli
            activeNetworkConfig = getGoerliEthConfig();
        } else {
            activeNetworkConfig = getOrCreateAnvilEthConfig();
        }
    }

    function getMainnetEthConfig() public view returns (NetworkConfig memory mainnetNetworkConfig) {
        mainnetNetworkConfig = NetworkConfig({
            steth: 0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84,
            interval: 604800,
            vrfCoordinatorV2: 0x271682DEB8C4E0901D1a1550aD2e64D568E69909,
            gasLane: 0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805,
            subscriptionId: 0,
            callbackGasLimit: 500000,
            numWords: 1,
            link: 0x514910771AF9Ca656af840dff83E8264EcF986CA,
            deployerPrivateKey: vm.envUint("PRIVATE_KEY")
        });
    }

    function getGoerliEthConfig() public view returns (NetworkConfig memory goerliNetworkConfig) {
        goerliNetworkConfig = NetworkConfig({
            steth: 0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F,
            interval: 604800,
            vrfCoordinatorV2: 0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D,
            gasLane: 0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15,
            subscriptionId: 13164,
            callbackGasLimit: 500000,
            numWords: 1,
            link: 0x326C977E6efc84E512bB9C30f76E30c160eD06FB,
            deployerPrivateKey: vm.envUint("GOERLI_PRIVATE_KEY")
        });
    }

    function getOrCreateAnvilEthConfig() public returns (NetworkConfig memory anvilNetworkConfig) {
        if ((activeNetworkConfig.vrfCoordinatorV2 != address(0)) && (activeNetworkConfig.steth != address(0))) {
            return activeNetworkConfig;
        }

        uint96 baseFee = 0.25 ether; // 0.25 LINK
        uint96 gasPriceLink = 1e9; // 1 gwei LINK

        uint256 stethInitialSupply = 445728713247296939121423;
        uint256 stethInitialTotalShares = 380519077399654903647201;

        vm.startBroadcast();
        StEthMock steth =
        new StEthMock{value: stethInitialSupply}({initialSupply: stethInitialSupply, initialTotalShares: stethInitialTotalShares});
        VRFCoordinatorV2Mock vrfCoordinatorV2Mock = new VRFCoordinatorV2Mock(baseFee, gasPriceLink);
        LinkToken link = new LinkToken();
        vm.stopBroadcast();

        anvilNetworkConfig = NetworkConfig({
            steth: address(steth), // need to import local stETH
            interval: 604800,
            vrfCoordinatorV2: address(vrfCoordinatorV2Mock),
            gasLane: 0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15,
            subscriptionId: 0, // update with our subId
            callbackGasLimit: 500000,
            numWords: 1,
            link: address(link),
            deployerPrivateKey: DEFAULT_ANVIL_PRIVATE_KEY
        });
    }
}
