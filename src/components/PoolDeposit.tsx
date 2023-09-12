'use client';

import React, { useState, useEffect } from 'react';

import { FiInfo } from 'react-icons/fi';
import { InfoIconProps } from '../types';
import { Connected } from '@/components/Connected';
import { DualOptionToggle } from '@/components/ToggleSwitch';
import { useAccountBalance, useAccountTokenBalance } from '../hooks/useBalance';
import { formatBalance } from 'src/utils/formatBalanceDecimals';
import { Deposit } from './Deposit';
import { DepositPermit } from './DepositPermit';
import { DepositPermit2 } from './DepositPermit2';

export function PoolDeposit() {
    const [ethWalletBalance, setEthWalletBalance] = useState(0);
    const [stEthWalletBalance, setStEthWalletBalance] = useState(0);

    const {
        ethBalance = 'Loading...',
        ethSymbol = 'ETH',
        refetchEthBalance,
    } = useAccountBalance();
    const {
        stEthBalance = 'Loading...',
        stEthSymbol = 'stETH',
        refetchStEthBalance,
    } = useAccountTokenBalance();

    let decimals = 4;
    const [depositEth, setDepositEth] = useState(0);
    const [depositStEth, setDepositStEth] = useState(0);

    const handleOptionChange = (selectedOption: string) => {
        if (selectedOption === 'ETH') {
            setDepositEth(1);
            setDepositStEth(0);
        } else if (selectedOption === 'stETH') {
            setDepositEth(0);
            setDepositStEth(1);
        }
    };

    return (
        <>
            <div className="raffle-card flex-intial mx-auto mt-10 w-[400px] flex-col gap-[30px] px-6">
                <Connected>
                    <div className="flex w-full items-center justify-between">
                        {' '}
                        {/* This will center align the contents */}
                        <DualOptionToggle onOptionChange={handleOptionChange} />
                        <div className="text-sm">
                            <div className="font-semibold">Wallet:</div>
                            <div>
                                {parseFloat(ethBalance).toFixed(decimals) ??
                                    'Loading...'}{' '}
                                {ethSymbol ?? 'ETH'}
                            </div>
                            <div>
                                {parseFloat(stEthBalance).toFixed(decimals) ??
                                    'Loading...'}{' '}
                                {stEthSymbol ?? 'stETH'}
                            </div>
                        </div>
                    </div>
                    {depositEth === 1 && <Deposit />}
                    {/* {depositStEth === 1 && <DepositPermit />} */}
                    {depositStEth === 1 && <DepositPermit2 />}
                </Connected>
            </div>
        </>
    );
}

const InfoIcon: React.FC<InfoIconProps> = ({ icon }) => (
    <div className="info-icon">{icon}</div>
);

export default PoolDeposit;
