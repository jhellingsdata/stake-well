// components/ValidateInput.tsx

import { useState } from 'react';

interface Props {
    value: string;
    onChange: (value: string, isValid: boolean) => void;
    placeholder?: string;
}

export function ValidateInput({ value, onChange, placeholder }: Props) {
    const [isTouched, setIsTouched] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        let newValue = e.target.value;

        // Replace commas with decimal points
        newValue = newValue.replace(/,/g, '.');

        // If the input starts with a decimal, prefix with 0
        if (newValue.startsWith('.')) {
            newValue = '0' + newValue;
        }

        // Remove any non-numeric characters, except for a single decimal point
        newValue = newValue.replace(/[^0-9.]/g, '');

        // If the first character is 0 and the second character isn't a decimal, 
        // add a decimal and continue
        if (newValue.startsWith('0') && newValue.length > 1 && newValue[1] !== '.') {
            newValue = '0.' + newValue.slice(1).replace(/[^0-9]/g, '');
        }

        // Ensure only one decimal point
        const firstDecimalIndex = newValue.indexOf('.');
        if (firstDecimalIndex !== -1) {
            newValue = newValue.substring(0, firstDecimalIndex + 1) +
                newValue.substring(firstDecimalIndex + 1).replace(/\./g, '');
        }

        // Ensure only 10 numbers before the decimal
        const parts = newValue.split('.');
        if (parts[0].length > 10) {
            parts[0] = parts[0].slice(0, 10);
            newValue = parts.join('.');
        }

        // Ensure only 18 numbers after the decimal
        const decimalParts = newValue.split('.');
        if (decimalParts[1] && decimalParts[1].length > 18) {
            newValue = decimalParts[0] + '.' + decimalParts[1].slice(0, 18);
        }

        const isValid = isValidEthValue(newValue);
        setIsTouched(true);
        onChange(newValue, isValid);
    }

    function isValidEthValue(value: string): boolean {
        if (!value) return false;
        const numberValue = parseFloat(value);
        return !isNaN(numberValue) && numberValue >= 0;
    }

    return (
        <div className='w-full'>
            <input
                className='w-full rounded-xl border-2 border-gray-300 p-2'
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                aria-invalid={isTouched && !isValidEthValue(value)}
            />
            {isTouched && !isValidEthValue(value) && <div className='text-red-500'>Please enter a valid ETH amount.</div>}
        </div>
    );
}
