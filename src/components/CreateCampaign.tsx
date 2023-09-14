'use client';

import React, { useState } from 'react';
import { useDonationFactoryCreateDonationPool } from 'src/generated';
import { usePrepareDonationFactoryCreateDonationPool } from 'src/generated';

export function CreateCampaign() {
    const [form, setForm] = useState({
        manager: '',
        beneficiary: '',
        title: '',
    });
    const { isLoading, send: createPool } =
        useDonationFactoryCreateDonationPool();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createPool(form.manager, form.beneficiary, form.title);
            alert('Donation pool created successfully!');
        } catch (error) {
            console.error('Error creating donation pool:', error);
            alert(
                'Error creating donation pool. Please check console for details.',
            );
        }
    };

    return (
        <div>
            <div className="raffle-card flex flex-col pt-36 padding-x">
                <h2>Create Campaign Page</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="manager">Manager Address:</label>
                        <input
                            type="text"
                            id="manager"
                            name="manager"
                            value={form.manager}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="beneficiary">
                            Beneficiary Address:
                        </label>
                        <input
                            type="text"
                            id="beneficiary"
                            name="beneficiary"
                            value={form.beneficiary}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="title">Title:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" disabled={isLoading}>
                        Create Donation Pool
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateCampaign;
