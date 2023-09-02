'use client';

import { useState, useEffect } from 'react';
import { BaseError } from 'viem';
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import shortenAddress from '../utils/shortenAddress';
import CustomButton from './CustomButton';

export function ConnectDropdown() {
    const { address, connector, isConnected } = useAccount();
    const { connect, connectors, error, isLoading, pendingConnector, reset } = useConnect();
    const { disconnect } = useDisconnect();

    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const [showError, setShowError] = useState(false);

    // Effect to listen to error changes
    useEffect(() => {
        if (error) {
            setShowError(true);
            const timer = setTimeout(() => {
                setShowError(false);
                reset();
            }, 6000); // Dismiss after 6 seconds

            return () => clearTimeout(timer); // Cleanup on unmount
        }
    }, [error]);

    return (
        <div
            onMouseEnter={() => setDropdownOpen(true)}
            // onMouseLeave={() => setDropdownOpen(false)}
            className="relative"
        >
            <div>
                {isConnected ? (
                    <CustomButton
                        title={shortenAddress(address || '0x0000...0000')}
                        containerStyles='tracking-wider rounded-3xl bg-[#8c6dfd] text-bold'
                        handleClick={() => disconnect()}
                    />
                ) : (
                    <>
                        <CustomButton
                            title={(() =>
                            // isLoading ? 'Connecting...' : 'Connect'
                            {
                                if (isDropdownOpen) {
                                    return 'Select...'
                                } else if (isLoading) {
                                    return 'Connecting...'
                                } else {
                                    return 'Connect'
                                }
                            })()
                            }
                            containerStyles='tracking-wider min-w-64 rounded-3xl bg-violet-500 hover:bg-violet-600 active:bg-violet-700 active:outline-none active:ring-violet-300'
                            handleClick={() => setDropdownOpen(!isDropdownOpen)}
                        />
                        {isDropdownOpen && (
                            <div className="dropdown-menu" onMouseLeave={() => setDropdownOpen(false)}>

                                {connectors
                                    .filter((x) => x.ready && x.id !== connector?.id)
                                    .map((x) => (
                                        <button className='flex w-full tracking-wider justify-between items-start p-1 hover:bg-[#b7a5fc7b] hover:font-semibold cursor-pointer rounded-r-lg border-l-transparent hover:border-l-white border-l-4' key={x.id} onClick={() => { connect({ connector: x }), setDropdownOpen(!isDropdownOpen) }}>

                                            {x.name === 'Coinbase Wallet' ? ('Coinbase') : (x.name)}
                                            {/* {isLoading && x.id === pendingConnector?.id && ' (connecting)'} */}
                                        </button>
                                    ))}
                            </div>
                        )}
                    </>
                )}

                {error && <div className={`fixed right-0 top-1/4 transform transition-transform ${showError ? 'translate-x-0 ease-in-out duration-500' : 'translate-x-full'} bg-red-500 text-white p-4 rounded-l-lg shadow-lg`} >
                    {/* Before reading `shortMessage` of error object, check if `error` is not null or undefined */}
                    {(error as BaseError).shortMessage || 'An error occurred'}
                </div>}

            </div>
        </div>
    )
}
