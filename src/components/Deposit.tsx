'use client'

import { useState, useEffect } from 'react'
import { parseEther, BaseError } from 'viem'
import { type Address, usePrepareSendTransaction, useSendTransaction, useWaitForTransaction } from 'wagmi'
import { useDebounce } from '../hooks/useDebounce'
import { rafflePoolAddress, useRafflePoolDepositEth, usePrepareRafflePoolDepositEth, useStakePoolDepositStEth, usePrepareStakePoolDepositStEth, useIerc20Approve, usePrepareIerc20Approve } from '../generated'
import { ValidateInput } from './ValidateInput';

export function Deposit() {
    return (
        <div>
            <DepositEth />
        </div>
    )
}


function DepositEth() {

    const [value, setValue] = useState('')
    const [isValid, setIsValid] = useState(false);
    const debouncedValue = useDebounce(value)

    function handleInputChange(newValue: string, newIsValid: boolean) {
        setValue(newValue);
        setIsValid(newIsValid);
    }

    const { config } = usePrepareRafflePoolDepositEth({
        value: debouncedValue ? parseEther(debouncedValue) : BigInt(0),
        enabled: Boolean(debouncedValue),
    })

    const { write, data, error, isLoading, isError } =
        useRafflePoolDepositEth(config)

    const {
        data: receipt,
        isLoading: isPending,
        isSuccess,
    } = useWaitForTransaction({ hash: data?.hash })

    return (
        <>
            <form
                onSubmit={(e) => {
                    console.log(value)
                    e.preventDefault()
                    write?.()
                }}
            >
                Deposit ETH:{' '}
                <ValidateInput
                    onChange={handleInputChange}
                    placeholder="ETH amount"
                    value={value}
                />
                <button disabled={!write && !isValid} type="submit">Send</button>
            </form>
            {isLoading && <div>Check wallet...</div>}
            {isPending && <div>Transaction pending...</div>}
            {isSuccess && (
                <>
                    <div>Transaction Hash: {data?.hash}</div>
                    {/* <div>
                        Transaction Receipt: <pre>{stringify(receipt, null, 2)}</pre>
                    </div> */}
                </>
            )}
            {isError && <div>{(error as BaseError)?.shortMessage}</div>}
        </>
    )
}

