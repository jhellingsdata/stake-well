import React, { useState } from 'react';
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

const DepositPermit = () => {
    const { address } = useAccount();
    const [value, setValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [signature, setSignature] = useState<string | null>(null);
    const [interactionStatus, setInteractionStatus] = useState('pending');
    const debouncedValue = useDebounce(value);
    // const [nonce, setNonce] = useState<BigInt | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [deadline, setDeadline] = useState(BigInt(0));

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
    // onSuccess, deconstruct signature data into v, r, s
    let v: bigint | undefined;
    let r: string | undefined;
    let s: string | undefined;
    const {
        data: sig,
        error: sigError,
        isLoading: isSigLoading,
        isSuccess: isSigSuccess, // This is true when the signature is generated
        signTypedData,
    } = useSignTypedData({
        domain: {
            name: 'Liquid staked Ether 2.0',
            version: '2',
            chainId: 5,
            verifyingContract: ADDRESS[5].STETH,
        },
        message: {
            owner: address as Address,
            spender: rafflePoolAddress[5] as Address,
            value: parseEther(value),
            nonce: nonce!,
            deadline: deadline,
        },
        primaryType: 'Permit',
        types: {
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
        },
        onSuccess(data) {
            console.log('Success: ', data);
            setSignature(data);
            setInteractionStatus('signed');
            ({ v, r, s } = hexToSignature(data));
        },
    });

    ////////////////// Raffle Pool Deposit ///////////////////////

    const { config } = usePrepareRafflePoolDepositStEthWithPermit({
        // value: debouncedValue ? parseEther(debouncedValue) : BigInt(0),
        args: [
            debouncedValue ? parseEther(debouncedValue) : BigInt(0),
            deadline,
            v,
            r,
            s,
        ],
        enabled: Boolean(signature),
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

    // Callback to handle deposit button click
    const handleSign = async () => {
        const deadline = Math.floor(Date.now() / 1000) + 3600; // Valid for one hour
        setDeadline(BigInt(deadline));
        signTypedData();
    };
    const handleDeposit = async () => {
        let v, r, s;
        if (sig) {
            ({ v, r, s } = hexToSignature(sig));
            console.log('v: ', v);
            console.log('r: ', r);
            console.log('s: ', s);
        }
        write?.();
        // if deposit is successful, reset the form and reset the signature
        if (isDepositSuccess) {
            setValue('');
            setSignature(null);
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
                {/* <button
                    disabled={!isValid || interactionStatus === 'done'}
                    onClick={buttonAction}
                >
                    {buttonText}
                </button> */}
                {/* Render `Sign` button if user hasn't yet signed permit message or if user has successfully deposited. */}
                {isDepositSuccess ||
                    (!isSigSuccess && (
                        <CustomButton
                            title={'Deposit'}
                            containerStyles={`w-full rounded-xl mt-2 ${buttonStyles}`}
                            handleClick={(e) => {
                                e.preventDefault(); // stops page refresh
                                handleSign();
                            }}
                            disabled={!isValid}
                        />
                    ))}
                {/* Render deposit button if user has signed permit message */}
                {isSigSuccess && (
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

export const DepositPermit2 = () => {
    return <DepositPermit />;
};
