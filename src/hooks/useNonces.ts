import { type Address, useAccount } from 'wagmi'
import { useIerc20PermitNonces } from "../generated";
import { use } from 'react';


function useNonces() {
    const { address } = useAccount()

    const { data, error, isLoading, isSuccess, isError, refetch, isRefetching } = useIerc20PermitNonces({
        args: [address as Address],
        enabled: Boolean(address),
    })
}


export default useNonces