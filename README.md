# StakeWell Protocol

Ethereum-based no-loss protocol, leveraging Eth2.0 and Lido's stETH to find exciting new uses for staking rewards.

**Raffle Pools** - stake your stETH in the raffle pool to have a chance to win a weekly prize jackpot. The higher your contribution to the pool, the greater your chance of winning. All the players staking rewards are pooled together and each week, a raffle automatically calculates a winner and assigns the prize jackpot to the winner's deposit balance. This pool utilises Chainlink VRF to ensure verifiable randomness and a fair raffle process.

**Donation Pools** - stake your stETH in a donation pool for a no-loss way to support the causes you care about. Would you like to set up a campaign? Use our donation factory to create a new donation pool.

These pools are fully non-custodial. No fees, no time-locks: withdraw your full stETH deposit at any time.

<br/>

### View Deployed Contracts on Goerli Testnet

RafflePool: https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d

DonationFactory: https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE

---

### View Frontend

Deployed at https://stakewell-rosy.vercel.app/

Notes:

-   DonationPool interaction is not yet implemented, currently can only create a campaign.

<!-- Create a table of contents -->

## Table of Contents

<summary> <a href="#smart-contracts">Smart Contracts</a></summary>
<ol>
  <li>
  <a>RafflePool</a>
  </li>
  <li>
  <a href="#donation-factory">DonationFactory.sol</a>
  </li>
  <li>
  <a href="#donation-pool">DonationPool.sol</a>
  </li>
</ol>

<summary> <a href="#testing">Testing</a></summary>
<ol>
  <li>
  <a href="#testing">Tests</a>
  </li>
  <li>
  <a href="#scripts">Scripts</a>
  </li>
</ol>
<summary> <a href="#frontend">Frontend</a></summary>
<ol>

</ol>

<br/>

<!--
- [Smart Contracts](#smart-contracts)
    - [RafflePool.sol](#raffle-poolsol)
    - [DonationFactory.sol](#donation-factory)
    - [DonationPool.sol](#donation-pool)
 -->

# Smart Contracts

In `contracts/src/` folder.

## RafflePool.sol

Deployed at https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d

## DonationFactory.sol

Deployed at https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE

## DonationPool.sol

[Example Campaign] Deployed at https://goerli.etherscan.io/address/0xf28726b71b0B442858A9DcFbf1F3A71F117bd7E2

-   Support our playform development by staking your `stETH` in this pool!

<br/>

# Testing

Tests and helper scripts written in Solidity using Foundry - https://book.getfoundry.sh/

Test folder: `contracts/test/`.

**`unit/RaffleTest.t.sol`** - main unit and fuzz test file for the RafflePool contract.

**`unit/RafflePoolInvariantsTest.t.sol`** - invariants tests for the RafflePool contract.

**`invariants/RaffleTest.t.sol`** - handler file for `RafflePoolInvariantsTest.t.sol` invariants tests of RafflePool contract.

**`unit/DonationFactoryTest.t.sol`** - main test file for the DonationFactory and DonationPool contracts.

**`unit/StEthTest.sol`** - test file for the `mocks/StEthToken.sol` contract.

### Scripts

-   `DeployRafflePool.s.sol` - script to deploy the RafflePool contract.

-   `HelperConfig.s.sol` - helper script to populate constructor values when deploying `RafflePool` contract.

-   `Interactions.s.sol` - helper script to programmatically set up interactions with Chainlink VRF when deploying `RafflePool` contract.

<br/>

-   `DeployDonationFactory.s.sol` - script to deploy the `DonationFactory` contract.

-   `HelperConfigDonation.s.sol` - helper script to populate constructor values when deploying `DonationFactory` contract.

# Frontend

Next.js 13 & Typescript Project.
Initialised using Wagmi create-next-app.

Utilises new Next13 app router, within `src` folder.
