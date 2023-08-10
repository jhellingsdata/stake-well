// Generated by @wagmi/cli@1.3.0 on 8/10/2023 at 3:41:24 PM
import {
  useContractRead,
  UseContractReadConfig,
  useContractWrite,
  UseContractWriteConfig,
  usePrepareContractWrite,
  UsePrepareContractWriteConfig,
  useContractEvent,
  UseContractEventConfig,
  Address,
} from 'wagmi'
import {
  ReadContractResult,
  WriteContractMode,
  PrepareWriteContractResult,
} from 'wagmi/actions'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc20ABI = [
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
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
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
      { name: 'value', internalType: 'uint256', type: 'uint256' },
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
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// StakePool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export const stakePoolABI = [
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [{ name: '_stETH', internalType: 'address', type: 'address' }],
  },
  { type: 'error', inputs: [], name: 'StakePool__InsufficientStETHBalance' },
  { type: 'error', inputs: [], name: 'StakePool__MintFailed' },
  { type: 'error', inputs: [], name: 'StakePool__NeedsMoreThanZero' },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [],
    name: 'depositETH',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'stETH',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'stakingRewardsTotal',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'totalBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'userDepositsTotal',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'withdrawETH',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'withdrawStETH',
    outputs: [],
  },
] as const

/**
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export const stakePoolAddress = {
  5: '0xf40dBD5531D06194749c24C077e53270c24D5c2C',
} as const

/**
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export const stakePoolConfig = {
  address: stakePoolAddress,
  abi: stakePoolABI,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link ierc20ABI}__.
 */
export function useIerc20Read<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof ierc20ABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof ierc20ABI, TFunctionName, TSelectData>,
    'abi'
  > = {} as any,
) {
  return useContractRead({ abi: ierc20ABI, ...config } as UseContractReadConfig<
    typeof ierc20ABI,
    TFunctionName,
    TSelectData
  >)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link ierc20ABI}__ and `functionName` set to `"allowance"`.
 */
export function useIerc20Allowance<
  TFunctionName extends 'allowance',
  TSelectData = ReadContractResult<typeof ierc20ABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof ierc20ABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: ierc20ABI,
    functionName: 'allowance',
    ...config,
  } as UseContractReadConfig<typeof ierc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link ierc20ABI}__ and `functionName` set to `"balanceOf"`.
 */
export function useIerc20BalanceOf<
  TFunctionName extends 'balanceOf',
  TSelectData = ReadContractResult<typeof ierc20ABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof ierc20ABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: ierc20ABI,
    functionName: 'balanceOf',
    ...config,
  } as UseContractReadConfig<typeof ierc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link ierc20ABI}__ and `functionName` set to `"totalSupply"`.
 */
export function useIerc20TotalSupply<
  TFunctionName extends 'totalSupply',
  TSelectData = ReadContractResult<typeof ierc20ABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof ierc20ABI, TFunctionName, TSelectData>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return useContractRead({
    abi: ierc20ABI,
    functionName: 'totalSupply',
    ...config,
  } as UseContractReadConfig<typeof ierc20ABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link ierc20ABI}__.
 */
export function useIerc20Write<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<typeof ierc20ABI, string>['request']['abi'],
        TFunctionName,
        TMode
      >
    : UseContractWriteConfig<typeof ierc20ABI, TFunctionName, TMode> & {
        abi?: never
      } = {} as any,
) {
  return useContractWrite<typeof ierc20ABI, TFunctionName, TMode>({
    abi: ierc20ABI,
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link ierc20ABI}__ and `functionName` set to `"approve"`.
 */
export function useIerc20Approve<TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof ierc20ABI,
          'approve'
        >['request']['abi'],
        'approve',
        TMode
      > & { functionName?: 'approve' }
    : UseContractWriteConfig<typeof ierc20ABI, 'approve', TMode> & {
        abi?: never
        functionName?: 'approve'
      } = {} as any,
) {
  return useContractWrite<typeof ierc20ABI, 'approve', TMode>({
    abi: ierc20ABI,
    functionName: 'approve',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link ierc20ABI}__ and `functionName` set to `"transfer"`.
 */
export function useIerc20Transfer<TMode extends WriteContractMode = undefined>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof ierc20ABI,
          'transfer'
        >['request']['abi'],
        'transfer',
        TMode
      > & { functionName?: 'transfer' }
    : UseContractWriteConfig<typeof ierc20ABI, 'transfer', TMode> & {
        abi?: never
        functionName?: 'transfer'
      } = {} as any,
) {
  return useContractWrite<typeof ierc20ABI, 'transfer', TMode>({
    abi: ierc20ABI,
    functionName: 'transfer',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link ierc20ABI}__ and `functionName` set to `"transferFrom"`.
 */
export function useIerc20TransferFrom<
  TMode extends WriteContractMode = undefined,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof ierc20ABI,
          'transferFrom'
        >['request']['abi'],
        'transferFrom',
        TMode
      > & { functionName?: 'transferFrom' }
    : UseContractWriteConfig<typeof ierc20ABI, 'transferFrom', TMode> & {
        abi?: never
        functionName?: 'transferFrom'
      } = {} as any,
) {
  return useContractWrite<typeof ierc20ABI, 'transferFrom', TMode>({
    abi: ierc20ABI,
    functionName: 'transferFrom',
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link ierc20ABI}__.
 */
export function usePrepareIerc20Write<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof ierc20ABI, TFunctionName>,
    'abi'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: ierc20ABI,
    ...config,
  } as UsePrepareContractWriteConfig<typeof ierc20ABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link ierc20ABI}__ and `functionName` set to `"approve"`.
 */
export function usePrepareIerc20Approve(
  config: Omit<
    UsePrepareContractWriteConfig<typeof ierc20ABI, 'approve'>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: ierc20ABI,
    functionName: 'approve',
    ...config,
  } as UsePrepareContractWriteConfig<typeof ierc20ABI, 'approve'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link ierc20ABI}__ and `functionName` set to `"transfer"`.
 */
export function usePrepareIerc20Transfer(
  config: Omit<
    UsePrepareContractWriteConfig<typeof ierc20ABI, 'transfer'>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: ierc20ABI,
    functionName: 'transfer',
    ...config,
  } as UsePrepareContractWriteConfig<typeof ierc20ABI, 'transfer'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link ierc20ABI}__ and `functionName` set to `"transferFrom"`.
 */
export function usePrepareIerc20TransferFrom(
  config: Omit<
    UsePrepareContractWriteConfig<typeof ierc20ABI, 'transferFrom'>,
    'abi' | 'functionName'
  > = {} as any,
) {
  return usePrepareContractWrite({
    abi: ierc20ABI,
    functionName: 'transferFrom',
    ...config,
  } as UsePrepareContractWriteConfig<typeof ierc20ABI, 'transferFrom'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link ierc20ABI}__.
 */
export function useIerc20Event<TEventName extends string>(
  config: Omit<
    UseContractEventConfig<typeof ierc20ABI, TEventName>,
    'abi'
  > = {} as any,
) {
  return useContractEvent({
    abi: ierc20ABI,
    ...config,
  } as UseContractEventConfig<typeof ierc20ABI, TEventName>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link ierc20ABI}__ and `eventName` set to `"Approval"`.
 */
export function useIerc20ApprovalEvent(
  config: Omit<
    UseContractEventConfig<typeof ierc20ABI, 'Approval'>,
    'abi' | 'eventName'
  > = {} as any,
) {
  return useContractEvent({
    abi: ierc20ABI,
    eventName: 'Approval',
    ...config,
  } as UseContractEventConfig<typeof ierc20ABI, 'Approval'>)
}

/**
 * Wraps __{@link useContractEvent}__ with `abi` set to __{@link ierc20ABI}__ and `eventName` set to `"Transfer"`.
 */
export function useIerc20TransferEvent(
  config: Omit<
    UseContractEventConfig<typeof ierc20ABI, 'Transfer'>,
    'abi' | 'eventName'
  > = {} as any,
) {
  return useContractEvent({
    abi: ierc20ABI,
    eventName: 'Transfer',
    ...config,
  } as UseContractEventConfig<typeof ierc20ABI, 'Transfer'>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link stakePoolABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export function useStakePoolRead<
  TFunctionName extends string,
  TSelectData = ReadContractResult<typeof stakePoolABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof stakePoolABI, TFunctionName, TSelectData>,
    'abi' | 'address'
  > & { chainId?: keyof typeof stakePoolAddress } = {} as any,
) {
  return useContractRead({
    abi: stakePoolABI,
    address: stakePoolAddress[5],
    ...config,
  } as UseContractReadConfig<typeof stakePoolABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link stakePoolABI}__ and `functionName` set to `"balanceOf"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export function useStakePoolBalanceOf<
  TFunctionName extends 'balanceOf',
  TSelectData = ReadContractResult<typeof stakePoolABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof stakePoolABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof stakePoolAddress } = {} as any,
) {
  return useContractRead({
    abi: stakePoolABI,
    address: stakePoolAddress[5],
    functionName: 'balanceOf',
    ...config,
  } as UseContractReadConfig<typeof stakePoolABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link stakePoolABI}__ and `functionName` set to `"stETH"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export function useStakePoolStEth<
  TFunctionName extends 'stETH',
  TSelectData = ReadContractResult<typeof stakePoolABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof stakePoolABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof stakePoolAddress } = {} as any,
) {
  return useContractRead({
    abi: stakePoolABI,
    address: stakePoolAddress[5],
    functionName: 'stETH',
    ...config,
  } as UseContractReadConfig<typeof stakePoolABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link stakePoolABI}__ and `functionName` set to `"stakingRewardsTotal"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export function useStakePoolStakingRewardsTotal<
  TFunctionName extends 'stakingRewardsTotal',
  TSelectData = ReadContractResult<typeof stakePoolABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof stakePoolABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof stakePoolAddress } = {} as any,
) {
  return useContractRead({
    abi: stakePoolABI,
    address: stakePoolAddress[5],
    functionName: 'stakingRewardsTotal',
    ...config,
  } as UseContractReadConfig<typeof stakePoolABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link stakePoolABI}__ and `functionName` set to `"totalBalance"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export function useStakePoolTotalBalance<
  TFunctionName extends 'totalBalance',
  TSelectData = ReadContractResult<typeof stakePoolABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof stakePoolABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof stakePoolAddress } = {} as any,
) {
  return useContractRead({
    abi: stakePoolABI,
    address: stakePoolAddress[5],
    functionName: 'totalBalance',
    ...config,
  } as UseContractReadConfig<typeof stakePoolABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractRead}__ with `abi` set to __{@link stakePoolABI}__ and `functionName` set to `"userDepositsTotal"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export function useStakePoolUserDepositsTotal<
  TFunctionName extends 'userDepositsTotal',
  TSelectData = ReadContractResult<typeof stakePoolABI, TFunctionName>,
>(
  config: Omit<
    UseContractReadConfig<typeof stakePoolABI, TFunctionName, TSelectData>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof stakePoolAddress } = {} as any,
) {
  return useContractRead({
    abi: stakePoolABI,
    address: stakePoolAddress[5],
    functionName: 'userDepositsTotal',
    ...config,
  } as UseContractReadConfig<typeof stakePoolABI, TFunctionName, TSelectData>)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link stakePoolABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export function useStakePoolWrite<
  TFunctionName extends string,
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof stakePoolAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof stakePoolABI,
          string
        >['request']['abi'],
        TFunctionName,
        TMode
      > & { address?: Address; chainId?: TChainId }
    : UseContractWriteConfig<typeof stakePoolABI, TFunctionName, TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
      } = {} as any,
) {
  return useContractWrite<typeof stakePoolABI, TFunctionName, TMode>({
    abi: stakePoolABI,
    address: stakePoolAddress[5],
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link stakePoolABI}__ and `functionName` set to `"depositETH"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export function useStakePoolDepositEth<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof stakePoolAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof stakePoolABI,
          'depositETH'
        >['request']['abi'],
        'depositETH',
        TMode
      > & { address?: Address; chainId?: TChainId; functionName?: 'depositETH' }
    : UseContractWriteConfig<typeof stakePoolABI, 'depositETH', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'depositETH'
      } = {} as any,
) {
  return useContractWrite<typeof stakePoolABI, 'depositETH', TMode>({
    abi: stakePoolABI,
    address: stakePoolAddress[5],
    functionName: 'depositETH',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link stakePoolABI}__ and `functionName` set to `"withdrawETH"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export function useStakePoolWithdrawEth<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof stakePoolAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof stakePoolABI,
          'withdrawETH'
        >['request']['abi'],
        'withdrawETH',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'withdrawETH'
      }
    : UseContractWriteConfig<typeof stakePoolABI, 'withdrawETH', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'withdrawETH'
      } = {} as any,
) {
  return useContractWrite<typeof stakePoolABI, 'withdrawETH', TMode>({
    abi: stakePoolABI,
    address: stakePoolAddress[5],
    functionName: 'withdrawETH',
    ...config,
  } as any)
}

/**
 * Wraps __{@link useContractWrite}__ with `abi` set to __{@link stakePoolABI}__ and `functionName` set to `"withdrawStETH"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export function useStakePoolWithdrawStEth<
  TMode extends WriteContractMode = undefined,
  TChainId extends number = keyof typeof stakePoolAddress,
>(
  config: TMode extends 'prepared'
    ? UseContractWriteConfig<
        PrepareWriteContractResult<
          typeof stakePoolABI,
          'withdrawStETH'
        >['request']['abi'],
        'withdrawStETH',
        TMode
      > & {
        address?: Address
        chainId?: TChainId
        functionName?: 'withdrawStETH'
      }
    : UseContractWriteConfig<typeof stakePoolABI, 'withdrawStETH', TMode> & {
        abi?: never
        address?: never
        chainId?: TChainId
        functionName?: 'withdrawStETH'
      } = {} as any,
) {
  return useContractWrite<typeof stakePoolABI, 'withdrawStETH', TMode>({
    abi: stakePoolABI,
    address: stakePoolAddress[5],
    functionName: 'withdrawStETH',
    ...config,
  } as any)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link stakePoolABI}__.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export function usePrepareStakePoolWrite<TFunctionName extends string>(
  config: Omit<
    UsePrepareContractWriteConfig<typeof stakePoolABI, TFunctionName>,
    'abi' | 'address'
  > & { chainId?: keyof typeof stakePoolAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: stakePoolABI,
    address: stakePoolAddress[5],
    ...config,
  } as UsePrepareContractWriteConfig<typeof stakePoolABI, TFunctionName>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link stakePoolABI}__ and `functionName` set to `"depositETH"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export function usePrepareStakePoolDepositEth(
  config: Omit<
    UsePrepareContractWriteConfig<typeof stakePoolABI, 'depositETH'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof stakePoolAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: stakePoolABI,
    address: stakePoolAddress[5],
    functionName: 'depositETH',
    ...config,
  } as UsePrepareContractWriteConfig<typeof stakePoolABI, 'depositETH'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link stakePoolABI}__ and `functionName` set to `"withdrawETH"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export function usePrepareStakePoolWithdrawEth(
  config: Omit<
    UsePrepareContractWriteConfig<typeof stakePoolABI, 'withdrawETH'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof stakePoolAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: stakePoolABI,
    address: stakePoolAddress[5],
    functionName: 'withdrawETH',
    ...config,
  } as UsePrepareContractWriteConfig<typeof stakePoolABI, 'withdrawETH'>)
}

/**
 * Wraps __{@link usePrepareContractWrite}__ with `abi` set to __{@link stakePoolABI}__ and `functionName` set to `"withdrawStETH"`.
 *
 * [__View Contract on Goerli Etherscan__](https://goerli.etherscan.io/address/0xf40dBD5531D06194749c24C077e53270c24D5c2C)
 */
export function usePrepareStakePoolWithdrawStEth(
  config: Omit<
    UsePrepareContractWriteConfig<typeof stakePoolABI, 'withdrawStETH'>,
    'abi' | 'address' | 'functionName'
  > & { chainId?: keyof typeof stakePoolAddress } = {} as any,
) {
  return usePrepareContractWrite({
    abi: stakePoolABI,
    address: stakePoolAddress[5],
    functionName: 'withdrawStETH',
    ...config,
  } as UsePrepareContractWriteConfig<typeof stakePoolABI, 'withdrawStETH'>)
}
