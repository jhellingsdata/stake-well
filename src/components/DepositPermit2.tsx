import React, { useState } from 'react';
import {
    type Address,
    useAccount,
    useContractRead,
    useSignTypedData,
} from 'wagmi';
import { parseEther } from 'viem';
import { ADDRESS } from '../address';
import { ierc20PermitABI, rafflePoolAddress } from '../generated';
import CustomButton from './CustomButton';
import { ValidateInput } from './ValidateInput';

function generateEIP712Message(
    address: Address,
    value: string,
    nonce: bigint,
    deadline: number,
) {
    // Define the EIP-712 type definitions.
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

    // Define the primary type which is the main type we're signing.
    const primaryType = 'Permit';

    // Define the EIP-712 domain data.
    const domain = {
        name: 'Liquid staked Ether 2.0',
        version: '2',
        chainId: 5,
        verifyingContract: ADDRESS[5].STETH as Address,
    } as const;

    // Define the message to sign.
    const message = {
        owner: address as Address,
        spender: rafflePoolAddress[5] as Address,
        value: parseEther(value),
        nonce: nonce,
        deadline: deadline,
    } as const;

    // Return the structured data.
    return {
        types,
        domain,
        primaryType,
        message,
    };
}

const DepositPermit = () => {
    const { address } = useAccount();
    const [value, setValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [signature, setSignature] = useState<string | null>(null);
    const [interactionStatus, setInteractionStatus] = useState('pending');
    const [amount, setAmount] = useState<string>('');
    // const [nonce, setNonce] = useState<BigInt | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [transactionState, setTransactionState] = useState<
        'idle' | 'pending' | 'success' | 'failed'
    >('idle');
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

    const {
        data: sig,
        error: sigError,
        isLoading,
        isSuccess, // This is true when the signature is generated
        signTypedData,
    } = useSignTypedData({
        domain: {
            name: 'Liquid staked Ether 2.0',
            version: '2',
            chainId: 5,
            verifyingContract: ADDRESS[5].STETH as Address,
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
        },
    });

    // Callback to handle deposit button click
    const handleDeposit = async () => {
        const deadline = Math.floor(Date.now() / 1000) + 3600; // Valid for one hour
        setDeadline(BigInt(deadline));
        signTypedData();
    };

    // ToDo: now permit sign is working correctly, need to implement deposit function
    // So after user signs, we change the button to "Deposit" and call the deposit function

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
                {/* Render `Sign` button if user hasn't yet signed permit message, so idle or pending */}
                {interactionStatus !== 'signed' && (
                    <CustomButton
                        title={'Deposit'}
                        containerStyles={`w-full rounded-xl mt-2`}
                        handleClick={(e) => {
                            e.preventDefault(); // stops page refresh
                            handleDeposit();
                        }}
                        disabled={!isValid}
                    />
                )}
                {/* Render deposit button if user has signed permit message */}
                {interactionStatus === 'signed' && (
                    <CustomButton
                        title={'Deposit'}
                        containerStyles={`w-full rounded-xl mt-2`}
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
