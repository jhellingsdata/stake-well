'use client'

import { formatEther, BaseError } from 'viem'
import { useStakePoolStakingRewardsTotal, useStakePoolUserDepositsTotal, useStakePoolTotalBalance } from '../generated'

interface PoolRewardsBalanceProps {
    decimals?: number
}

export const PoolRewardsBalance: React.FC<PoolRewardsBalanceProps> = ({ decimals = 18 }) => {
    return (
        <div>
            <RewardsBalance decimals={decimals} />
        </div>
    )
}

interface RewardsBalanceProps {
    decimals: number
}

function RewardsBalance({ decimals }: RewardsBalanceProps) {
    // Fetch total contract balance and total users' deposits
    const { data: totalBalance, isLoading: isTotalBalanceLoading, error: totalBalanceError } = useStakePoolTotalBalance()
    const { data: totalUserDeposits, isLoading: isTotalUserDepositsLoading, error: totalUserDepositsError } = useStakePoolUserDepositsTotal()

    const isLoading = isTotalBalanceLoading || isTotalUserDepositsLoading
    const error = totalBalanceError || totalUserDepositsError

    const formatBalance = (balance: bigint) => {
        let etherString = formatEther(balance)
        return parseFloat(etherString).toFixed(decimals)
    }

    // Calculate staking rewards
    let rewards: bigint | null = null;
    if (totalBalance && totalUserDeposits) {
        rewards = totalBalance - totalUserDeposits
    }

    return (
        <div>
            Pool Rewards Balance: {' '}
            {isLoading ? 'Loading...' : rewards !== null ? formatBalance(rewards) : 'Data not available'}
            {error && <div>{(error as BaseError).shortMessage}</div>}
        </div>
    )
}