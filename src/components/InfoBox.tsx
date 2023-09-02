'use client'

import React from 'react'
import { InfoBoxProps } from '../types';

const InfoBox = ({ title, value, subscript }: InfoBoxProps) => {
    return (
        <div className='flex flex-col items-center w-[120px]'>
            <div className="flex items-baseline"> {/* This wrapper is for value + subscript layout */}
                <h4 className='font-bold text-xl pt-2 px-2 pb-1 -mr-1'>{value}</h4>
                {subscript && <span className='text-sm -mt-1'>{subscript}</span>} {/* Adjust styles as needed */}
            </div>
            <p className='text-sm'>{title}</p>
        </div>
    )
}

export default InfoBox