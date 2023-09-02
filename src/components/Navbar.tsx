"use client";
import Link from 'next/link';
import Image from 'next/image';
import CustomButton from './CustomButton';
import { Connect } from './Connect';
import { ConnectDropdown } from './ConnectDropdown';
import { BsGithub } from 'react-icons/bs';
import { NavbarIconProps } from '../types';
import { NetworkSwitcher } from './NetworkSwitcher';

// import address

const Navbar = () => {
    // const address = '0xabc' // replace with address from wallet connection
    return (
        // create navigation bar with logo (for home) and connect wallet button.
        // 'Connect' button should use Ethers JS version 6 to connect to metamask wallet on Goerli testnet chain.
        // <header className="w-full absolute z-10">
        //     <nav className="max-w-[1440px] mx-auto flex justify-between items-center sm:px-16 px-6 py-4">
        //         {/* <div className="bg-[#F6F6F6] rounded-lg px-4 py-2 text-sm font-medium">
        //             <CustomButton
        //                 title={address ? 'Connected' : 'Connect Wallet'}
        //                 containerStyles={address ? 'bg-[#1dc071]' : 'bg-[#8c6dfd]'}
        //                 handleClick={() => {
        //                     if (!address) {
        //                         <ConnectWallet />;
        //                     }
        //                 }}
        //             />

        //         </div> */}
        //         <Connect />
        //     </nav>
        // </header>
        <header className='absolute top-0 w-screen h-16 m-0 mb-[45px] flex flex-row px-12 bg-gray-700 text-white shadow-lg'>
            <nav className="w-full max-w-[1440px] mx-auto flex justify-between items-center">
                <div className="flex">
                    <Link href="/" className="navbar-items font-bold">
                        Nolo
                    </Link>
                    <Link href="/raffle" className="navbar-items">
                        Raffle
                    </Link>
                    <Link href="/donate" className="navbar-items">
                        Donate
                    </Link>
                    <Link href="/docs" className="navbar-items mx-4">
                        Docs
                    </Link>
                    <Link href="https://github.com/jhellingsdata/dapp-main">
                        <NavbarIcon icon={<BsGithub size="28" />} />
                    </Link>

                </div>

                <div className="flex mx-4 items-center">
                    <ConnectDropdown />
                    {/* <Connect /> */}
                </div>
            </nav>
        </header>
    )
}

const NavbarIcon: React.FC<NavbarIconProps> = ({ icon }) => (
    <div className="navbar-icon">
        {icon}
    </div>
)


export default Navbar