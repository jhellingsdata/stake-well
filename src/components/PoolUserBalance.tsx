'use client'

import { useState } from 'react'
import { formatEther, BaseError } from 'viem'
import { type Address } from 'wagmi'
import { useDebounce } from '../hooks/useDebounce'
import { useStakePoolDepositEth, usePrepareStakePoolDepositEth, useStakePoolBalanceOf } from '../generated'

import { stringify } from '../utils/stringify'

import { useAccount } from 'wagmi'

interface PoolUserBalanceProps {
    decimals?: number;
}

export const PoolUserBalance = () => {
    return (
        <div>
            <ViewUserBalance />
        </div>
    )
}

function ViewUserBalance() {
    const { address } = useAccount()

    const { data, error, isLoading, isSuccess, isError, refetch, isRefetching } = useStakePoolBalanceOf({
        args: [address as Address],
        enabled: Boolean(address),
    })

    return (
        <div>
            stETH balance: {isSuccess && data ? formatEther(data) : 'Loading...'}
            <button onClick={() => refetch()}>
                {isLoading ? 'fetching...' : 'fetch'}
            </button>
            {error && <div>{(error as BaseError).shortMessage}</div>}
        </div>
    )
}

