'use client'

import React from 'react'
import { InfoBoxProps } from '../types';

const InfoBox = ({ title, value, subscript, containerStyles }: InfoBoxProps) => {
    return (
        <div className={`flex flex-col items-center ${containerStyles ? containerStyles : 'w-[120px]'}`}>
            <div className="flex items-baseline"> {/* This wrapper is for value + subscript layout */}
                <h4 className='font-semibold text-xl pt-2 px-1 pb-[2px]'>{value}</h4>
                {subscript && <span className='text-[12px] -mt-1'>{subscript}</span>} {/* Adjust styles as needed */}
            </div>
            <p className='text-sm'>{title}</p>
        </div>
    )
}

export default InfoBox