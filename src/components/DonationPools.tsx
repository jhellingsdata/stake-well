'use client';

import React, { useState } from 'react';
import {
    useDonationFactoryGetDonationPoolsCount,
    useDonationFactoryGetDonationPoolAddress,
} from 'src/generated';

export function DonationPools() {
    // fetch array of DonationPools from DonationFactory
    // 1. get number of donation pools
    // 2. loop through the number of donation pools, and get the address of each donation pool using the index
    // 3. store the addresses in an array
    // 4. loop through the array of addresses, and for each address, get the donation pool details
    // set state as bigint of donationPoolsCount
    const [indexToFetch, setIndexToFetch] = useState<bigint>(0n);

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

    // set up function to call after donationPoolsCount is fetched
    // this should loop through the number of donation pools, and get the address of each donation pool using the index
    if (isGetPoolsCountSuccess) {
        if (donationPoolsCount) {
            for (let i = 0; i < donationPoolsCount; i++) {
                // set big int of index with `setIndexToFetch(i)`
                // call refetch()
                // store received address in an array
                setIndexToFetch(BigInt(i));
                refetch();
            }
        }
    }

    return (
        <div className="raffle-card mx-auto mt-20 w-[400px] flex-initial flex-col gap-[30px] px-5">
            {isGetPoolsCountSuccess ? (
                <div>{donationPoolAddress}</div>
            ) : (
                <div>
                    <p>No donation pools yet!</p>
                </div>
            )}
        </div>
    );
}

export default DonationPools;
