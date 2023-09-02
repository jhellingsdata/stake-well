'use client';

import { CustomButtonProps } from '../types';
import Image from 'next/image';

// Note: by default, all components in Next.js are serverside rendered.
// This button will be a client-side rendered component 
// (usually the case when there are browser-side actions such as clicks or using hooks). 

const CustomButton = ({ title, containerStyles, handleClick }: CustomButtonProps) => {
    return (
        <button
            disabled={false}
            type={"button"}
            className={`custom-btn ${containerStyles}`}
            onClick={handleClick}
        >
            <span className={`flex-1`}>
                {title}
            </span>
        </button>
    )
}

export default CustomButton