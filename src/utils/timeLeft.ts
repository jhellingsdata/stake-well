import { useRafflePoolGetUserDeposit } from '../generated'

function usePoolUserBalance() {
    const { address } = useAccount()

    const { data, error, isLoading, isSuccess, isError, refetch, isRefetching } = useRafflePoolGetUserDeposit({
        args: [address as Address],
        enabled: Boolean(address),
    })

    return { balance: data, error, isLoading, isSuccess, isError, refetch, isRefetching }
}

export default usePoolUserBalance