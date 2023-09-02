import { formatEther, BaseError } from 'viem'
import { formatBalance, formatDecimals } from '../utils/formatBalanceDecimals'
import { useRafflePoolGetTotalUserDeposits, useRafflePoolGetTotalBalance } from '../generated'

interface PoolRewardsBalanceProps {
    decimals?: number
}

function usePoolTotalBalance() {
    const { data: totalBalance, isLoading: isTotalBalanceLoading, isSuccess: isTotalBalanceSuccess, error: totalBalanceError, refetch: refetchTotalBalance } = useRafflePoolGetTotalBalance()

    return { totalBalance, isTotalBalanceLoading, totalBalanceError, isTotalBalanceSuccess, refetchTotalBalance }
}

function usePoolTotalUserDeposits() {
    const { data: TotalUserDeposits, isLoading: isTotalUserDepositsLoading, isSuccess: isTotalUserDepositsSuccess, error: TotalUserDepositsError, refetch: refetchTotalUserDeposits } = useRafflePoolGetTotalUserDeposits()

    return { TotalUserDeposits, isTotalUserDepositsLoading, TotalUserDepositsError, isTotalUserDepositsSuccess, refetchTotalUserDeposits }
}

function usePoolRaffleRewards(decimals: number = 18) {
    const { totalBalance, totalBalanceError, isTotalBalanceLoading, isTotalBalanceSuccess, refetchTotalBalance } = usePoolTotalBalance()
    const { TotalUserDeposits, TotalUserDepositsError, isTotalUserDepositsLoading, isTotalUserDepositsSuccess, refetchTotalUserDeposits } = usePoolTotalUserDeposits()

    const isLoading = isTotalBalanceLoading || isTotalUserDepositsLoading
    const error = totalBalanceError || TotalUserDepositsError
    const isSuccess = isTotalBalanceSuccess && isTotalUserDepositsSuccess
    // 

    function refetch() {
        refetchTotalBalance()
        refetchTotalUserDeposits()
    }

    let rewardsBalanceBig: bigint | undefined = 0n;
    let rewardsBalance: string | undefined = undefined;
    if (totalBalance && TotalUserDeposits) {
        rewardsBalanceBig = totalBalance - TotalUserDeposits
        rewardsBalance = formatDecimals(rewardsBalanceBig, decimals)
    }

    return { rewardsBalance, error, isLoading, isSuccess, refetch }
}

export default usePoolRaffleRewards