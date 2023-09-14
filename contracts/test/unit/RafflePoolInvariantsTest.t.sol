// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Test, console} from "../../lib/forge-std/src/Test.sol";
import {stdStorage, StdStorage} from "../../lib/forge-std/src/Test.sol";
import {Vm} from "../../lib/forge-std/src/Vm.sol";
import {StdCheats} from "../../lib/forge-std/src/StdCheats.sol";
import {StdUtils} from "../../lib/forge-std/src/StdUtils.sol";
import {DeployRafflePool} from "../../script/DeployRafflePool.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {VRFCoordinatorV2Mock} from "../mocks/VRFCoordinatorV2Mock.sol";
import {RafflePool} from "../../src/RafflePool.sol";
import {IERC20Permit} from "../../src/interfaces/IERC20Permit.sol";
import {StEthMock} from "../mocks/StEthToken.sol";
import {SigUtils} from "../mocks/utils/SigUtils.sol";
import {InvariantTest} from "../../lib/forge-std/src/InvariantTest.sol";
import {RafflePoolHandler} from "../invariants/RafflePoolHandler.t.sol";

contract RafflePoolTest is InvariantTest, StdCheats, Test {
    RafflePool rafflePool;
    HelperConfig helperConfig;
    SigUtils sigUtils;
    RafflePoolHandler handler;

    StEthMock public StEth;
    address steth;
    uint256 interval;
    // uint256 deployerKey;
    uint256 ownerPrivateKey;
    address public PLAYER;
    address public USER1;
    uint256 public constant STARTING_USER_BALANCE = 10 ether;

    function setUp() external {
        DeployRafflePool deployer = new DeployRafflePool();
        (rafflePool, helperConfig) = deployer.run();
        ownerPrivateKey = 0xABC;
        PLAYER = vm.addr(ownerPrivateKey);
        USER1 = vm.addr(0x123);
        vm.deal(PLAYER, STARTING_USER_BALANCE);
        vm.deal(USER1, STARTING_USER_BALANCE);
        (
            steth, // stETH
            interval,
            ,
            ,
            ,
            ,
            ,
            , // link
                // deployerKey // deployerPrivateKey
        ) = helperConfig.activeNetworkConfig(); // now these are all getting saved as state vars so can use them in tests below
        StEth = StEthMock(payable(steth));
        sigUtils = new SigUtils(StEth.DOMAIN_SEPARATOR());
        handler = new RafflePoolHandler(rafflePool, StEth);
        deal(address(handler), 1000 * 1e18);
        targetContract(address(handler));
    }

    /////////////////////////
    // Modifiers          //
    ////////////////////////
    modifier getStEth(address _address) {
        vm.prank(_address);
        (bool success,) = address(steth).call{value: STARTING_USER_BALANCE}("");
        _;
    }

    modifier raffleRebaseAndTimePassed() {
        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 1 days);
            StEth.rebase();
        }
        vm.warp(block.timestamp + 1);
        _;
    }

    //////////////////////////
    // Raffle Scaling Test  //
    //////////////////////////

    //////////////////////////
    // Active Users Array   //
    //////////////////////////

    //////////////////////////
    // Invariants           //
    //////////////////////////
    // Function to check for duplicates in activeUsers
    function _hasDuplicates() internal returns (bool) {
        string memory path = "tests/array_activeUsers.txt";
        address[] memory s_activeUsers = rafflePool.getActiveDepositors();
        vm.writeLine(path, vm.toString(s_activeUsers.length));
        for (uint256 i = 0; i < s_activeUsers.length; i++) {
            for (uint256 j = i + 1; j < s_activeUsers.length; j++) {
                if (s_activeUsers[i] == s_activeUsers[j]) {
                    return true; // Found a duplicate
                }
            }
        }
        return false;
    }

    function invariant_testActiveUsersNeverContainsDuplicates() public {
        assertEq(_hasDuplicates(), false, "Active users array contains duplicates");
    }

    function _sumOfUserTwabs() internal view returns (uint256 userTwabSum) {
        // get user number
        uint256 userCount = rafflePool.getActiveDepositorsCount();
        // get array of user address
        address[] memory users = rafflePool.getActiveDepositors();
        // calculate user twab
        for (uint256 i = 0; i < userCount; i++) {
            uint256 userTwab = rafflePool.getTwab(users[i], 0, block.timestamp);
            // add to total twab
            userTwabSum += userTwab;
        }
    }

    function invariant_testTotalTwabIsAlwaysSumOfUserTwabs() public {
        uint256 userTwabSum = _sumOfUserTwabs();
        uint256 totalTwab = rafflePool.getTwab(address(0), 0, block.timestamp);
        assertEq(userTwabSum, totalTwab, "Total twab is not sum of user twabs");
    }
}
