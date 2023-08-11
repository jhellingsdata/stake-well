'use client'

import { formatEther, BaseError } from 'viem'
import { type Address } from 'wagmi'
import { useStakePoolBalanceOf } from '../generated'

import { useAccount } from 'wagmi'

interface PoolUserBalanceProps {
    decimals?: number;
}

export const PoolUserBalance: React.FC<PoolUserBalanceProps> = ({ decimals = 18 }) => {
    return (
        <div>
            <ViewUserBalance decimals={decimals} />
        </div>
    )
}

interface ViewUserBalanceProps {
    decimals: number;
}

function ViewUserBalance({ decimals }: ViewUserBalanceProps) {
    const { address } = useAccount()

    const { data, error, isLoading, isSuccess, isError, refetch, isRefetching } = useStakePoolBalanceOf({
        args: [address as Address],
        enabled: Boolean(address),
    })

    const formatBalance = (balance: bigint) => {
        let etherString = formatEther(balance);
        return parseFloat(etherString).toFixed(decimals);
    }

    return (
        <div>
            stETH balance: {isSuccess && data ? formatBalance(data) : 'Loading...'}
            <button onClick={() => refetch()}>
                {isLoading ? 'fetching...' : 'fetch'}
            </button>
            {error && <div>{(error as BaseError).shortMessage}</div>}
        </div>
    )
}

