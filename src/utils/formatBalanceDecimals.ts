import { formatEther } from 'viem'

export const formatBalance = (balance: bigint | string, decimals: number) => {
    // If balance is 0, default decimals to 0
    console.log(balance)
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

export const formatDecimals = (balance: bigint, decimals: number) => {
    let etherString = formatEther(balance)
    return parseFloat(etherString).toFixed(decimals)
}