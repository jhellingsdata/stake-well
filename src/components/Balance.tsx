'use client'

import { useState } from 'react'
import type { Address } from 'wagmi'
import { useAccount, useBalance } from 'wagmi'

export function Balance() {
    return (
        <>
            <div>
                <AccountBalance />
            </div>
            <br />
            <div>
                <AccountTokenBalance />
            </div>
        </>
    )
}

export function AccountBalance() {
    const { address } = useAccount()
    const { data, refetch } = useBalance({
        address,
        watch: true,
    })

    return (
        <div>
            {data?.formatted}
            {' '}
            {data?.symbol}
            <button onClick={() => refetch()}>refetch</button>
        </div>
    )
}

export function AccountTokenBalance() {
    const { address } = useAccount()
    const { data, refetch } = useBalance({
        address,
        watch: true,
        token: '0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F',    // Goerli testnet stETH token
    })

    return (
        <div>
            {data?.formatted}
            {' '}
            {data?.symbol}
            <button onClick={() => refetch()}>refetch</button>
        </div>
    )
}


export function FindBalance() {
    const [address, setAddress] = useState('')
    const { data, isLoading, refetch } = useBalance({
        address: address as Address,
    })

    const [value, setValue] = useState('')

    return (
        <div>
            Find balance:{' '}
            <input
                onChange={(e) => setValue(e.target.value)}
                placeholder="wallet address"
                value={value}
            />
            <button
                onClick={() => (value === address ? refetch() : setAddress(value))}
            >
                {isLoading ? 'fetching...' : 'fetch'}
            </button>
            <div>{data?.formatted}</div>
        </div>
    )
}
