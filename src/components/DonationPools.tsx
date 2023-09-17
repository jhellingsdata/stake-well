'use client';

import React, { useState, useEffect } from 'react';
import {
    useDonationFactoryGetDonationPoolsCount,
    useDonationFactoryGetDonationPoolAddress,
} from 'src/generated';

export function DonationPools() {
    const [indexToFetch, setIndexToFetch] = useState<bigint>(0n);
    const [addresses, setAddresses] = useState<string[]>([]); // to store the fetched addresses

    const { data: donationPoolsCount, isSuccess: isGetPoolsCountSuccess } =
        useDonationFactoryGetDonationPoolsCount({
            watch: true,
        });

    const {
        data: donationPoolAddress,
        isSuccess,
        refetch,
    } = useDonationFactoryGetDonationPoolAddress({
        args: [indexToFetch],
        enabled: false,
    });

    useEffect(() => {
        if (isGetPoolsCountSuccess && donationPoolsCount) {
            if (indexToFetch < donationPoolsCount) {
                refetch().then(() => {
                    if (donationPoolAddress) {
                        setAddresses((prevAddresses) => [
                            ...prevAddresses,
                            donationPoolAddress,
                        ]);
                        setIndexToFetch((prevIndex) => prevIndex + 1n);
                    }
                });
            }
        }
    }, [
        isGetPoolsCountSuccess,
        donationPoolsCount,
        indexToFetch,
        donationPoolAddress,
        refetch,
    ]);

    return (
        <div className="raffle-card mx-auto mt-20 w-[400px] flex-initial flex-col gap-[30px] px-5">
            {addresses.length > 0 ? (
                addresses.map((address) => <div key={address}>{address}</div>)
            ) : (
                <div>
                    <p>No donation pools yet!</p>
                </div>
            )}
        </div>
    );
}

export default DonationPools;
