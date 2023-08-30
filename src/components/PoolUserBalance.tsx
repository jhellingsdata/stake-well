'use client'

import { formatEther, BaseError } from 'viem'
import { type Address } from 'wagmi'
import { useRafflePoolGetUserDeposit } from '../generated'

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

    const { data, error, isLoading, isSuccess, isError, refetch, isRefetching } = useRafflePoolGetUserDeposit({
        args: [address as Address],
        enabled: Boolean(address),
    })

    const formatBalance = (balance: bigint) => {
        // If balance is 0, default decimals to 0
        if (balance === 0n) {
            return '0'
        }
        let etherString = balance.toString();
        if (etherString.length <= decimals) {
            return '0.' + etherString.padStart(decimals, '0');
        }
        return (
            etherString.slice(0, -decimals) +
            '.' +
            etherString.slice(-decimals).slice(0, decimals)
        )
    }
    // <div>
    //     Total stETH balance: {' '}
    //     {isLoading ? 'Loading...' : data ? formatBalance(data) : 'Data not available'}
    //     <button onClick={() => refetch()}>
    //         {isLoading ? 'fetching...' : 'fetch'}
    //     </button>
    //     {error && <div>{(error as BaseError).shortMessage}</div>}
    // </div>
    console.log(data)
    return (
        <div>
            stETH balance: {isLoading ? 'Loading...' : isSuccess ? formatBalance(data!) : 'Loading...'}
            <button onClick={() => refetch()}>
                {isRefetching ? 'fetching...' : 'fetch'}
            </button>
            {error && <div>{(error as BaseError).shortMessage}</div>}
        </div>
    )
}

