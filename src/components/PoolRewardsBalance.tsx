'use client';

import { formatEther, BaseError } from 'viem';
import {
    useRafflePoolGetTotalUserDeposits,
    useRafflePoolGetTotalBalance,
} from '../generated';

interface PoolRewardsBalanceProps {
    decimals?: number;
}

export const PoolRewardsBalance: React.FC<PoolRewardsBalanceProps> = ({
    decimals = 18,
}) => {
    return (
        <div>
            <RewardsBalance decimals={decimals} />
        </div>
    );
};

interface RewardsBalanceProps {
    decimals: number;
}

function RewardsBalance({ decimals }: RewardsBalanceProps) {
    // Fetch total contract balance and total users' deposits
    const {
        data: totalBalance,
        isLoading: isTotalBalanceLoading,
        error: totalBalanceError,
        refetch: refetchTotalBalance,
    } = useRafflePoolGetTotalBalance({ watch: true });
    const {
        data: totalUserDeposits,
        isLoading: isTotalUserDepositsLoading,
        error: totalUserDepositsError,
        refetch: refetchTotalDeposits,
    } = useRafflePoolGetTotalUserDeposits({ watch: true });

    const isLoading = isTotalBalanceLoading || isTotalUserDepositsLoading;
    const error = totalBalanceError || totalUserDepositsError;

    const formatBalance = (balance: bigint) => {
        let etherString = formatEther(balance);
        return parseFloat(etherString).toFixed(decimals);
    };

    // Calculate staking rewards
    let rewards: bigint | null = null;
    if (totalBalance && totalUserDeposits) {
        console.log('totalBalance', totalBalance);
        console.log('totalUserDeposits', totalUserDeposits);
        rewards = totalBalance - totalUserDeposits;
    }

    function refetch() {
        refetchTotalBalance();
        refetchTotalDeposits();
    }
    // @dev TODO: after withdraw, this returned a negative number initially, then it became 0, suggesting one is updating faster than the other

    return (
        <div>
            Pool Rewards Balance:{' '}
            {isLoading
                ? 'Loading...'
                : rewards !== null
                ? formatBalance(rewards)
                : 'Data not available'}
            <button onClick={() => refetch()}>
                {isLoading ? 'fetching...' : 'fetch'}
            </button>
            {error && <div>{(error as BaseError).shortMessage}</div>}
        </div>
    );
}
