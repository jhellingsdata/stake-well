import { useRafflePoolGetActiveDepositorsCount } from "../generated";

function usePoolUserCount() {
    const { data: userCountBig, isLoading: isUserCountLoading, isSuccess: isUserCountSuccess, error: userCountError, refetch: refetchUserCount } = useRafflePoolGetActiveDepositorsCount()
    // `userCount` is a uint256 (bigint) that represents the number of unique addresses that have deposited into the pool
    // cast it to a number to use it in the UI
    const userCount = Number(userCountBig)
    return { userCount, isUserCountLoading, userCountError, isUserCountSuccess, refetchUserCount }
}

export default usePoolUserCount