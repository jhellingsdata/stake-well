'use client'

import { useState, useEffect } from 'react'
import { parseEther, BaseError } from 'viem'
import { type Address, usePrepareSendTransaction, useSendTransaction, useWaitForTransaction } from 'wagmi'
import { useDebounce } from '../hooks/useDebounce'
import { rafflePoolAddress, useRafflePoolDepositStEth, usePrepareRafflePoolDepositStEth, useIerc20PermitApprove, usePrepareIerc20PermitApprove } from '../generated'
import { ValidateInput } from './ValidateInput';

export function DepositApprove() {
    return (
        <div>
            <DepositStEth />
        </div>
    )
}

function DepositStEth() {
    // 1. Token Approval: call `approve` on stETH token contract
    // 2. Token Transfer: Once token is apporved, we can call `depositStEth` on the staking pool contract.

    const [value, setValue] = useState('')
    const [isValid, setIsValid] = useState(false);
    const debouncedValue = useDebounce(value)

    function handleInputChange(newValue: string, newIsValid: boolean) {
        setValue(newValue);
        setIsValid(newIsValid);
    }

    const { config: approveConfig } = usePrepareIerc20PermitApprove({
        args: [rafflePoolAddress[5] as Address, parseEther(value)], // This will approve the staking pool to move the stETH tokens from user's account
        enabled: Boolean(value),
    })

    const { write: approveWrite, data: approveData, error: approveError, isLoading: approveIsLoading, isError: approveIsError } = useIerc20PermitApprove(approveConfig)


    const { config: depositConfig } = usePrepareRafflePoolDepositStEth({
        args: [parseEther(value)],
        enabled: Boolean(value),
    })

    const { write: depositWrite, data: depositData, error: depositError, isLoading: depositIsLoading, isError: depositIsError } = useRafflePoolDepositStEth(depositConfig)

    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        if (approveData) {
            setIsApproved(true);
        }
    }, [approveData]);

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isApproved) {
            await approveWrite?.();
        } else {
            depositWrite?.();
        }
    };

    return (
        <>
            <form onSubmit={handleDeposit}>
                Deposit stETH:{' '}
                <ValidateInput
                    onChange={handleInputChange}
                    placeholder="stETH amount"
                    value={value}
                />
                <button
                    disabled={!((approveWrite && !isApproved) || (isApproved && depositWrite)) || !isValid}
                    type="submit"
                >
                    Send
                </button>
            </form>
        </>
    )
}