'use client'

import { useState } from 'react'
import { parseEther, BaseError } from 'viem'
import { usePrepareSendTransaction, useSendTransaction, useWaitForTransaction } from 'wagmi'
import { useDebounce } from '../hooks/useDebounce'
import { useStakePoolWithdrawStEth, usePrepareStakePoolWithdrawStEth } from '../generated'
import { type Address, useBalance, useAccount } from 'wagmi'
import { PoolUserBalance } from './PoolUserBalance'

import { stringify } from '../utils/stringify'

import { ValidateInput } from './ValidateInput';

export function Withdraw() {
    return (
        <div>
            <WithdrawStEth />
        </div>
    )
}

function WithdrawStEth() {
    // // get user's stETH balance in pool 
    // const contractBalance = <PoolUserBalance />

    const { address } = useAccount()
    const { data: userBalance, isLoading: isUserBalanceLoading } = useBalance({
        address: address as Address,
        watch: true,
    })

    const [value, setValue] = useState('')
    const [isValid, setIsValid] = useState(false);
    const debouncedValue = useDebounce(value)

    function handleInputChange(newValue: string, newIsValid: boolean) {
        setValue(newValue);
        setIsValid(newIsValid);
    }

    // const handleMaxClick = () => {
    //     setValue(contractBalance); // Set the input value to the maximum available stETH balance
    // };

    const { config } = usePrepareStakePoolWithdrawStEth({
        args: [debouncedValue ? parseEther(debouncedValue) : BigInt(0)],
        enabled: Boolean(debouncedValue),
    })

    const { write, data, error, isLoading, isError } = useStakePoolWithdrawStEth(config)

    const { data: receipt, isLoading: isPending, isSuccess } = useWaitForTransaction({ hash: data?.hash })

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    write?.()
                }}
            >
                Withdraw stETH:{' '}
                <ValidateInput
                    onChange={handleInputChange}
                    placeholder="stETH amount"
                    value={value}
                />
                <button disabled={!write && !isValid} type="submit">Withdraw</button>
            </form>
            {isLoading && <div>Check wallet...</div>}
            {isPending && <div>Transaction pending...</div>}

            {isSuccess && (
                <>
                    <div>Transaction Hash: {data?.hash}</div>
                </>
            )}
            {isError && <div>{(error as BaseError)?.shortMessage}</div>}
        </>
    )
}