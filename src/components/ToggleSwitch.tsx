import React, { useState } from 'react';

const ToggleSwitch = ({ checked: initialChecked = false, onChange, label = "Toggle me" }) => {
    const [checked, setChecked] = useState(initialChecked);

    const handleChange = (e: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
        setChecked(e.target.checked);
        if (onChange) {
            onChange(e.target.checked);
        }
    };

    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={handleChange}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            {label && <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{label}</span>}
        </label>
    );
};

const DualOptionToggle = ({ initialOption = 'ETH', onOptionChange }) => {
    const [option, setOption] = useState(initialOption);

    const handleOptionChange = (selectedOption: React.SetStateAction<string>) => {
        setOption(selectedOption);
        if (onOptionChange) {
            onOptionChange(selectedOption);
        }
    };

    return (
        <div>
            <div>Select Deposit: </div>
            <div className="relative inline-flex items-center cursor-pointer w-40 h-10">
                <div
                    className={`absolute left-0 top-0 h-10 w-20 rounded-l-full flex items-center justify-center ${option === 'ETH' ? 'bg-gray-300 text-gray-300' : 'bg-gray-300 text-gray-500'}`}
                    onClick={() => handleOptionChange('ETH')}
                >
                    ETH
                </div>
                <div
                    className={`absolute right-0 top-0 h-10 w-20 rounded-r-full flex items-center justify-center ${option === 'stETH' ? 'bg-gray-300 text-gray-300' : 'bg-gray-300 text-gray-500'}`}
                    onClick={() => handleOptionChange('stETH')}
                >
                    stETH
                </div>
                <div
                    className={`absolute left-0 top-0 h-10 w-20 bg-violet-500 text-gray-50 tracking-wide font-semibold rounded-full flex items-center justify-center shadow transition-transform duration-300 ${option === 'stETH' ? 'transform translate-x-full' : ''}`}
                >
                    {option}
                </div>
            </div>
        </div >
    );
};

export { ToggleSwitch, DualOptionToggle };
