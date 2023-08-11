'use client'

import { formatEther, BaseError } from 'viem'
import { useStakePoolTotalBalance } from '../generated'

interface PoolTotalBalanceProps {
    decimals?: number;
}

export const PoolTotalBalance: React.FC<PoolTotalBalanceProps> = ({ decimals = 18 }) => {
    return (
        <div>
            <TotalBalance decimals={decimals} />
        </div>
    )
}

interface TotalBalanceProps {
    decimals: number;
}

function TotalBalance({ decimals }: TotalBalanceProps) {
    const { data, error, isLoading, isSuccess, refetch } = useStakePoolTotalBalance()

    const formatBalance = (balance: bigint) => {
        let etherString = formatEther(balance);
        return parseFloat(etherString).toFixed(decimals);
    }

    console.log(data)
    return (
        <div>
            Total stETH balance: {' '}
            {isLoading ? 'Loading...' : data ? formatBalance(data) : 'Data not available'}
            {/* <button onClick={() => refetch()}>
                {isLoading ? 'fetching...' : 'fetch'}
            </button> */}
            {error && <div>{(error as BaseError).shortMessage}</div>}
        </div>
    )
}