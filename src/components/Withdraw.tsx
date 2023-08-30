'use client'

import { useState } from 'react'
import { parseEther, BaseError, formatEther } from 'viem'
import { usePrepareSendTransaction, useSendTransaction, useWaitForTransaction } from 'wagmi'
import { useRafflePoolGetUserDeposit, useRafflePoolWithdrawStEth, usePrepareRafflePoolWithdrawStEth } from '../generated'
import { type Address, useBalance, useAccount } from 'wagmi'

/* Custom Components */
import { ValidateInput } from './ValidateInput';

/* Hooks */
import { useDebounce } from '../hooks/useDebounce'
import usePoolUserBalance from '../hooks/usePoolUserBalance';
/* Utils */



export function Withdraw() {
    return (
        <div>
            <WithdrawStEth />
        </div>
    )
}

function WithdrawStEth() {
    // // get user's stETH balance in pool 
    const { balance } = usePoolUserBalance()

    const { address } = useAccount()
    const { data: userWalletBalance, isLoading: isUserWalletBalanceLoading } = useBalance({
        address: address as Address,
        watch: true,
    })

    // const { data: userDepositBalance, isLoading: isUserDepositBalanceLoading } = useRafflePoolGetUserDeposit({
    //     args: [address as Address],
    //     enabled: Boolean(address),
    //     watch: true,
    // })

    const [value, setValue] = useState('')
    const [isValid, setIsValid] = useState(false);
    const debouncedValue = useDebounce(value)

    function handleInputChange(newValue: string, newIsValid: boolean) {
        setValue(newValue);
        setIsValid(newIsValid);
    }

    const handleMaxClick = () => {
        setValue(balance ? formatEther(balance) : '0') // Convert BigInt to string, adjust as needed
    }

    const { config } = usePrepareRafflePoolWithdrawStEth({
        args: [debouncedValue ? parseEther(debouncedValue) : BigInt(0)],
        enabled: Boolean(debouncedValue),
    })

    const { write, data, error, isLoading, isError } = useRafflePoolWithdrawStEth(config)

    const { data: receipt, isLoading: isPending, isSuccess } = useWaitForTransaction({ hash: data?.hash })

    console.log(balance)
    console.log(userWalletBalance)
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
                <button onClick={handleMaxClick}>Max</button>
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