import { useAccount, useBalance } from 'wagmi'

export function useAccountBalance() {
    const { address } = useAccount()
    const { data, refetch: refetchEthBalance } = useBalance({
        address,
        watch: true,
    })

    let ethBalance = data?.formatted
    let ethSymbol = data?.symbol
    return { ethBalance, ethSymbol, refetchEthBalance }
}

export function useAccountTokenBalance() {
    const { address } = useAccount()
    const { data, refetch: refetchStEthBalance } = useBalance({
        address,
        watch: true,
        token: '0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F',    // Goerli testnet stETH token
    })

    let stEthBalance = data?.formatted
    let stEthSymbol = data?.symbol
    return { stEthBalance, stEthSymbol, refetchStEthBalance }
}