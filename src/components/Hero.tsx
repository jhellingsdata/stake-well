"use client";

import Image from 'next/image';
import CustomButton from './CustomButton';

const Hero = () => {
    const handleScroll = () => {

    }

    return (
        <div className="hero">
            <div className="flex-1 max-w-[1000px] pt-36 px-16 mx-auto">
                <h1 className="hero__title">
                    A no-loss protocol to expand the use of Ethereum staking rewards.
                </h1>

                <p className="hero__subtitle">
                    Support your favourite projects or win pooled rewards, all without risking your funds.
                </p>

                <CustomButton
                    title="Enter App"
                    containerStyles="bg-primary-blue text-white rounded-full mt-10"
                    handleClick={handleScroll}
                />
            </div>
        </div>
    )
}

export default Hero;