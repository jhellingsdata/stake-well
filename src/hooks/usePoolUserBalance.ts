import { type Address, useAccount } from 'wagmi'
import { useStakePoolBalanceOf } from '../generated'

function usePoolUserBalance() {
    const { address } = useAccount()

    const { data, error, isLoading, isSuccess, isError, refetch, isRefetching } = useStakePoolBalanceOf({
        args: [address as Address],
        enabled: Boolean(address),
    })

    return { balance: data, error, isLoading, isSuccess, isError, refetch, isRefetching }
}

export default usePoolUserBalance