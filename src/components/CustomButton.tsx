'use client';

import { CustomButtonProps } from '../types';
// Note: by default, all components in Next.js are serverside rendered.
// This button will be a client-side rendered component 
// (usually the case when there are browser-side actions such as clicks or using hooks). 

const CustomButton = ({ title, disabled, containerStyles, handleClick, handleMouseEnter, handleMouseLeave }: CustomButtonProps) => {
    return (
        <button
            disabled={disabled}
            type={"button"}
            className={`custom-btn ${containerStyles}`}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <span className={`flex-1`}>
                {title}
            </span>
        </button>
    )
}

export default CustomButton