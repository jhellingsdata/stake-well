'use client';

import React, { useState } from 'react';
import { useDonationFactoryCreateDonationPool } from 'src/generated';
import { usePrepareDonationFactoryCreateDonationPool } from 'src/generated';
import CustomButton from './CustomButton';
import { type Address } from 'wagmi';
import { isAddress } from 'viem';

// expecting specific formats for the addresses (manager and beneficiary), so can use template literal types
type FormState = {
    manager: `0x${string}` | '';
    beneficiary: `0x${string}` | '';
    title: string;
};

export function CreateCampaign() {
    const [form, setForm] = useState<FormState>({
        manager: '',
        beneficiary: '',
        title: '',
    });

    const { config } = usePrepareDonationFactoryCreateDonationPool({
        args: [
            form.manager as `0x${string}`,
            form.beneficiary as `0x${string}`,
            form.title,
        ],
        enabled: Boolean(form.manager && form.beneficiary && form.title),
    });

    const { write, data, isError, isLoading, isSuccess } =
        useDonationFactoryCreateDonationPool(config);

    // const handleChange = (e: { target: { name: any; value: any } }) => {
    //     const { name, value } = e.target;
    //     setForm((prev) => ({ ...prev, [name]: value }));
    // };

    const [isAddressValid, setIsAddressValid] = useState({
        manager: false,
        beneficiary: false,
    });

    const handleChange = (e: { target: { name: any; value: any } }) => {
        const { name, value } = e.target;

        // Always update the state with the new value
        setForm((prev) => ({ ...prev, [name]: value }));
        // If it's an address field, validate it
        if (name === 'manager' || name === 'beneficiary') {
            if (isAddress(value) || value === '') {
                setIsAddressValid((prev) => ({ ...prev, [name]: true }));
            } else {
                setIsAddressValid((prev) => ({ ...prev, [name]: false }));
            }
        }
    };

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        write?.();
        if (isSuccess) {
            alert('Donation pool created successfully!');
        }
    };

    return (
        <div>
            <div className="raffle-card mx-auto mt-20 w-[400px] flex-initial flex-col gap-[30px] px-5">
                <h2 className="text-gray-500 text-lg font-bold text-opacity-60">
                    Deploy Donation Pool
                </h2>
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="md:flex md:items-center mb-4">
                        <div className="mb-2 w-full">
                            <label
                                className="block text-gray-500 font-bold mb-2"
                                htmlFor="title"
                            >
                                Set campaign title
                            </label>
                            <input
                                className="bg-gray-50 py-2 px-3 text-gray-700 leading-tight rounded border appearance-none shadow w-full focus:outline-none focus:shadow-outline"
                                type="text"
                                id="title"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="md:flex md:items-center mb-4">
                        <div className="mb-2 w-full">
                            <label
                                className="block text-gray-500 font-bold mb-2"
                                htmlFor="manager"
                            >
                                Manager Address
                            </label>
                            <input
                                className="bg-gray-50 py-2 px-2 tracking-tight text-sm text-gray-700 leading-tight rounded border appearance-none shadow w-full focus:outline-none focus:shadow-outline"
                                type="text"
                                id="manager"
                                name="manager"
                                value={form.manager}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="md:flex md:items-center mb-6">
                        <div className="mb-4 w-full">
                            <label
                                className="block text-gray-500 font-bold mb-2"
                                htmlFor="beneficiary"
                            >
                                Beneficiary Address
                            </label>
                            <input
                                className="bg-gray-50 py-2 px-2 text-gray-700 text-sm tracking-tight leading-tight rounded border appearance-none shadow w-full focus:outline-none focus:shadow-outline"
                                type="text"
                                id="beneficiary"
                                name="beneficiary"
                                value={form.beneficiary}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <CustomButton
                        title="Create Campaign"
                        containerStyles="w-full rounded-xl mt-2 bg-gradient-to-tl from-violet-500 to-violet-600 text-white tracking-wide"
                        handleClick={handleSubmit}
                        disabled={
                            !isAddressValid.manager ||
                            !isAddressValid.beneficiary ||
                            !form.title
                        }
                    />
                </form>
            </div>
        </div>
    );
}

export default CreateCampaign;
