import { useRafflePoolGetTotalUserDeposits } from '../generated';

function usePoolTotalUserDeposits() {
    const {
        data: totalUserDeposits,
        isLoading: isTotalUserDepositsLoading,
        isSuccess: isTotalUserDepositsSuccess,
        error: totalUserDepositsError,
        refetch: refetchTotalUserDeposits,
    } = useRafflePoolGetTotalUserDeposits({ watch: true });

    return {
        totalUserDeposits,
        isTotalUserDepositsLoading,
        totalUserDepositsError,
        isTotalUserDepositsSuccess,
        refetchTotalUserDeposits,
    };
}

export default usePoolTotalUserDeposits;
