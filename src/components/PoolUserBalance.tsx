'use client'
import { useState } from 'react'
import { formatEther, BaseError } from 'viem'
import { type Address } from 'wagmi'
import { useRafflePoolGetUserDeposit } from '../generated'
import CustomButton from './CustomButton'
import { useAccount } from 'wagmi'
import { PoolDeposit } from '@/components/PoolDeposit'
import { PoolWithdraw } from './PoolWithdraw'
import { formatBalance, formatDecimals } from '../utils/formatBalanceDecimals'

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

    const [openDeposit, setOpenDeposit] = useState(false)
    const [openWithdraw, setOpenWithdraw] = useState(false)

    console.log(data)
    let buttonStyles = 'rounded-sm mx-0 px-2 py-2'
    return (
        <div>
            <div className="raffle-card w-[400px] flex-initial flex-row mt-10 mx-auto px-6">
                <CustomButton title='Deposit' handleClick={() => setOpenDeposit(!openDeposit)} containerStyles={buttonStyles} />
                <CustomButton title='Withdraw' handleClick={() => setOpenWithdraw(!openWithdraw)} containerStyles={buttonStyles} />
                stETH balance: {' '}
                {isLoading ? 'Loading...' : isSuccess ? formatDecimals(data!, 3) : 'Loading...'}
                {error && <div>{(error as BaseError).shortMessage}</div>}
            </div>
            {openDeposit && <PoolDeposit />}
            {openWithdraw && <PoolWithdraw />}
        </div >
    )
}

