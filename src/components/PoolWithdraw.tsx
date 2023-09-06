'use client'

import React, { useState, useEffect } from 'react'
import { parseEther, BaseError, formatEther } from 'viem'
import { InfoIconProps } from '../types';
import { Connected } from '@/components/Connected'
import { DualOptionToggle } from '@/components/ToggleSwitch'
import { useAccountBalance, useAccountTokenBalance } from '../hooks/useBalance'
import { formatBalance } from 'src/utils/formatBalanceDecimals';
import { Deposit } from './Deposit';
import { DepositPermit } from './DepositPermit';
import { Withdraw } from './Withdraw';
import usePoolUserBalance from '../hooks/usePoolUserBalance'
import { type Address, useAccount, useBalance, usePrepareSendTransaction, useSendTransaction, useWaitForTransaction } from 'wagmi'
import { useRafflePoolGetUserDeposit, useRafflePoolWithdrawStEth, usePrepareRafflePoolWithdrawStEth } from '../generated'
import { useDebounce } from '../hooks/useDebounce';

export function PoolWithdraw() {

    const { address } = useAccount()
    const { data: userWalletBalance, isLoading: isUserWalletBalanceLoading } = useBalance({
        address: address as Address,
        watch: true,
    })
    const { balance } = usePoolUserBalance()

    let decimals = 4
    const [withdrawStEth, setWithdrawStEth] = useState(0)
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

    return (
        <>
            <div className="raffle-card w-[400px] flex-intial flex-col mt-10 mx-auto gap-[30px] px-6">
                <Connected>
                    <div className="flex w-full justify-between items-center"> {/* This will center align the contents */}
                        Withdraw stETH
                        <div className="text-sm">
                            <div className='font-semibold'>Current Balance:</div>
                            <div>
                                {formatEther(balance)}
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <Withdraw />
                    </div>

                </ Connected>
            </div>
        </>
    )
}

const InfoIcon: React.FC<InfoIconProps> = ({ icon }) => (
    <div className="info-icon">
        {icon}
    </div>
)

export default PoolWithdraw