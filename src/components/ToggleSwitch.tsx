import React, { useState } from 'react';

type DepositOption = 'ETH' | 'stETH';

type DualOptionToggleProps = {
    initialOption?: DepositOption;
    onOptionChange?: (selectedOption: DepositOption) => void;
};

const DualOptionToggle: React.FC<DualOptionToggleProps> = ({
    initialOption = 'ETH',
    onOptionChange,
}) => {
    const [option, setOption] = useState<DepositOption>(initialOption);

    const handleOptionChange = (selectedOption: DepositOption) => {
        setOption(selectedOption);
        if (onOptionChange) {
            onOptionChange(selectedOption);
        }
    };

    return (
        <div>
            <div className="pl-0">Deposit Token</div>
            <div className="relative inline-flex items-center cursor-pointer w-40 h-10">
                <div
                    className={`absolute left-0 top-0 h-10 w-20 rounded-l-full flex items-center justify-center ${
                        option === 'ETH'
                            ? 'bg-gray-300 text-gray-300'
                            : 'bg-gray-300 text-gray-500'
                    }`}
                    onClick={() => handleOptionChange('ETH')}
                >
                    ETH
                </div>
                <div
                    className={`absolute right-0 top-0 h-10 w-20 rounded-r-full flex items-center justify-center ${
                        option === 'stETH'
                            ? 'bg-gray-300 text-gray-300'
                            : 'bg-gray-300 text-gray-500'
                    }`}
                    onClick={() => handleOptionChange('stETH')}
                >
                    stETH
                </div>
                <div
                    className={`absolute left-0 top-0 h-10 w-20 bg-violet-500 text-gray-50 tracking-wide font-semibold rounded-full flex items-center justify-center shadow transition-transform duration-300 ${
                        option === 'stETH' ? 'transform translate-x-full' : ''
                    }`}
                >
                    {option}
                </div>
            </div>
        </div>
    );
};

export { DualOptionToggle };
