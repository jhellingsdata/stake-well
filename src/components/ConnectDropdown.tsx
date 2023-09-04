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
    const [isHovered, setIsHovered] = useState(false);  // for changing text on hover

    const { chain } = useNetwork();
    const { chains, error: switchNetworkError, isLoading: isSwitchNetworkLoading, pendingChainId, switchNetwork } = useSwitchNetwork();

    let buttonTitle = isHovered ? 'Disconnect?' : shortenAddress(address || '0x0000...0000')
    let buttonAction = () => disconnect()
    let buttonStyles = 'tracking-wider rounded-3xl bg-[#8c6dfd] text-bold min-w-[165px]'
    // Check if the currently connected chain is supported or not
    const supportedChain = chains.find(x => x.id !== chain?.id);

    console.log(supportedChain)
    if (supportedChain && switchNetwork) {
        buttonTitle = isSwitchNetworkLoading ? 'Check Wallet...' : `Switch to ${supportedChain.name}`;
        buttonAction = () => switchNetwork(supportedChain.id);
        buttonStyles = 'tracking-wide rounded-3xl px-4 bg-red-500 text-normal mr-4 ml-4';
    }



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
                        title={buttonTitle}
                        containerStyles={buttonStyles}
                        handleClick={buttonAction}
                        handleMouseEnter={() => setIsHovered(true)}
                        handleMouseLeave={() => setIsHovered(false)}
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
