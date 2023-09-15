'use client';

import React, { useState, useEffect } from 'react';
import { formatEther } from 'viem';
import CustomButton from './CustomButton';
import InfoBox from './InfoBox';
import barPercentage from '../utils/barPercentage';
import usePoolRaffleRewards from '../hooks/usePoolRaffleRewards';
import usePoolUserCount from '../hooks/usePoolUserCount';
import usePoolTotalUserDeposits from '../hooks/usePoolTotalUserDeposits';
import { formatBalance, formatDecimals } from '../utils/formatBalanceDecimals';
import { FiInfo } from 'react-icons/fi';
import { InfoIconProps } from '../types';
import { ConnectDropdown } from '@/components/ConnectDropdown';
import { Connected } from '@/components/Connected';
import { PoolDeposit } from '@/components/PoolDeposit';
import { useRafflePoolGetLastTimestamp } from 'src/generated';
import { timeRemaining, convertSecondsToTime } from '../utils/timeRemaining';

export function RaffleDetails() {
    const [isLoading, setIsLoading] = useState({});
    const {
        rewardsBalance,
        isLoading: isRaffleRewardsLoading,
        isSuccess: isRaffleRewardsSuccess,
    } = usePoolRaffleRewards(7);
    const { userCount, isUserCountLoading } = usePoolUserCount();
    const {
        totalUserDeposits,
        isTotalUserDepositsLoading,
        isTotalUserDepositsSuccess,
    } = usePoolTotalUserDeposits();
    const { data: lastTimestamp, isLoading: isLastTimestampLoading } =
        useRafflePoolGetLastTimestamp();

    // set up a state for the remaining time
    const [remainingTime, setRemainingTime] = useState(0);

    let raffleInterval = 604800; // 7 days in seconds
    // we will pass the lastTimestamp to the timeRemaining util function, which will return the raffle time remaining in seconds
    // then, we should format this into days, hours, minutes, seconds

    let timeRemainingInSeconds = timeRemaining(
        Number(lastTimestamp),
        raffleInterval,
        false,
    ) as number;
    // let displayTimeRemaining
    // let timeRemainingInSeconds
    // if (lastTimestamp) {
    //     timeRemainingInSeconds = timeRemaining(Number(lastTimestamp), raffleInterval, false)
    //     setRemainingTime(timeRemainingInSeconds)
    //     displayTimeRemaining = timeRemaining(Number(lastTimestamp), raffleInterval, true).toString()
    // }
    useEffect(() => {
        const countdown = setInterval(() => {
            setRemainingTime((prevTime) => prevTime - 1);
        }, 1000);

        // Clean up the interval once the component is unmounted
        return () => clearInterval(countdown);
    }, []);

    const { days, hours, minutes, seconds } = convertSecondsToTime(
        timeRemainingInSeconds,
    );
    const countdownString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    return (
        <div>
            <div className="raffle-card mx-auto mt-20 w-[400px] flex-initial flex-col gap-[30px] px-6">
                <div className="w-full text-left">
                    {' '}
                    {/* This will center align the contents */}
                    <div className="mb-2 flex w-full items-center justify-between">
                        <h3 className="text-l">Jackpot Raffle</h3>
                        <InfoIcon icon={<FiInfo size="18" />} />
                    </div>
                    <p className="text-4xl font-bold">
                        {' '}
                        {/* Enhanced styles for emphasis */}
                        {isRaffleRewardsLoading
                            ? 'Loading...'
                            : rewardsBalance
                            ? rewardsBalance
                            : 0}
                        <sub className="text-[12px] font-normal">stETH</sub>
                    </p>
                </div>
                <div className="flex-1 flex-col">
                    <div className="relative mb-4 mt-4 h-[10px] w-full rounded-md bg-gray-300">
                        <div
                            className="absolute h-full rounded-l-md bg-violet-500"
                            style={{
                                width: `${barPercentage(
                                    Number(lastTimestamp),
                                    604800,
                                )}%`,
                                maxWidth: '100%',
                            }}
                        ></div>
                    </div>
                    <div className="flex w-full justify-between">
                        <div className="flex w-[120px] space-x-[1px]">
                            <InfoBox
                                title="d"
                                value={`${days}`}
                                containerStyles="w-1/4"
                            />
                            <InfoBox
                                title="h"
                                value={`${hours}`}
                                containerStyles="w-1/4"
                            />
                            <InfoBox
                                title="m"
                                value={`${minutes}`}
                                containerStyles="w-1/4"
                            />
                            <InfoBox
                                title="s"
                                value={`${seconds}`}
                                containerStyles="w-1/4"
                            />
                        </div>
                        {/* <InfoBox title='Remaining' value={countdownString} /> */}
                        <InfoBox
                            title="Pool Balance"
                            value={
                                totalUserDeposits
                                    ? formatDecimals(totalUserDeposits, 3)
                                    : '0'
                            }
                            subscript="stETH"
                        />
                        <InfoBox title="Players" value={userCount.toString()} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const InfoIcon: React.FC<InfoIconProps> = ({ icon }) => (
    <div className="info-icon">{icon}</div>
);

export default RaffleDetails;
