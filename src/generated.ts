import {
    useContractRead,
    UseContractReadConfig,
    useContractWrite,
    Address,
    UseContractWriteConfig,
    usePrepareContractWrite,
    UsePrepareContractWriteConfig,
    useContractEvent,
    UseContractEventConfig,
} from 'wagmi'
import {
    ReadContractResult,
    WriteContractMode,
    PrepareWriteContractResult,
} from 'wagmi/actions'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DonationFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export const donationFactoryABI = [
    {
        stateMutability: 'nonpayable',
        type: 'constructor',
        inputs: [
            { name: 'steth', internalType: 'address', type: 'address' },
            { name: 'platformFee', internalType: 'uint256', type: 'uint256' },
        ],
    },
    {
        type: 'error',
        inputs: [],
        name: 'DonationFactory__ExceedsMaxProtocolFee',
    },
    {
        type: 'error',
        inputs: [],
        name: 'DonationFactory__NotAuthorisedToCreate',
    },
    { type: 'error', inputs: [], name: 'DonationFactory__WithdrawalFailed' },
    { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'donationPool',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'beneficiary',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'poolIndex',
                internalType: 'uint256',
                type: 'uint256',
                indexed: true,
            },
            {
                name: 'title',
                internalType: 'string',
                type: 'string',
                indexed: false,
            },
        ],
        name: 'DonationPoolCreated',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'newFee',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'ProtocolFeeAdjusted',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'amount',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'ProtocolFeeWithdrawn',
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [{ name: 'newFee', internalType: 'uint256', type: 'uint256' }],
        name: 'adjustPlatformFee',
        outputs: [],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
            { name: '_manager', internalType: 'address', type: 'address' },
            { name: '_beneficiary', internalType: 'address', type: 'address' },
            { name: '_title', internalType: 'string', type: 'string' },
        ],
        name: 'createDonationPool',
        outputs: [],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: '', internalType: 'address', type: 'address' }],
        name: 'donationPoolIndex',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: '_index', internalType: 'uint256', type: 'uint256' }],
        name: 'getCampaignRewardsBalance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getCurrentPlatformFee',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
        name: 'getDonationPoolAddress',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: '_index', internalType: 'uint256', type: 'uint256' }],
        name: 'getDonationPoolBeneficiary',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: '_index', internalType: 'uint256', type: 'uint256' }],
        name: 'getDonationPoolContributorsCount',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: '_index', internalType: 'uint256', type: 'uint256' }],
        name: 'getDonationPoolDepositBalance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [
            { name: '_donationPool', internalType: 'address', type: 'address' },
        ],
        name: 'getDonationPoolIndex',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: '_index', internalType: 'uint256', type: 'uint256' }],
        name: 'getDonationPoolManager',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getDonationPoolsCount',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getFactoryFeeBalance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [],
        name: 'withdrawPlatformFee',
        outputs: [],
    },
] as const

/**
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export const donationFactoryAddress = {
    5: '0x9eDA587356793083C7b91E622b8e666A654Ca0EE',
} as const

/**
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export const donationFactoryConfig = {
    address: donationFactoryAddress,
    abi: donationFactoryABI,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DonationPool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const donationPoolABI = [
    {
        stateMutability: 'nonpayable',
        type: 'constructor',
        inputs: [
            { name: 'steth', internalType: 'address', type: 'address' },
            { name: '_manager', internalType: 'address', type: 'address' },
            { name: '_beneficiary', internalType: 'address', type: 'address' },
            { name: '_platformFee', internalType: 'uint256', type: 'uint256' },
        ],
    },
    { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
    {
        type: 'error',
        inputs: [
            { name: 'account', internalType: 'address', type: 'address' },
            { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
        ],
        name: 'AccessControlUnauthorizedAccount',
    },
    {
        type: 'error',
        inputs: [],
        name: 'DonationPool__InsufficientRewardsBalance',
    },
    {
        type: 'error',
        inputs: [],
        name: 'DonationPool__InsufficientStEthBalance',
    },
    { type: 'error', inputs: [], name: 'DonationPool__MintFailed' },
    { type: 'error', inputs: [], name: 'DonationPool__NeedsMoreThanZero' },
    { type: 'error', inputs: [], name: 'DonationPool__NotAuthorised' },
    { type: 'error', inputs: [], name: 'DonationPool__StEthTransferFailed' },
    { type: 'error', inputs: [], name: 'DonationPool__WithdrawalFailed' },
    { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'depositor',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'amount',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
            {
                name: 'newBalance',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'DepositSuccessful',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'depositor',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'amount',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
            {
                name: 'newBalance',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'MintAndDepositSuccessful',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'withdrawer',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'amount',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'RewardsWithdrawSuccessful',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'role',
                internalType: 'bytes32',
                type: 'bytes32',
                indexed: true,
            },
            {
                name: 'previousAdminRole',
                internalType: 'bytes32',
                type: 'bytes32',
                indexed: true,
            },
            {
                name: 'newAdminRole',
                internalType: 'bytes32',
                type: 'bytes32',
                indexed: true,
            },
        ],
        name: 'RoleAdminChanged',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'role',
                internalType: 'bytes32',
                type: 'bytes32',
                indexed: true,
            },
            {
                name: 'account',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'sender',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
        ],
        name: 'RoleGranted',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'role',
                internalType: 'bytes32',
                type: 'bytes32',
                indexed: true,
            },
            {
                name: 'account',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'sender',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
        ],
        name: 'RoleRevoked',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'withdrawer',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'amount',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
            {
                name: 'newBalance',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'WithdrawSuccessful',
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'DEFAULT_ADMIN_ROLE',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'MANAGER_ROLE',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'OPERATOR_ROLE',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    },
    {
        stateMutability: 'payable',
        type: 'function',
        inputs: [],
        name: 'depositEth',
        outputs: [],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
            { name: 'amount', internalType: 'uint256', type: 'uint256' },
            { name: 'deadline', internalType: 'uint256', type: 'uint256' },
            { name: 'v', internalType: 'uint8', type: 'uint8' },
            { name: 'r', internalType: 'bytes32', type: 'bytes32' },
            { name: 's', internalType: 'bytes32', type: 'bytes32' },
        ],
        name: 'depositStEthWithPermit',
        outputs: [],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getCampaignBeneficiary',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getCampaignDepositBalance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getCampaignFee',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getCampaignManager',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getCampaignRewardsBalance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
        name: 'getContributorAddress',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getContributorCount',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getFactoryAddress',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
        name: 'getRoleAdmin',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [
            { name: 'userAddress', internalType: 'address', type: 'address' },
        ],
        name: 'getUserContributorsIndex',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [
            { name: 'userAddress', internalType: 'address', type: 'address' },
        ],
        name: 'getUserDepositBalance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
            { name: 'role', internalType: 'bytes32', type: 'bytes32' },
            { name: 'account', internalType: 'address', type: 'address' },
        ],
        name: 'grantRole',
        outputs: [],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [
            { name: 'role', internalType: 'bytes32', type: 'bytes32' },
            { name: 'account', internalType: 'address', type: 'address' },
        ],
        name: 'hasRole',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
            { name: 'role', internalType: 'bytes32', type: 'bytes32' },
            {
                name: 'callerConfirmation',
                internalType: 'address',
                type: 'address',
            },
        ],
        name: 'renounceRole',
        outputs: [],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
            { name: 'role', internalType: 'bytes32', type: 'bytes32' },
            { name: 'account', internalType: 'address', type: 'address' },
        ],
        name: 'revokeRole',
        outputs: [],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [
            { name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' },
        ],
        name: 'supportsInterface',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [],
        name: 'withdrawRewards',
        outputs: [],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
        name: 'withdrawStEth',
        outputs: [],
    },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC20Permit
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20PermitABI = [
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'owner',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'spender',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'value',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'Approval',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'from',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'to',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'value',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'Transfer',
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'DOMAIN_SEPARATOR',
        outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [
            { name: 'owner', internalType: 'address', type: 'address' },
            { name: 'spender', internalType: 'address', type: 'address' },
        ],
        name: 'allowance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
            { name: 'spender', internalType: 'address', type: 'address' },
            { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [
            { name: '_sharesAmount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'getPooledEthByShares',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [
            { name: '_ethAmount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'getSharesByPooledEth',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getTotalShares',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
        name: 'nonces',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
            { name: 'owner', internalType: 'address', type: 'address' },
            { name: 'spender', internalType: 'address', type: 'address' },
            { name: 'value', internalType: 'uint256', type: 'uint256' },
            { name: 'deadline', internalType: 'uint256', type: 'uint256' },
            { name: 'v', internalType: 'uint8', type: 'uint8' },
            { name: 'r', internalType: 'bytes32', type: 'bytes32' },
            { name: 's', internalType: 'bytes32', type: 'bytes32' },
        ],
        name: 'permit',
        outputs: [],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [
            { name: '_account', internalType: 'address', type: 'address' },
        ],
        name: 'sharesOf',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'payable',
        type: 'function',
        inputs: [
            { name: '_referral', internalType: 'address', type: 'address' },
        ],
        name: 'submit',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'totalSupply',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
            { name: 'recipient', internalType: 'address', type: 'address' },
            { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'transfer',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
            { name: 'sender', internalType: 'address', type: 'address' },
            { name: 'recipient', internalType: 'address', type: 'address' },
            { name: 'amount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'transferFrom',
        outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
            { name: '_recipient', internalType: 'address', type: 'address' },
            { name: '_sharesAmount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'transferShares',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
            { name: '_sender', internalType: 'address', type: 'address' },
            { name: '_recipient', internalType: 'address', type: 'address' },
            { name: '_sharesAmount', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'transferSharesFrom',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RafflePool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export const rafflePoolABI = [
    {
        stateMutability: 'nonpayable',
        type: 'constructor',
        inputs: [
            { name: 'steth', internalType: 'address', type: 'address' },
            { name: 'interval', internalType: 'uint256', type: 'uint256' },
            {
                name: 'vrfCoordinatorV2',
                internalType: 'address',
                type: 'address',
            },
            { name: 'gasLane', internalType: 'bytes32', type: 'bytes32' },
            { name: 'subscriptionId', internalType: 'uint64', type: 'uint64' },
            {
                name: 'callbackGasLimit',
                internalType: 'uint32',
                type: 'uint32',
            },
            { name: 'numWords', internalType: 'uint32', type: 'uint32' },
        ],
    },
    {
        type: 'error',
        inputs: [
            { name: 'have', internalType: 'address', type: 'address' },
            { name: 'want', internalType: 'address', type: 'address' },
        ],
        name: 'OnlyCoordinatorCanFulfill',
    },
    {
        type: 'error',
        inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
        name: 'OwnableInvalidOwner',
    },
    {
        type: 'error',
        inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
        name: 'OwnableUnauthorizedAccount',
    },
    { type: 'error', inputs: [], name: 'RafflePool__ExceedsMaxProtocolFee' },
    { type: 'error', inputs: [], name: 'RafflePool__InsufficientAllowance' },
    { type: 'error', inputs: [], name: 'RafflePool__InsufficientFeeBalance' },
    { type: 'error', inputs: [], name: 'RafflePool__InsufficientStEthBalance' },
    { type: 'error', inputs: [], name: 'RafflePool__MintFailed' },
    { type: 'error', inputs: [], name: 'RafflePool__NeedsMoreThanZero' },
    { type: 'error', inputs: [], name: 'RafflePool__RaffleDrawInProgress' },
    { type: 'error', inputs: [], name: 'RafflePool__StEthTransferFailed' },
    {
        type: 'error',
        inputs: [
            { name: 'raffleBalance', internalType: 'uint256', type: 'uint256' },
            { name: 'raffleState', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'RafflePool__UpkeepNotNeeded',
    },
    { type: 'error', inputs: [], name: 'RafflePool__WithdrawalFailed' },
    { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'depositor',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'amount',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
            {
                name: 'newBalance',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'DepositSuccessful',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'depositor',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'amount',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
            {
                name: 'newBalance',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'MintAndDepositSuccessful',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'previousOwner',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'newOwner',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
        ],
        name: 'OwnershipTransferred',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'winner',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'amount',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'PickedWinner',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'newFee',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'ProtocolFeeAdjusted',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'amount',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'ProtocolFeeWithdrawn',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'randomWord',
                internalType: 'uint256',
                type: 'uint256',
                indexed: true,
            },
        ],
        name: 'RandomWord',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'requestId',
                internalType: 'uint256',
                type: 'uint256',
                indexed: true,
            },
        ],
        name: 'RequestedRaffleWinner',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'scaledNum',
                internalType: 'uint256',
                type: 'uint256',
                indexed: true,
            },
        ],
        name: 'ScaledRandomNumber',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'newRewardsTotal',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'StakingRewardsUpdated',
    },
    {
        type: 'event',
        anonymous: false,
        inputs: [
            {
                name: 'withdrawer',
                internalType: 'address',
                type: 'address',
                indexed: true,
            },
            {
                name: 'amount',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
            {
                name: 'newBalance',
                internalType: 'uint256',
                type: 'uint256',
                indexed: false,
            },
        ],
        name: 'WithdrawSuccessful',
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [{ name: 'newFee', internalType: 'uint256', type: 'uint256' }],
        name: 'adjustPlatformFee',
        outputs: [],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
        name: 'checkUpkeep',
        outputs: [
            { name: 'upkeepNeeded', internalType: 'bool', type: 'bool' },
            { name: '', internalType: 'bytes', type: 'bytes' },
        ],
    },
    {
        stateMutability: 'payable',
        type: 'function',
        inputs: [],
        name: 'depositEth',
        outputs: [],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
        name: 'depositStEth',
        outputs: [],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
            { name: 'amount', internalType: 'uint256', type: 'uint256' },
            { name: 'deadline', internalType: 'uint256', type: 'uint256' },
            { name: 'v', internalType: 'uint8', type: 'uint8' },
            { name: 'r', internalType: 'bytes32', type: 'bytes32' },
            { name: 's', internalType: 'bytes32', type: 'bytes32' },
        ],
        name: 'depositStEthWithPermit',
        outputs: [],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getActiveDepositors',
        outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getActiveDepositorsCount',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getInterval',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getLastTimestamp',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getLastTotalBalanceLog',
        outputs: [
            {
                name: '',
                internalType: 'struct RafflePool.BalanceLog',
                type: 'tuple',
                components: [
                    {
                        name: 'balance',
                        internalType: 'uint256',
                        type: 'uint256',
                    },
                    {
                        name: 'timestamp',
                        internalType: 'uint256',
                        type: 'uint256',
                    },
                ],
            },
        ],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'getLastUserBalanceLog',
        outputs: [
            {
                name: '',
                internalType: 'struct RafflePool.BalanceLog',
                type: 'tuple',
                components: [
                    {
                        name: 'balance',
                        internalType: 'uint256',
                        type: 'uint256',
                    },
                    {
                        name: 'timestamp',
                        internalType: 'uint256',
                        type: 'uint256',
                    },
                ],
            },
        ],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getPlatformFee',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getPlatformFeeBalance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getRaffleState',
        outputs: [
            {
                name: '',
                internalType: 'enum RafflePool.RaffleState',
                type: 'uint8',
            },
        ],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getRecentWinner',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getStakingRewardsTotal',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getTotalBalance',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getTotalBalanceLog',
        outputs: [
            {
                name: '',
                internalType: 'struct RafflePool.BalanceLog[]',
                type: 'tuple[]',
                components: [
                    {
                        name: 'balance',
                        internalType: 'uint256',
                        type: 'uint256',
                    },
                    {
                        name: 'timestamp',
                        internalType: 'uint256',
                        type: 'uint256',
                    },
                ],
            },
        ],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getTotalUserDeposits',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [
            { name: 'userAddress', internalType: 'address', type: 'address' },
            { name: 's_startTime', internalType: 'uint256', type: 'uint256' },
            { name: 's_endTime', internalType: 'uint256', type: 'uint256' },
        ],
        name: 'getTwab',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'getUserBalanceLog',
        outputs: [
            {
                name: '',
                internalType: 'struct RafflePool.BalanceLog[]',
                type: 'tuple[]',
                components: [
                    {
                        name: 'balance',
                        internalType: 'uint256',
                        type: 'uint256',
                    },
                    {
                        name: 'timestamp',
                        internalType: 'uint256',
                        type: 'uint256',
                    },
                ],
            },
        ],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
        name: 'getUserDeposit',
        outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    },
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'owner',
        outputs: [{ name: '', internalType: 'address', type: 'address' }],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
        name: 'performUpkeep',
        outputs: [],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
            { name: 'requestId', internalType: 'uint256', type: 'uint256' },
            {
                name: 'randomWords',
                internalType: 'uint256[]',
                type: 'uint256[]',
            },
        ],
        name: 'rawFulfillRandomWords',
        outputs: [],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [
            { name: 'newOwner', internalType: 'address', type: 'address' },
        ],
        name: 'transferOwnership',
        outputs: [],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [],
        name: 'withdrawPlatformFee',
        outputs: [],
    },
    {
        stateMutability: 'nonpayable',
        type: 'function',
        inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
        name: 'withdrawStEth',
        outputs: [],
    },
] as const

/**
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export const rafflePoolAddress = {
    5: '0x82276EA98dF755d4AF1324142A236Fe1732E111d',
} as const

/**
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export const rafflePoolConfig = {
    address: rafflePoolAddress,
    abi: rafflePoolABI,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationFactoryABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryRead<
    TFunctionName extends string,
    TSelectData = ReadContractResult<typeof donationFactoryABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationFactoryABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'address'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractRead({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        ...config,
    } as UseContractReadConfig<
        typeof donationFactoryABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"donationPoolIndex"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryDonationPoolIndex<
    TFunctionName extends 'donationPoolIndex',
    TSelectData = ReadContractResult<typeof donationFactoryABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationFactoryABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractRead({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'donationPoolIndex',
        ...config,
    } as UseContractReadConfig<
        typeof donationFactoryABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"getCampaignRewardsBalance"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryGetCampaignRewardsBalance<
    TFunctionName extends 'getCampaignRewardsBalance',
    TSelectData = ReadContractResult<typeof donationFactoryABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationFactoryABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractRead({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'getCampaignRewardsBalance',
        ...config,
    } as UseContractReadConfig<
        typeof donationFactoryABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"getCurrentPlatformFee"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryGetCurrentPlatformFee<
    TFunctionName extends 'getCurrentPlatformFee',
    TSelectData = ReadContractResult<typeof donationFactoryABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationFactoryABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractRead({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'getCurrentPlatformFee',
        ...config,
    } as UseContractReadConfig<
        typeof donationFactoryABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"getDonationPoolAddress"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryGetDonationPoolAddress<
    TFunctionName extends 'getDonationPoolAddress',
    TSelectData = ReadContractResult<typeof donationFactoryABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationFactoryABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractRead({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'getDonationPoolAddress',
        ...config,
    } as UseContractReadConfig<
        typeof donationFactoryABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"getDonationPoolBeneficiary"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryGetDonationPoolBeneficiary<
    TFunctionName extends 'getDonationPoolBeneficiary',
    TSelectData = ReadContractResult<typeof donationFactoryABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationFactoryABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractRead({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'getDonationPoolBeneficiary',
        ...config,
    } as UseContractReadConfig<
        typeof donationFactoryABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"getDonationPoolContributorsCount"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryGetDonationPoolContributorsCount<
    TFunctionName extends 'getDonationPoolContributorsCount',
    TSelectData = ReadContractResult<typeof donationFactoryABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationFactoryABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractRead({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'getDonationPoolContributorsCount',
        ...config,
    } as UseContractReadConfig<
        typeof donationFactoryABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"getDonationPoolDepositBalance"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryGetDonationPoolDepositBalance<
    TFunctionName extends 'getDonationPoolDepositBalance',
    TSelectData = ReadContractResult<typeof donationFactoryABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationFactoryABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractRead({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'getDonationPoolDepositBalance',
        ...config,
    } as UseContractReadConfig<
        typeof donationFactoryABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"getDonationPoolIndex"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryGetDonationPoolIndex<
    TFunctionName extends 'getDonationPoolIndex',
    TSelectData = ReadContractResult<typeof donationFactoryABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationFactoryABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractRead({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'getDonationPoolIndex',
        ...config,
    } as UseContractReadConfig<
        typeof donationFactoryABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"getDonationPoolManager"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryGetDonationPoolManager<
    TFunctionName extends 'getDonationPoolManager',
    TSelectData = ReadContractResult<typeof donationFactoryABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationFactoryABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractRead({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'getDonationPoolManager',
        ...config,
    } as UseContractReadConfig<
        typeof donationFactoryABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"getDonationPoolsCount"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryGetDonationPoolsCount<
    TFunctionName extends 'getDonationPoolsCount',
    TSelectData = ReadContractResult<typeof donationFactoryABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationFactoryABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractRead({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'getDonationPoolsCount',
        ...config,
    } as UseContractReadConfig<
        typeof donationFactoryABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"getFactoryFeeBalance"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryGetFactoryFeeBalance<
    TFunctionName extends 'getFactoryFeeBalance',
    TSelectData = ReadContractResult<typeof donationFactoryABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationFactoryABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractRead({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'getFactoryFeeBalance',
        ...config,
    } as UseContractReadConfig<
        typeof donationFactoryABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link donationFactoryABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryWrite<
    TFunctionName extends string,
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof donationFactoryAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof donationFactoryABI,
                  string
              >['request']['abi'],
              TFunctionName,
              TMode
          > & { address?: Address; chainId?: TChainId }
        : UseContractWriteConfig<
              typeof donationFactoryABI,
              TFunctionName,
              TMode
          > & {
              abi?: never
              address?: never
              chainId?: TChainId
          } = {} as any,
) {
    return useContractWrite<typeof donationFactoryABI, TFunctionName, TMode>({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"adjustPlatformFee"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryAdjustPlatformFee<
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof donationFactoryAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof donationFactoryABI,
                  'adjustPlatformFee'
              >['request']['abi'],
              'adjustPlatformFee',
              TMode
          > & {
              address?: Address
              chainId?: TChainId
              functionName?: 'adjustPlatformFee'
          }
        : UseContractWriteConfig<
              typeof donationFactoryABI,
              'adjustPlatformFee',
              TMode
          > & {
              abi?: never
              address?: never
              chainId?: TChainId
              functionName?: 'adjustPlatformFee'
          } = {} as any,
) {
    return useContractWrite<
        typeof donationFactoryABI,
        'adjustPlatformFee',
        TMode
    >({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'adjustPlatformFee',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"createDonationPool"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryCreateDonationPool<
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof donationFactoryAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof donationFactoryABI,
                  'createDonationPool'
              >['request']['abi'],
              'createDonationPool',
              TMode
          > & {
              address?: Address
              chainId?: TChainId
              functionName?: 'createDonationPool'
          }
        : UseContractWriteConfig<
              typeof donationFactoryABI,
              'createDonationPool',
              TMode
          > & {
              abi?: never
              address?: never
              chainId?: TChainId
              functionName?: 'createDonationPool'
          } = {} as any,
) {
    return useContractWrite<
        typeof donationFactoryABI,
        'createDonationPool',
        TMode
    >({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'createDonationPool',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"withdrawPlatformFee"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryWithdrawPlatformFee<
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof donationFactoryAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof donationFactoryABI,
                  'withdrawPlatformFee'
              >['request']['abi'],
              'withdrawPlatformFee',
              TMode
          > & {
              address?: Address
              chainId?: TChainId
              functionName?: 'withdrawPlatformFee'
          }
        : UseContractWriteConfig<
              typeof donationFactoryABI,
              'withdrawPlatformFee',
              TMode
          > & {
              abi?: never
              address?: never
              chainId?: TChainId
              functionName?: 'withdrawPlatformFee'
          } = {} as any,
) {
    return useContractWrite<
        typeof donationFactoryABI,
        'withdrawPlatformFee',
        TMode
    >({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'withdrawPlatformFee',
        ...config,
    } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link donationFactoryABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function usePrepareDonationFactoryWrite<TFunctionName extends string>(
    config: Omit<
        UsePrepareContractWriteConfig<typeof donationFactoryABI, TFunctionName>,
        'abi' | 'address'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        ...config,
    } as UsePrepareContractWriteConfig<
        typeof donationFactoryABI,
        TFunctionName
    >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"adjustPlatformFee"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function usePrepareDonationFactoryAdjustPlatformFee(
    config: Omit<
        UsePrepareContractWriteConfig<
            typeof donationFactoryABI,
            'adjustPlatformFee'
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'adjustPlatformFee',
        ...config,
    } as UsePrepareContractWriteConfig<
        typeof donationFactoryABI,
        'adjustPlatformFee'
    >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"createDonationPool"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function usePrepareDonationFactoryCreateDonationPool(
    config: Omit<
        UsePrepareContractWriteConfig<
            typeof donationFactoryABI,
            'createDonationPool'
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'createDonationPool',
        ...config,
    } as UsePrepareContractWriteConfig<
        typeof donationFactoryABI,
        'createDonationPool'
    >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link donationFactoryABI}__ and `functionName` set to `"withdrawPlatformFee"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function usePrepareDonationFactoryWithdrawPlatformFee(
    config: Omit<
        UsePrepareContractWriteConfig<
            typeof donationFactoryABI,
            'withdrawPlatformFee'
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        functionName: 'withdrawPlatformFee',
        ...config,
    } as UsePrepareContractWriteConfig<
        typeof donationFactoryABI,
        'withdrawPlatformFee'
    >)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link donationFactoryABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryEvent<TEventName extends string>(
    config: Omit<
        UseContractEventConfig<typeof donationFactoryABI, TEventName>,
        'abi' | 'address'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractEvent({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        ...config,
    } as UseContractEventConfig<typeof donationFactoryABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link donationFactoryABI}__ and `eventName` set to `"DonationPoolCreated"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryDonationPoolCreatedEvent(
    config: Omit<
        UseContractEventConfig<
            typeof donationFactoryABI,
            'DonationPoolCreated'
        >,
        'abi' | 'address' | 'eventName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractEvent({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        eventName: 'DonationPoolCreated',
        ...config,
    } as UseContractEventConfig<
        typeof donationFactoryABI,
        'DonationPoolCreated'
    >)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link donationFactoryABI}__ and `eventName` set to `"ProtocolFeeAdjusted"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryProtocolFeeAdjustedEvent(
    config: Omit<
        UseContractEventConfig<
            typeof donationFactoryABI,
            'ProtocolFeeAdjusted'
        >,
        'abi' | 'address' | 'eventName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractEvent({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        eventName: 'ProtocolFeeAdjusted',
        ...config,
    } as UseContractEventConfig<
        typeof donationFactoryABI,
        'ProtocolFeeAdjusted'
    >)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link donationFactoryABI}__ and `eventName` set to `"ProtocolFeeWithdrawn"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x9eDA587356793083C7b91E622b8e666A654Ca0EE)
 */
export function useDonationFactoryProtocolFeeWithdrawnEvent(
    config: Omit<
        UseContractEventConfig<
            typeof donationFactoryABI,
            'ProtocolFeeWithdrawn'
        >,
        'abi' | 'address' | 'eventName'
    > & { chainId?: keyof typeof donationFactoryAddress } = {} as any,
) {
    return useContractEvent({
        abi: donationFactoryABI,
        address: donationFactoryAddress[5],
        eventName: 'ProtocolFeeWithdrawn',
        ...config,
    } as UseContractEventConfig<
        typeof donationFactoryABI,
        'ProtocolFeeWithdrawn'
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__.
 */
export function useDonationPoolRead<
    TFunctionName extends string,
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`.
 */
export function useDonationPoolDefaultAdminRole<
    TFunctionName extends 'DEFAULT_ADMIN_ROLE',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'DEFAULT_ADMIN_ROLE',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"MANAGER_ROLE"`.
 */
export function useDonationPoolManagerRole<
    TFunctionName extends 'MANAGER_ROLE',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'MANAGER_ROLE',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"OPERATOR_ROLE"`.
 */
export function useDonationPoolOperatorRole<
    TFunctionName extends 'OPERATOR_ROLE',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'OPERATOR_ROLE',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"getCampaignBeneficiary"`.
 */
export function useDonationPoolGetCampaignBeneficiary<
    TFunctionName extends 'getCampaignBeneficiary',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'getCampaignBeneficiary',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"getCampaignDepositBalance"`.
 */
export function useDonationPoolGetCampaignDepositBalance<
    TFunctionName extends 'getCampaignDepositBalance',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'getCampaignDepositBalance',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"getCampaignFee"`.
 */
export function useDonationPoolGetCampaignFee<
    TFunctionName extends 'getCampaignFee',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'getCampaignFee',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"getCampaignManager"`.
 */
export function useDonationPoolGetCampaignManager<
    TFunctionName extends 'getCampaignManager',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'getCampaignManager',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"getCampaignRewardsBalance"`.
 */
export function useDonationPoolGetCampaignRewardsBalance<
    TFunctionName extends 'getCampaignRewardsBalance',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'getCampaignRewardsBalance',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"getContributorAddress"`.
 */
export function useDonationPoolGetContributorAddress<
    TFunctionName extends 'getContributorAddress',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'getContributorAddress',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"getContributorCount"`.
 */
export function useDonationPoolGetContributorCount<
    TFunctionName extends 'getContributorCount',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'getContributorCount',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"getFactoryAddress"`.
 */
export function useDonationPoolGetFactoryAddress<
    TFunctionName extends 'getFactoryAddress',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'getFactoryAddress',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"getRoleAdmin"`.
 */
export function useDonationPoolGetRoleAdmin<
    TFunctionName extends 'getRoleAdmin',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'getRoleAdmin',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"getUserContributorsIndex"`.
 */
export function useDonationPoolGetUserContributorsIndex<
    TFunctionName extends 'getUserContributorsIndex',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'getUserContributorsIndex',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"getUserDepositBalance"`.
 */
export function useDonationPoolGetUserDepositBalance<
    TFunctionName extends 'getUserDepositBalance',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'getUserDepositBalance',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"hasRole"`.
 */
export function useDonationPoolHasRole<
    TFunctionName extends 'hasRole',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'hasRole',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"supportsInterface"`.
 */
export function useDonationPoolSupportsInterface<
    TFunctionName extends 'supportsInterface',
    TSelectData = ReadContractResult<typeof donationPoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof donationPoolABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: donationPoolABI,
        functionName: 'supportsInterface',
        ...config,
    } as UseContractReadConfig<
        typeof donationPoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link donationPoolABI}__.
 */
export function useDonationPoolWrite<
    TFunctionName extends string,
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof donationPoolABI,
                  string
              >['request']['abi'],
              TFunctionName,
              TMode
          >
        : UseContractWriteConfig<
              typeof donationPoolABI,
              TFunctionName,
              TMode
          > & {
              abi?: never
          } = {} as any,
) {
    return useContractWrite<typeof donationPoolABI, TFunctionName, TMode>({
        abi: donationPoolABI,
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"depositEth"`.
 */
export function useDonationPoolDepositEth<
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof donationPoolABI,
                  'depositEth'
              >['request']['abi'],
              'depositEth',
              TMode
          > & { functionName?: 'depositEth' }
        : UseContractWriteConfig<
              typeof donationPoolABI,
              'depositEth',
              TMode
          > & {
              abi?: never
              functionName?: 'depositEth'
          } = {} as any,
) {
    return useContractWrite<typeof donationPoolABI, 'depositEth', TMode>({
        abi: donationPoolABI,
        functionName: 'depositEth',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"depositStEthWithPermit"`.
 */
export function useDonationPoolDepositStEthWithPermit<
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof donationPoolABI,
                  'depositStEthWithPermit'
              >['request']['abi'],
              'depositStEthWithPermit',
              TMode
          > & { functionName?: 'depositStEthWithPermit' }
        : UseContractWriteConfig<
              typeof donationPoolABI,
              'depositStEthWithPermit',
              TMode
          > & {
              abi?: never
              functionName?: 'depositStEthWithPermit'
          } = {} as any,
) {
    return useContractWrite<
        typeof donationPoolABI,
        'depositStEthWithPermit',
        TMode
    >({
        abi: donationPoolABI,
        functionName: 'depositStEthWithPermit',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"grantRole"`.
 */
export function useDonationPoolGrantRole<
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof donationPoolABI,
                  'grantRole'
              >['request']['abi'],
              'grantRole',
              TMode
          > & { functionName?: 'grantRole' }
        : UseContractWriteConfig<typeof donationPoolABI, 'grantRole', TMode> & {
              abi?: never
              functionName?: 'grantRole'
          } = {} as any,
) {
    return useContractWrite<typeof donationPoolABI, 'grantRole', TMode>({
        abi: donationPoolABI,
        functionName: 'grantRole',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"renounceRole"`.
 */
export function useDonationPoolRenounceRole<
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof donationPoolABI,
                  'renounceRole'
              >['request']['abi'],
              'renounceRole',
              TMode
          > & { functionName?: 'renounceRole' }
        : UseContractWriteConfig<
              typeof donationPoolABI,
              'renounceRole',
              TMode
          > & {
              abi?: never
              functionName?: 'renounceRole'
          } = {} as any,
) {
    return useContractWrite<typeof donationPoolABI, 'renounceRole', TMode>({
        abi: donationPoolABI,
        functionName: 'renounceRole',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"revokeRole"`.
 */
export function useDonationPoolRevokeRole<
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof donationPoolABI,
                  'revokeRole'
              >['request']['abi'],
              'revokeRole',
              TMode
          > & { functionName?: 'revokeRole' }
        : UseContractWriteConfig<
              typeof donationPoolABI,
              'revokeRole',
              TMode
          > & {
              abi?: never
              functionName?: 'revokeRole'
          } = {} as any,
) {
    return useContractWrite<typeof donationPoolABI, 'revokeRole', TMode>({
        abi: donationPoolABI,
        functionName: 'revokeRole',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"withdrawRewards"`.
 */
export function useDonationPoolWithdrawRewards<
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof donationPoolABI,
                  'withdrawRewards'
              >['request']['abi'],
              'withdrawRewards',
              TMode
          > & { functionName?: 'withdrawRewards' }
        : UseContractWriteConfig<
              typeof donationPoolABI,
              'withdrawRewards',
              TMode
          > & {
              abi?: never
              functionName?: 'withdrawRewards'
          } = {} as any,
) {
    return useContractWrite<typeof donationPoolABI, 'withdrawRewards', TMode>({
        abi: donationPoolABI,
        functionName: 'withdrawRewards',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"withdrawStEth"`.
 */
export function useDonationPoolWithdrawStEth<
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof donationPoolABI,
                  'withdrawStEth'
              >['request']['abi'],
              'withdrawStEth',
              TMode
          > & { functionName?: 'withdrawStEth' }
        : UseContractWriteConfig<
              typeof donationPoolABI,
              'withdrawStEth',
              TMode
          > & {
              abi?: never
              functionName?: 'withdrawStEth'
          } = {} as any,
) {
    return useContractWrite<typeof donationPoolABI, 'withdrawStEth', TMode>({
        abi: donationPoolABI,
        functionName: 'withdrawStEth',
        ...config,
    } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link donationPoolABI}__.
 */
export function usePrepareDonationPoolWrite<TFunctionName extends string>(
    config: Omit<
        UsePrepareContractWriteConfig<typeof donationPoolABI, TFunctionName>,
        'abi'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: donationPoolABI,
        ...config,
    } as UsePrepareContractWriteConfig<typeof donationPoolABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"depositEth"`.
 */
export function usePrepareDonationPoolDepositEth(
    config: Omit<
        UsePrepareContractWriteConfig<typeof donationPoolABI, 'depositEth'>,
        'abi' | 'functionName'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: donationPoolABI,
        functionName: 'depositEth',
        ...config,
    } as UsePrepareContractWriteConfig<typeof donationPoolABI, 'depositEth'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"depositStEthWithPermit"`.
 */
export function usePrepareDonationPoolDepositStEthWithPermit(
    config: Omit<
        UsePrepareContractWriteConfig<
            typeof donationPoolABI,
            'depositStEthWithPermit'
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: donationPoolABI,
        functionName: 'depositStEthWithPermit',
        ...config,
    } as UsePrepareContractWriteConfig<
        typeof donationPoolABI,
        'depositStEthWithPermit'
    >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"grantRole"`.
 */
export function usePrepareDonationPoolGrantRole(
    config: Omit<
        UsePrepareContractWriteConfig<typeof donationPoolABI, 'grantRole'>,
        'abi' | 'functionName'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: donationPoolABI,
        functionName: 'grantRole',
        ...config,
    } as UsePrepareContractWriteConfig<typeof donationPoolABI, 'grantRole'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"renounceRole"`.
 */
export function usePrepareDonationPoolRenounceRole(
    config: Omit<
        UsePrepareContractWriteConfig<typeof donationPoolABI, 'renounceRole'>,
        'abi' | 'functionName'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: donationPoolABI,
        functionName: 'renounceRole',
        ...config,
    } as UsePrepareContractWriteConfig<typeof donationPoolABI, 'renounceRole'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"revokeRole"`.
 */
export function usePrepareDonationPoolRevokeRole(
    config: Omit<
        UsePrepareContractWriteConfig<typeof donationPoolABI, 'revokeRole'>,
        'abi' | 'functionName'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: donationPoolABI,
        functionName: 'revokeRole',
        ...config,
    } as UsePrepareContractWriteConfig<typeof donationPoolABI, 'revokeRole'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"withdrawRewards"`.
 */
export function usePrepareDonationPoolWithdrawRewards(
    config: Omit<
        UsePrepareContractWriteConfig<
            typeof donationPoolABI,
            'withdrawRewards'
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: donationPoolABI,
        functionName: 'withdrawRewards',
        ...config,
    } as UsePrepareContractWriteConfig<
        typeof donationPoolABI,
        'withdrawRewards'
    >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link donationPoolABI}__ and `functionName` set to `"withdrawStEth"`.
 */
export function usePrepareDonationPoolWithdrawStEth(
    config: Omit<
        UsePrepareContractWriteConfig<typeof donationPoolABI, 'withdrawStEth'>,
        'abi' | 'functionName'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: donationPoolABI,
        functionName: 'withdrawStEth',
        ...config,
    } as UsePrepareContractWriteConfig<typeof donationPoolABI, 'withdrawStEth'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link donationPoolABI}__.
 */
export function useDonationPoolEvent<TEventName extends string>(
    config: Omit<
        UseContractEventConfig<typeof donationPoolABI, TEventName>,
        'abi'
    > = {} as any,
) {
    return useContractEvent({
        abi: donationPoolABI,
        ...config,
    } as UseContractEventConfig<typeof donationPoolABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link donationPoolABI}__ and `eventName` set to `"DepositSuccessful"`.
 */
export function useDonationPoolDepositSuccessfulEvent(
    config: Omit<
        UseContractEventConfig<typeof donationPoolABI, 'DepositSuccessful'>,
        'abi' | 'eventName'
    > = {} as any,
) {
    return useContractEvent({
        abi: donationPoolABI,
        eventName: 'DepositSuccessful',
        ...config,
    } as UseContractEventConfig<typeof donationPoolABI, 'DepositSuccessful'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link donationPoolABI}__ and `eventName` set to `"MintAndDepositSuccessful"`.
 */
export function useDonationPoolMintAndDepositSuccessfulEvent(
    config: Omit<
        UseContractEventConfig<
            typeof donationPoolABI,
            'MintAndDepositSuccessful'
        >,
        'abi' | 'eventName'
    > = {} as any,
) {
    return useContractEvent({
        abi: donationPoolABI,
        eventName: 'MintAndDepositSuccessful',
        ...config,
    } as UseContractEventConfig<
        typeof donationPoolABI,
        'MintAndDepositSuccessful'
    >)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link donationPoolABI}__ and `eventName` set to `"RewardsWithdrawSuccessful"`.
 */
export function useDonationPoolRewardsWithdrawSuccessfulEvent(
    config: Omit<
        UseContractEventConfig<
            typeof donationPoolABI,
            'RewardsWithdrawSuccessful'
        >,
        'abi' | 'eventName'
    > = {} as any,
) {
    return useContractEvent({
        abi: donationPoolABI,
        eventName: 'RewardsWithdrawSuccessful',
        ...config,
    } as UseContractEventConfig<
        typeof donationPoolABI,
        'RewardsWithdrawSuccessful'
    >)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link donationPoolABI}__ and `eventName` set to `"RoleAdminChanged"`.
 */
export function useDonationPoolRoleAdminChangedEvent(
    config: Omit<
        UseContractEventConfig<typeof donationPoolABI, 'RoleAdminChanged'>,
        'abi' | 'eventName'
    > = {} as any,
) {
    return useContractEvent({
        abi: donationPoolABI,
        eventName: 'RoleAdminChanged',
        ...config,
    } as UseContractEventConfig<typeof donationPoolABI, 'RoleAdminChanged'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link donationPoolABI}__ and `eventName` set to `"RoleGranted"`.
 */
export function useDonationPoolRoleGrantedEvent(
    config: Omit<
        UseContractEventConfig<typeof donationPoolABI, 'RoleGranted'>,
        'abi' | 'eventName'
    > = {} as any,
) {
    return useContractEvent({
        abi: donationPoolABI,
        eventName: 'RoleGranted',
        ...config,
    } as UseContractEventConfig<typeof donationPoolABI, 'RoleGranted'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link donationPoolABI}__ and `eventName` set to `"RoleRevoked"`.
 */
export function useDonationPoolRoleRevokedEvent(
    config: Omit<
        UseContractEventConfig<typeof donationPoolABI, 'RoleRevoked'>,
        'abi' | 'eventName'
    > = {} as any,
) {
    return useContractEvent({
        abi: donationPoolABI,
        eventName: 'RoleRevoked',
        ...config,
    } as UseContractEventConfig<typeof donationPoolABI, 'RoleRevoked'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link donationPoolABI}__ and `eventName` set to `"WithdrawSuccessful"`.
 */
export function useDonationPoolWithdrawSuccessfulEvent(
    config: Omit<
        UseContractEventConfig<typeof donationPoolABI, 'WithdrawSuccessful'>,
        'abi' | 'eventName'
    > = {} as any,
) {
    return useContractEvent({
        abi: donationPoolABI,
        eventName: 'WithdrawSuccessful',
        ...config,
    } as UseContractEventConfig<typeof donationPoolABI, 'WithdrawSuccessful'>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link ierc20PermitABI}__.
 */
export function useIerc20PermitRead<
    TFunctionName extends string,
    TSelectData = ReadContractResult<typeof ierc20PermitABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof ierc20PermitABI,
            TFunctionName,
            TSelectData
        >,
        'abi'
    > = {} as any,
) {
    return useContractRead({
        abi: ierc20PermitABI,
        ...config,
    } as UseContractReadConfig<
        typeof ierc20PermitABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"DOMAIN_SEPARATOR"`.
 */
export function useIerc20PermitDomainSeparator<
    TFunctionName extends 'DOMAIN_SEPARATOR',
    TSelectData = ReadContractResult<typeof ierc20PermitABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof ierc20PermitABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: ierc20PermitABI,
        functionName: 'DOMAIN_SEPARATOR',
        ...config,
    } as UseContractReadConfig<
        typeof ierc20PermitABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"allowance"`.
 */
export function useIerc20PermitAllowance<
    TFunctionName extends 'allowance',
    TSelectData = ReadContractResult<typeof ierc20PermitABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof ierc20PermitABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: ierc20PermitABI,
        functionName: 'allowance',
        ...config,
    } as UseContractReadConfig<
        typeof ierc20PermitABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"balanceOf"`.
 */
export function useIerc20PermitBalanceOf<
    TFunctionName extends 'balanceOf',
    TSelectData = ReadContractResult<typeof ierc20PermitABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof ierc20PermitABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: ierc20PermitABI,
        functionName: 'balanceOf',
        ...config,
    } as UseContractReadConfig<
        typeof ierc20PermitABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"getPooledEthByShares"`.
 */
export function useIerc20PermitGetPooledEthByShares<
    TFunctionName extends 'getPooledEthByShares',
    TSelectData = ReadContractResult<typeof ierc20PermitABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof ierc20PermitABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: ierc20PermitABI,
        functionName: 'getPooledEthByShares',
        ...config,
    } as UseContractReadConfig<
        typeof ierc20PermitABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"getSharesByPooledEth"`.
 */
export function useIerc20PermitGetSharesByPooledEth<
    TFunctionName extends 'getSharesByPooledEth',
    TSelectData = ReadContractResult<typeof ierc20PermitABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof ierc20PermitABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: ierc20PermitABI,
        functionName: 'getSharesByPooledEth',
        ...config,
    } as UseContractReadConfig<
        typeof ierc20PermitABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"getTotalShares"`.
 */
export function useIerc20PermitGetTotalShares<
    TFunctionName extends 'getTotalShares',
    TSelectData = ReadContractResult<typeof ierc20PermitABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof ierc20PermitABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: ierc20PermitABI,
        functionName: 'getTotalShares',
        ...config,
    } as UseContractReadConfig<
        typeof ierc20PermitABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"nonces"`.
 */
export function useIerc20PermitNonces<
    TFunctionName extends 'nonces',
    TSelectData = ReadContractResult<typeof ierc20PermitABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof ierc20PermitABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: ierc20PermitABI,
        functionName: 'nonces',
        ...config,
    } as UseContractReadConfig<
        typeof ierc20PermitABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"sharesOf"`.
 */
export function useIerc20PermitSharesOf<
    TFunctionName extends 'sharesOf',
    TSelectData = ReadContractResult<typeof ierc20PermitABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof ierc20PermitABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: ierc20PermitABI,
        functionName: 'sharesOf',
        ...config,
    } as UseContractReadConfig<
        typeof ierc20PermitABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"totalSupply"`.
 */
export function useIerc20PermitTotalSupply<
    TFunctionName extends 'totalSupply',
    TSelectData = ReadContractResult<typeof ierc20PermitABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<
            typeof ierc20PermitABI,
            TFunctionName,
            TSelectData
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return useContractRead({
        abi: ierc20PermitABI,
        functionName: 'totalSupply',
        ...config,
    } as UseContractReadConfig<
        typeof ierc20PermitABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__.
 */
export function useIerc20PermitWrite<
    TFunctionName extends string,
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof ierc20PermitABI,
                  string
              >['request']['abi'],
              TFunctionName,
              TMode
          >
        : UseContractWriteConfig<
              typeof ierc20PermitABI,
              TFunctionName,
              TMode
          > & {
              abi?: never
          } = {} as any,
) {
    return useContractWrite<typeof ierc20PermitABI, TFunctionName, TMode>({
        abi: ierc20PermitABI,
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"approve"`.
 */
export function useIerc20PermitApprove<
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof ierc20PermitABI,
                  'approve'
              >['request']['abi'],
              'approve',
              TMode
          > & { functionName?: 'approve' }
        : UseContractWriteConfig<typeof ierc20PermitABI, 'approve', TMode> & {
              abi?: never
              functionName?: 'approve'
          } = {} as any,
) {
    return useContractWrite<typeof ierc20PermitABI, 'approve', TMode>({
        abi: ierc20PermitABI,
        functionName: 'approve',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"permit"`.
 */
export function useIerc20PermitPermit<
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof ierc20PermitABI,
                  'permit'
              >['request']['abi'],
              'permit',
              TMode
          > & { functionName?: 'permit' }
        : UseContractWriteConfig<typeof ierc20PermitABI, 'permit', TMode> & {
              abi?: never
              functionName?: 'permit'
          } = {} as any,
) {
    return useContractWrite<typeof ierc20PermitABI, 'permit', TMode>({
        abi: ierc20PermitABI,
        functionName: 'permit',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"submit"`.
 */
export function useIerc20PermitSubmit<
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof ierc20PermitABI,
                  'submit'
              >['request']['abi'],
              'submit',
              TMode
          > & { functionName?: 'submit' }
        : UseContractWriteConfig<typeof ierc20PermitABI, 'submit', TMode> & {
              abi?: never
              functionName?: 'submit'
          } = {} as any,
) {
    return useContractWrite<typeof ierc20PermitABI, 'submit', TMode>({
        abi: ierc20PermitABI,
        functionName: 'submit',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"transfer"`.
 */
export function useIerc20PermitTransfer<
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof ierc20PermitABI,
                  'transfer'
              >['request']['abi'],
              'transfer',
              TMode
          > & { functionName?: 'transfer' }
        : UseContractWriteConfig<typeof ierc20PermitABI, 'transfer', TMode> & {
              abi?: never
              functionName?: 'transfer'
          } = {} as any,
) {
    return useContractWrite<typeof ierc20PermitABI, 'transfer', TMode>({
        abi: ierc20PermitABI,
        functionName: 'transfer',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"transferFrom"`.
 */
export function useIerc20PermitTransferFrom<
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof ierc20PermitABI,
                  'transferFrom'
              >['request']['abi'],
              'transferFrom',
              TMode
          > & { functionName?: 'transferFrom' }
        : UseContractWriteConfig<
              typeof ierc20PermitABI,
              'transferFrom',
              TMode
          > & {
              abi?: never
              functionName?: 'transferFrom'
          } = {} as any,
) {
    return useContractWrite<typeof ierc20PermitABI, 'transferFrom', TMode>({
        abi: ierc20PermitABI,
        functionName: 'transferFrom',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"transferShares"`.
 */
export function useIerc20PermitTransferShares<
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof ierc20PermitABI,
                  'transferShares'
              >['request']['abi'],
              'transferShares',
              TMode
          > & { functionName?: 'transferShares' }
        : UseContractWriteConfig<
              typeof ierc20PermitABI,
              'transferShares',
              TMode
          > & {
              abi?: never
              functionName?: 'transferShares'
          } = {} as any,
) {
    return useContractWrite<typeof ierc20PermitABI, 'transferShares', TMode>({
        abi: ierc20PermitABI,
        functionName: 'transferShares',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"transferSharesFrom"`.
 */
export function useIerc20PermitTransferSharesFrom<
    TMode extends WriteContractMode = undefined,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof ierc20PermitABI,
                  'transferSharesFrom'
              >['request']['abi'],
              'transferSharesFrom',
              TMode
          > & { functionName?: 'transferSharesFrom' }
        : UseContractWriteConfig<
              typeof ierc20PermitABI,
              'transferSharesFrom',
              TMode
          > & {
              abi?: never
              functionName?: 'transferSharesFrom'
          } = {} as any,
) {
    return useContractWrite<
        typeof ierc20PermitABI,
        'transferSharesFrom',
        TMode
    >({
        abi: ierc20PermitABI,
        functionName: 'transferSharesFrom',
        ...config,
    } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__.
 */
export function usePrepareIerc20PermitWrite<TFunctionName extends string>(
    config: Omit<
        UsePrepareContractWriteConfig<typeof ierc20PermitABI, TFunctionName>,
        'abi'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: ierc20PermitABI,
        ...config,
    } as UsePrepareContractWriteConfig<typeof ierc20PermitABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"approve"`.
 */
export function usePrepareIerc20PermitApprove(
    config: Omit<
        UsePrepareContractWriteConfig<typeof ierc20PermitABI, 'approve'>,
        'abi' | 'functionName'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: ierc20PermitABI,
        functionName: 'approve',
        ...config,
    } as UsePrepareContractWriteConfig<typeof ierc20PermitABI, 'approve'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"permit"`.
 */
export function usePrepareIerc20PermitPermit(
    config: Omit<
        UsePrepareContractWriteConfig<typeof ierc20PermitABI, 'permit'>,
        'abi' | 'functionName'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: ierc20PermitABI,
        functionName: 'permit',
        ...config,
    } as UsePrepareContractWriteConfig<typeof ierc20PermitABI, 'permit'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"submit"`.
 */
export function usePrepareIerc20PermitSubmit(
    config: Omit<
        UsePrepareContractWriteConfig<typeof ierc20PermitABI, 'submit'>,
        'abi' | 'functionName'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: ierc20PermitABI,
        functionName: 'submit',
        ...config,
    } as UsePrepareContractWriteConfig<typeof ierc20PermitABI, 'submit'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"transfer"`.
 */
export function usePrepareIerc20PermitTransfer(
    config: Omit<
        UsePrepareContractWriteConfig<typeof ierc20PermitABI, 'transfer'>,
        'abi' | 'functionName'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: ierc20PermitABI,
        functionName: 'transfer',
        ...config,
    } as UsePrepareContractWriteConfig<typeof ierc20PermitABI, 'transfer'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"transferFrom"`.
 */
export function usePrepareIerc20PermitTransferFrom(
    config: Omit<
        UsePrepareContractWriteConfig<typeof ierc20PermitABI, 'transferFrom'>,
        'abi' | 'functionName'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: ierc20PermitABI,
        functionName: 'transferFrom',
        ...config,
    } as UsePrepareContractWriteConfig<typeof ierc20PermitABI, 'transferFrom'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"transferShares"`.
 */
export function usePrepareIerc20PermitTransferShares(
    config: Omit<
        UsePrepareContractWriteConfig<typeof ierc20PermitABI, 'transferShares'>,
        'abi' | 'functionName'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: ierc20PermitABI,
        functionName: 'transferShares',
        ...config,
    } as UsePrepareContractWriteConfig<
        typeof ierc20PermitABI,
        'transferShares'
    >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link ierc20PermitABI}__ and `functionName` set to `"transferSharesFrom"`.
 */
export function usePrepareIerc20PermitTransferSharesFrom(
    config: Omit<
        UsePrepareContractWriteConfig<
            typeof ierc20PermitABI,
            'transferSharesFrom'
        >,
        'abi' | 'functionName'
    > = {} as any,
) {
    return usePrepareContractWrite({
        abi: ierc20PermitABI,
        functionName: 'transferSharesFrom',
        ...config,
    } as UsePrepareContractWriteConfig<
        typeof ierc20PermitABI,
        'transferSharesFrom'
    >)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link ierc20PermitABI}__.
 */
export function useIerc20PermitEvent<TEventName extends string>(
    config: Omit<
        UseContractEventConfig<typeof ierc20PermitABI, TEventName>,
        'abi'
    > = {} as any,
) {
    return useContractEvent({
        abi: ierc20PermitABI,
        ...config,
    } as UseContractEventConfig<typeof ierc20PermitABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link ierc20PermitABI}__ and `eventName` set to `"Approval"`.
 */
export function useIerc20PermitApprovalEvent(
    config: Omit<
        UseContractEventConfig<typeof ierc20PermitABI, 'Approval'>,
        'abi' | 'eventName'
    > = {} as any,
) {
    return useContractEvent({
        abi: ierc20PermitABI,
        eventName: 'Approval',
        ...config,
    } as UseContractEventConfig<typeof ierc20PermitABI, 'Approval'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link ierc20PermitABI}__ and `eventName` set to `"Transfer"`.
 */
export function useIerc20PermitTransferEvent(
    config: Omit<
        UseContractEventConfig<typeof ierc20PermitABI, 'Transfer'>,
        'abi' | 'eventName'
    > = {} as any,
) {
    return useContractEvent({
        abi: ierc20PermitABI,
        eventName: 'Transfer',
        ...config,
    } as UseContractEventConfig<typeof ierc20PermitABI, 'Transfer'>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolRead<
    TFunctionName extends string,
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"checkUpkeep"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolCheckUpkeep<
    TFunctionName extends 'checkUpkeep',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'checkUpkeep',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getActiveDepositors"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetActiveDepositors<
    TFunctionName extends 'getActiveDepositors',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getActiveDepositors',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getActiveDepositorsCount"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetActiveDepositorsCount<
    TFunctionName extends 'getActiveDepositorsCount',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getActiveDepositorsCount',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getInterval"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetInterval<
    TFunctionName extends 'getInterval',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getInterval',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getLastTimestamp"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetLastTimestamp<
    TFunctionName extends 'getLastTimestamp',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getLastTimestamp',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getLastTotalBalanceLog"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetLastTotalBalanceLog<
    TFunctionName extends 'getLastTotalBalanceLog',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getLastTotalBalanceLog',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getLastUserBalanceLog"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetLastUserBalanceLog<
    TFunctionName extends 'getLastUserBalanceLog',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getLastUserBalanceLog',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getPlatformFee"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetPlatformFee<
    TFunctionName extends 'getPlatformFee',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getPlatformFee',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getPlatformFeeBalance"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetPlatformFeeBalance<
    TFunctionName extends 'getPlatformFeeBalance',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getPlatformFeeBalance',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getRaffleState"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetRaffleState<
    TFunctionName extends 'getRaffleState',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getRaffleState',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getRecentWinner"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetRecentWinner<
    TFunctionName extends 'getRecentWinner',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getRecentWinner',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getStakingRewardsTotal"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetStakingRewardsTotal<
    TFunctionName extends 'getStakingRewardsTotal',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getStakingRewardsTotal',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getTotalBalance"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetTotalBalance<
    TFunctionName extends 'getTotalBalance',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getTotalBalance',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getTotalBalanceLog"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetTotalBalanceLog<
    TFunctionName extends 'getTotalBalanceLog',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getTotalBalanceLog',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getTotalUserDeposits"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetTotalUserDeposits<
    TFunctionName extends 'getTotalUserDeposits',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getTotalUserDeposits',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getTwab"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetTwab<
    TFunctionName extends 'getTwab',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getTwab',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getUserBalanceLog"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetUserBalanceLog<
    TFunctionName extends 'getUserBalanceLog',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getUserBalanceLog',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"getUserDeposit"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolGetUserDeposit<
    TFunctionName extends 'getUserDeposit',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'getUserDeposit',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"owner"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolOwner<
    TFunctionName extends 'owner',
    TSelectData = ReadContractResult<typeof rafflePoolABI, TFunctionName>,
>(
    config: Omit<
        UseContractReadConfig<typeof rafflePoolABI, TFunctionName, TSelectData>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractRead({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'owner',
        ...config,
    } as UseContractReadConfig<
        typeof rafflePoolABI,
        TFunctionName,
        TSelectData
    >)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link rafflePoolABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolWrite<
    TFunctionName extends string,
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof rafflePoolAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof rafflePoolABI,
                  string
              >['request']['abi'],
              TFunctionName,
              TMode
          > & { address?: Address; chainId?: TChainId }
        : UseContractWriteConfig<typeof rafflePoolABI, TFunctionName, TMode> & {
              abi?: never
              address?: never
              chainId?: TChainId
          } = {} as any,
) {
    return useContractWrite<typeof rafflePoolABI, TFunctionName, TMode>({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"adjustPlatformFee"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolAdjustPlatformFee<
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof rafflePoolAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof rafflePoolABI,
                  'adjustPlatformFee'
              >['request']['abi'],
              'adjustPlatformFee',
              TMode
          > & {
              address?: Address
              chainId?: TChainId
              functionName?: 'adjustPlatformFee'
          }
        : UseContractWriteConfig<
              typeof rafflePoolABI,
              'adjustPlatformFee',
              TMode
          > & {
              abi?: never
              address?: never
              chainId?: TChainId
              functionName?: 'adjustPlatformFee'
          } = {} as any,
) {
    return useContractWrite<typeof rafflePoolABI, 'adjustPlatformFee', TMode>({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'adjustPlatformFee',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"depositEth"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolDepositEth<
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof rafflePoolAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof rafflePoolABI,
                  'depositEth'
              >['request']['abi'],
              'depositEth',
              TMode
          > & {
              address?: Address
              chainId?: TChainId
              functionName?: 'depositEth'
          }
        : UseContractWriteConfig<typeof rafflePoolABI, 'depositEth', TMode> & {
              abi?: never
              address?: never
              chainId?: TChainId
              functionName?: 'depositEth'
          } = {} as any,
) {
    return useContractWrite<typeof rafflePoolABI, 'depositEth', TMode>({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'depositEth',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"depositStEth"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolDepositStEth<
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof rafflePoolAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof rafflePoolABI,
                  'depositStEth'
              >['request']['abi'],
              'depositStEth',
              TMode
          > & {
              address?: Address
              chainId?: TChainId
              functionName?: 'depositStEth'
          }
        : UseContractWriteConfig<
              typeof rafflePoolABI,
              'depositStEth',
              TMode
          > & {
              abi?: never
              address?: never
              chainId?: TChainId
              functionName?: 'depositStEth'
          } = {} as any,
) {
    return useContractWrite<typeof rafflePoolABI, 'depositStEth', TMode>({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'depositStEth',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"depositStEthWithPermit"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolDepositStEthWithPermit<
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof rafflePoolAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof rafflePoolABI,
                  'depositStEthWithPermit'
              >['request']['abi'],
              'depositStEthWithPermit',
              TMode
          > & {
              address?: Address
              chainId?: TChainId
              functionName?: 'depositStEthWithPermit'
          }
        : UseContractWriteConfig<
              typeof rafflePoolABI,
              'depositStEthWithPermit',
              TMode
          > & {
              abi?: never
              address?: never
              chainId?: TChainId
              functionName?: 'depositStEthWithPermit'
          } = {} as any,
) {
    return useContractWrite<
        typeof rafflePoolABI,
        'depositStEthWithPermit',
        TMode
    >({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'depositStEthWithPermit',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"performUpkeep"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolPerformUpkeep<
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof rafflePoolAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof rafflePoolABI,
                  'performUpkeep'
              >['request']['abi'],
              'performUpkeep',
              TMode
          > & {
              address?: Address
              chainId?: TChainId
              functionName?: 'performUpkeep'
          }
        : UseContractWriteConfig<
              typeof rafflePoolABI,
              'performUpkeep',
              TMode
          > & {
              abi?: never
              address?: never
              chainId?: TChainId
              functionName?: 'performUpkeep'
          } = {} as any,
) {
    return useContractWrite<typeof rafflePoolABI, 'performUpkeep', TMode>({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'performUpkeep',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"rawFulfillRandomWords"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolRawFulfillRandomWords<
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof rafflePoolAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof rafflePoolABI,
                  'rawFulfillRandomWords'
              >['request']['abi'],
              'rawFulfillRandomWords',
              TMode
          > & {
              address?: Address
              chainId?: TChainId
              functionName?: 'rawFulfillRandomWords'
          }
        : UseContractWriteConfig<
              typeof rafflePoolABI,
              'rawFulfillRandomWords',
              TMode
          > & {
              abi?: never
              address?: never
              chainId?: TChainId
              functionName?: 'rawFulfillRandomWords'
          } = {} as any,
) {
    return useContractWrite<
        typeof rafflePoolABI,
        'rawFulfillRandomWords',
        TMode
    >({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'rawFulfillRandomWords',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"renounceOwnership"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolRenounceOwnership<
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof rafflePoolAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof rafflePoolABI,
                  'renounceOwnership'
              >['request']['abi'],
              'renounceOwnership',
              TMode
          > & {
              address?: Address
              chainId?: TChainId
              functionName?: 'renounceOwnership'
          }
        : UseContractWriteConfig<
              typeof rafflePoolABI,
              'renounceOwnership',
              TMode
          > & {
              abi?: never
              address?: never
              chainId?: TChainId
              functionName?: 'renounceOwnership'
          } = {} as any,
) {
    return useContractWrite<typeof rafflePoolABI, 'renounceOwnership', TMode>({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'renounceOwnership',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"transferOwnership"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolTransferOwnership<
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof rafflePoolAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof rafflePoolABI,
                  'transferOwnership'
              >['request']['abi'],
              'transferOwnership',
              TMode
          > & {
              address?: Address
              chainId?: TChainId
              functionName?: 'transferOwnership'
          }
        : UseContractWriteConfig<
              typeof rafflePoolABI,
              'transferOwnership',
              TMode
          > & {
              abi?: never
              address?: never
              chainId?: TChainId
              functionName?: 'transferOwnership'
          } = {} as any,
) {
    return useContractWrite<typeof rafflePoolABI, 'transferOwnership', TMode>({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'transferOwnership',
        ...config,
    } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"withdrawPlatformFee"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolWithdrawPlatformFee<
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof rafflePoolAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof rafflePoolABI,
                  'withdrawPlatformFee'
              >['request']['abi'],
              'withdrawPlatformFee',
              TMode
          > & {
              address?: Address
              chainId?: TChainId
              functionName?: 'withdrawPlatformFee'
          }
        : UseContractWriteConfig<
              typeof rafflePoolABI,
              'withdrawPlatformFee',
              TMode
          > & {
              abi?: never
              address?: never
              chainId?: TChainId
              functionName?: 'withdrawPlatformFee'
          } = {} as any,
) {
    return useContractWrite<typeof rafflePoolABI, 'withdrawPlatformFee', TMode>(
        {
            abi: rafflePoolABI,
            address: rafflePoolAddress[5],
            functionName: 'withdrawPlatformFee',
            ...config,
        } as any,
    )
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"withdrawStEth"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolWithdrawStEth<
    TMode extends WriteContractMode = undefined,
    TChainId extends number = keyof typeof rafflePoolAddress,
>(
    config: TMode extends 'prepared'
        ? UseContractWriteConfig<
              PrepareWriteContractResult<
                  typeof rafflePoolABI,
                  'withdrawStEth'
              >['request']['abi'],
              'withdrawStEth',
              TMode
          > & {
              address?: Address
              chainId?: TChainId
              functionName?: 'withdrawStEth'
          }
        : UseContractWriteConfig<
              typeof rafflePoolABI,
              'withdrawStEth',
              TMode
          > & {
              abi?: never
              address?: never
              chainId?: TChainId
              functionName?: 'withdrawStEth'
          } = {} as any,
) {
    return useContractWrite<typeof rafflePoolABI, 'withdrawStEth', TMode>({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'withdrawStEth',
        ...config,
    } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link rafflePoolABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function usePrepareRafflePoolWrite<TFunctionName extends string>(
    config: Omit<
        UsePrepareContractWriteConfig<typeof rafflePoolABI, TFunctionName>,
        'abi' | 'address'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        ...config,
    } as UsePrepareContractWriteConfig<typeof rafflePoolABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"adjustPlatformFee"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function usePrepareRafflePoolAdjustPlatformFee(
    config: Omit<
        UsePrepareContractWriteConfig<
            typeof rafflePoolABI,
            'adjustPlatformFee'
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'adjustPlatformFee',
        ...config,
    } as UsePrepareContractWriteConfig<
        typeof rafflePoolABI,
        'adjustPlatformFee'
    >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"depositEth"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function usePrepareRafflePoolDepositEth(
    config: Omit<
        UsePrepareContractWriteConfig<typeof rafflePoolABI, 'depositEth'>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'depositEth',
        ...config,
    } as UsePrepareContractWriteConfig<typeof rafflePoolABI, 'depositEth'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"depositStEth"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function usePrepareRafflePoolDepositStEth(
    config: Omit<
        UsePrepareContractWriteConfig<typeof rafflePoolABI, 'depositStEth'>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'depositStEth',
        ...config,
    } as UsePrepareContractWriteConfig<typeof rafflePoolABI, 'depositStEth'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"depositStEthWithPermit"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function usePrepareRafflePoolDepositStEthWithPermit(
    config: Omit<
        UsePrepareContractWriteConfig<
            typeof rafflePoolABI,
            'depositStEthWithPermit'
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'depositStEthWithPermit',
        ...config,
    } as UsePrepareContractWriteConfig<
        typeof rafflePoolABI,
        'depositStEthWithPermit'
    >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"performUpkeep"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function usePrepareRafflePoolPerformUpkeep(
    config: Omit<
        UsePrepareContractWriteConfig<typeof rafflePoolABI, 'performUpkeep'>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'performUpkeep',
        ...config,
    } as UsePrepareContractWriteConfig<typeof rafflePoolABI, 'performUpkeep'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"rawFulfillRandomWords"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function usePrepareRafflePoolRawFulfillRandomWords(
    config: Omit<
        UsePrepareContractWriteConfig<
            typeof rafflePoolABI,
            'rawFulfillRandomWords'
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'rawFulfillRandomWords',
        ...config,
    } as UsePrepareContractWriteConfig<
        typeof rafflePoolABI,
        'rawFulfillRandomWords'
    >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"renounceOwnership"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function usePrepareRafflePoolRenounceOwnership(
    config: Omit<
        UsePrepareContractWriteConfig<
            typeof rafflePoolABI,
            'renounceOwnership'
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'renounceOwnership',
        ...config,
    } as UsePrepareContractWriteConfig<
        typeof rafflePoolABI,
        'renounceOwnership'
    >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"transferOwnership"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function usePrepareRafflePoolTransferOwnership(
    config: Omit<
        UsePrepareContractWriteConfig<
            typeof rafflePoolABI,
            'transferOwnership'
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'transferOwnership',
        ...config,
    } as UsePrepareContractWriteConfig<
        typeof rafflePoolABI,
        'transferOwnership'
    >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"withdrawPlatformFee"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function usePrepareRafflePoolWithdrawPlatformFee(
    config: Omit<
        UsePrepareContractWriteConfig<
            typeof rafflePoolABI,
            'withdrawPlatformFee'
        >,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'withdrawPlatformFee',
        ...config,
    } as UsePrepareContractWriteConfig<
        typeof rafflePoolABI,
        'withdrawPlatformFee'
    >)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link rafflePoolABI}__ and `functionName` set to `"withdrawStEth"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function usePrepareRafflePoolWithdrawStEth(
    config: Omit<
        UsePrepareContractWriteConfig<typeof rafflePoolABI, 'withdrawStEth'>,
        'abi' | 'address' | 'functionName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return usePrepareContractWrite({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        functionName: 'withdrawStEth',
        ...config,
    } as UsePrepareContractWriteConfig<typeof rafflePoolABI, 'withdrawStEth'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link rafflePoolABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolEvent<TEventName extends string>(
    config: Omit<
        UseContractEventConfig<typeof rafflePoolABI, TEventName>,
        'abi' | 'address'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractEvent({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        ...config,
    } as UseContractEventConfig<typeof rafflePoolABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link rafflePoolABI}__ and `eventName` set to `"DepositSuccessful"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolDepositSuccessfulEvent(
    config: Omit<
        UseContractEventConfig<typeof rafflePoolABI, 'DepositSuccessful'>,
        'abi' | 'address' | 'eventName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractEvent({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        eventName: 'DepositSuccessful',
        ...config,
    } as UseContractEventConfig<typeof rafflePoolABI, 'DepositSuccessful'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link rafflePoolABI}__ and `eventName` set to `"MintAndDepositSuccessful"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolMintAndDepositSuccessfulEvent(
    config: Omit<
        UseContractEventConfig<
            typeof rafflePoolABI,
            'MintAndDepositSuccessful'
        >,
        'abi' | 'address' | 'eventName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractEvent({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        eventName: 'MintAndDepositSuccessful',
        ...config,
    } as UseContractEventConfig<
        typeof rafflePoolABI,
        'MintAndDepositSuccessful'
    >)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link rafflePoolABI}__ and `eventName` set to `"OwnershipTransferred"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolOwnershipTransferredEvent(
    config: Omit<
        UseContractEventConfig<typeof rafflePoolABI, 'OwnershipTransferred'>,
        'abi' | 'address' | 'eventName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractEvent({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        eventName: 'OwnershipTransferred',
        ...config,
    } as UseContractEventConfig<typeof rafflePoolABI, 'OwnershipTransferred'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link rafflePoolABI}__ and `eventName` set to `"PickedWinner"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolPickedWinnerEvent(
    config: Omit<
        UseContractEventConfig<typeof rafflePoolABI, 'PickedWinner'>,
        'abi' | 'address' | 'eventName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractEvent({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        eventName: 'PickedWinner',
        ...config,
    } as UseContractEventConfig<typeof rafflePoolABI, 'PickedWinner'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link rafflePoolABI}__ and `eventName` set to `"ProtocolFeeAdjusted"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolProtocolFeeAdjustedEvent(
    config: Omit<
        UseContractEventConfig<typeof rafflePoolABI, 'ProtocolFeeAdjusted'>,
        'abi' | 'address' | 'eventName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractEvent({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        eventName: 'ProtocolFeeAdjusted',
        ...config,
    } as UseContractEventConfig<typeof rafflePoolABI, 'ProtocolFeeAdjusted'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link rafflePoolABI}__ and `eventName` set to `"ProtocolFeeWithdrawn"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolProtocolFeeWithdrawnEvent(
    config: Omit<
        UseContractEventConfig<typeof rafflePoolABI, 'ProtocolFeeWithdrawn'>,
        'abi' | 'address' | 'eventName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractEvent({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        eventName: 'ProtocolFeeWithdrawn',
        ...config,
    } as UseContractEventConfig<typeof rafflePoolABI, 'ProtocolFeeWithdrawn'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link rafflePoolABI}__ and `eventName` set to `"RandomWord"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolRandomWordEvent(
    config: Omit<
        UseContractEventConfig<typeof rafflePoolABI, 'RandomWord'>,
        'abi' | 'address' | 'eventName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractEvent({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        eventName: 'RandomWord',
        ...config,
    } as UseContractEventConfig<typeof rafflePoolABI, 'RandomWord'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link rafflePoolABI}__ and `eventName` set to `"RequestedRaffleWinner"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolRequestedRaffleWinnerEvent(
    config: Omit<
        UseContractEventConfig<typeof rafflePoolABI, 'RequestedRaffleWinner'>,
        'abi' | 'address' | 'eventName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractEvent({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        eventName: 'RequestedRaffleWinner',
        ...config,
    } as UseContractEventConfig<typeof rafflePoolABI, 'RequestedRaffleWinner'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link rafflePoolABI}__ and `eventName` set to `"ScaledRandomNumber"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolScaledRandomNumberEvent(
    config: Omit<
        UseContractEventConfig<typeof rafflePoolABI, 'ScaledRandomNumber'>,
        'abi' | 'address' | 'eventName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractEvent({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        eventName: 'ScaledRandomNumber',
        ...config,
    } as UseContractEventConfig<typeof rafflePoolABI, 'ScaledRandomNumber'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link rafflePoolABI}__ and `eventName` set to `"StakingRewardsUpdated"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolStakingRewardsUpdatedEvent(
    config: Omit<
        UseContractEventConfig<typeof rafflePoolABI, 'StakingRewardsUpdated'>,
        'abi' | 'address' | 'eventName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractEvent({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        eventName: 'StakingRewardsUpdated',
        ...config,
    } as UseContractEventConfig<typeof rafflePoolABI, 'StakingRewardsUpdated'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link rafflePoolABI}__ and `eventName` set to `"WithdrawSuccessful"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0x82276EA98dF755d4AF1324142A236Fe1732E111d)
 */
export function useRafflePoolWithdrawSuccessfulEvent(
    config: Omit<
        UseContractEventConfig<typeof rafflePoolABI, 'WithdrawSuccessful'>,
        'abi' | 'address' | 'eventName'
    > & { chainId?: keyof typeof rafflePoolAddress } = {} as any,
) {
    return useContractEvent({
        abi: rafflePoolABI,
        address: rafflePoolAddress[5],
        eventName: 'WithdrawSuccessful',
        ...config,
    } as UseContractEventConfig<typeof rafflePoolABI, 'WithdrawSuccessful'>)
}
