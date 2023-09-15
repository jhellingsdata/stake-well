// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
    type Address,
    useAccount,
    useContractRead,
    useSignTypedData,
} from 'wagmi';
import { hexToSignature, parseEther } from 'viem';
import { ADDRESS } from '../address';
import {
    ierc20PermitABI,
    rafflePoolAddress,
    useRafflePoolDepositStEthWithPermit,
    usePrepareRafflePoolDepositStEthWithPermit,
} from '../generated';
import { useDebounce } from '../hooks/useDebounce';
import CustomButton from './CustomButton';
import { ValidateInput } from './ValidateInput';

const domain = {
    name: 'Liquid staked Ether 2.0',
    version: '2',
    chainId: BigInt(5n),
    verifyingContract: ADDRESS[5].STETH as Address,
} as const;

const types = {
    EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
    ],
    Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
    ],
} as const;

enum ComponentStatus {
    SIGN = 'SIGN',
    DEPOSIT = 'DEPOSIT',
    IDLE = 'IDLE',
}

const DepositPermit = () => {
    const { address } = useAccount();
    const [value, setValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [currentStep, setCurrentStep] = useState(ComponentStatus.SIGN);
    const debouncedValue = useDebounce(value);

    const [r, setSignatureR] = useState<string | null>(null);
    const [s, setSignatureS] = useState<string | null>(null);
    const [v, setSignatureV] = useState<BigInt | null>(null);

    // Fetch user's nonce
    const { data: nonce } = useContractRead({
        address: ADDRESS[5].STETH as Address,
        abi: ierc20PermitABI,
        functionName: 'nonces',
        args: [address as Address],
        enabled: Boolean(address),
        watch: true,
    });

    // Callback to validate value input change
    function handleInputChange(newValue: string, newIsValid: boolean) {
        setValue(newValue);
        setIsValid(newIsValid);
    }

    const {
        data: sig,
        error: sigError,
        isLoading: isSigLoading,
        isSuccess: isSigSuccess,
        signTypedData,
    } = useSignTypedData({
        domain,
        types,
        primaryType: 'Permit',
    });

    // Use a ref to store the deadline value and initialise it as null.
    const deadlineRef = useRef<bigint | null>(null);

    const messageBase = {
        owner: address as Address,
        spender: rafflePoolAddress[5] as Address,
        value: parseEther(value),
        nonce: nonce!,
    };

    const handleSign = async () => {
        // Only set the deadline if it hasn't been set yet.
        if (deadlineRef.current === null) {
            const deadlineTime = Math.floor(Date.now() / 1000) + 1800; // 30 minutes
            deadlineRef.current = BigInt(deadlineTime);
        }
        // Combine the base message with the deadline
        const fullMessage = {
            ...messageBase,
            deadline: deadlineRef.current,
        };
        // Update the message's deadline and then trigger the signing
        signTypedData({
            domain,
            types,
            message: fullMessage,
            primaryType: 'Permit',
        });
        // After signing, deconstruct the signature if it exists and isn't an error.
        if (sig && !sigError) {
            const { r, s, v } = hexToSignature(sig);
            // Set the state values
            setSignatureR(r);
            setSignatureS(s);
            setSignatureV(v);

            setCurrentStep(ComponentStatus.DEPOSIT);
        }
    };

    ////////////////// Raffle Pool Deposit ///////////////////////

    const { config } = usePrepareRafflePoolDepositStEthWithPermit({
        // value: debouncedValue ? parseEther(debouncedValue) : BigInt(0),
        args: [
            debouncedValue ? parseEther(debouncedValue) : BigInt(0),
            deadlineRef.current!,
            v,
            r,
            s,
        ],
        enabled: Boolean(sig),
    });

    const {
        write,
        data: depositData,
        error: depositError,
        isError: isDepositError,
        isLoading: isDepositLoading,
        isSuccess: isDepositSuccess,
    } = useRafflePoolDepositStEthWithPermit(config);

    /////////////////////////////////////////////////////

    const handleDeposit = async () => {
        // add our deposit logic here.
        write?.();
        // if deposit is successful, reset the form and reset the signature
        if (isDepositSuccess) {
            setValue('');
            setSignatureR(null);
            setSignatureS(null);
            setSignatureV(null);
            setCurrentStep(ComponentStatus.SIGN);
        }
    };

    let buttonStyles =
        'bg-gradient-to-tl from-violet-500 to-violet-600 text-white tracking-wide';

    return (
        <>
            <form className="w-full">
                <ValidateInput
                    onChange={handleInputChange}
                    placeholder="stETH amount"
                    value={value}
                />
                {/* 
                {deadlineRef.current && (
                    <p className="text-sm mt-2">
                        Message valid until:{' '}
                        {new Date(
                            Number(deadlineRef.current) * 1000,
                        ).toLocaleString()}
                    </p>
                )} */}

                {currentStep === ComponentStatus.SIGN && (
                    <CustomButton
                        title={'Sign'}
                        containerStyles={`w-full rounded-xl mt-2 ${buttonStyles}`}
                        handleClick={(e) => {
                            e.preventDefault(); // stops page refresh
                            handleSign();
                        }}
                        disabled={!isValid}
                    />
                )}

                {currentStep === ComponentStatus.DEPOSIT &&
                    sig &&
                    !sigError && (
                        <CustomButton
                            title={'Deposit'}
                            containerStyles={`w-full rounded-xl mt-2 ${buttonStyles}`}
                            handleClick={(e) => {
                                e.preventDefault(); // stops page refresh
                                handleDeposit();
                            }}
                            disabled={!isValid}
                        />
                    )}
            </form>
        </>
    );
};

export const DepositStEthPermit = () => {
    return <DepositPermit />;
};
