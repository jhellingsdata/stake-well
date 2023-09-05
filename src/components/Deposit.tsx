'use client'

import { useState, useEffect, memo } from 'react'
import { parseEther, BaseError } from 'viem'
import { useWaitForTransaction } from 'wagmi'
import { useDebounce } from '../hooks/useDebounce'
import { useRafflePoolDepositEth, usePrepareRafflePoolDepositEth } from '../generated'
import { ValidateInput } from './ValidateInput'
import CustomButton from './CustomButton'

export const Deposit = () => {
    return <MemoisedDepositEth />
}

const DepositEth = () => {
    console.log("Component re-rendered")


    const [value, setValue] = useState('')
    const [isValid, setIsValid] = useState(false)
    const debouncedValue = useDebounce(value)

    function handleInputChange(newValue: string, newIsValid: boolean) {
        setValue(newValue);
        setIsValid(newIsValid);
    }

    const { config } = usePrepareRafflePoolDepositEth({
        value: debouncedValue ? parseEther(debouncedValue) : BigInt(0),
        enabled: Boolean(debouncedValue),
    })

    const { write, data, error, isLoading, isError, reset } =
        useRafflePoolDepositEth(config)

    const {
        data: receipt,
        isLoading: isPending,
        isSuccess,
    } = useWaitForTransaction({ hash: data?.hash })

    // set up transaction state
    const [tempState, setTempState] = useState<string | null>(null)
    // watch for changes in `isSuccess` and `isError` to set the tempState
    useEffect(() => {
        let timeoutId: NodeJS.Timeout
        if (isSuccess || isError) {
            setTempState('Success!')
            timeoutId = setTimeout(() => { reset() }, 5000) // 5 seconds
        }
        return () => clearTimeout(timeoutId)
    }, [isSuccess, isError])


    let buttonTitle = 'Send'
    let buttonStyles = 'bg-gradient-to-tl from-violet-500 to-violet-600 text-white tracking-wide'
    if (isLoading) {
        buttonTitle = 'Check wallet...'
        buttonStyles = 'bg-gradient-to-r from-pink-500 via-violet-500 to-yellow-500 text-white background-animate'
    } else if (isPending) {
        buttonTitle = 'Pending...'
        buttonStyles = 'bg-gradient-to-r from-pink-500 via-violet-500 to-yellow-500 text-white background-animate'
    } else if (isSuccess) {
        buttonTitle = 'Success!'
        buttonStyles = 'bg-gradient-to-tl from-violet-500 to-violet-600text-white '
    }
    const getButtonTitle = () => {
        if (tempState) return tempState;
        if (isLoading) {
            return 'Check wallet...'
        } else if (isPending) {
            return 'Pending...'
        } else if (isSuccess) {
            return 'Success!'
        } else if (isError) {
            return 'Error! Retry'
        } else {
            return 'Send'
        }
    }

    return (
        <>
            <form className='w-full'
            >
                {/* Deposit ETH:{' '} */}
                <ValidateInput
                    onChange={handleInputChange}
                    placeholder="ETH amount"
                    value={value}
                />
                <CustomButton
                    title={getButtonTitle()}
                    containerStyles={`w-full rounded-xl mt-2 ${buttonStyles}`}
                    handleClick={(e) => {
                        e.preventDefault()     // stops page refresh
                        write?.()
                    }}
                    disabled={!(write && isValid) || isLoading || isPending}
                />
            </form>

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


const MemoisedDepositEth = memo(DepositEth);
