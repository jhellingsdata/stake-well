'use client'

import React, { use, useState, useEffect } from 'react';
import { recoverTypedDataAddress } from 'viem'
import { type Address, useAccount, useContractRead, useSignTypedData, useWaitForTransaction } from 'wagmi';
import { useIerc20PermitNonces, ierc20PermitABI, stakePoolAddress, usePrepareStakePoolDepositStEthWithPermit, useStakePoolDepositStEthWithPermit } from '../generated';
import { useDebounce } from '../hooks/useDebounce';
import { ValidateInput } from './ValidateInput';

import { ADDRESS } from '../address';
import { hexToSignature, parseEther } from 'viem';

interface DepositPermitProps {
    permitDeadline?: number;
}

export const DepositPermit: React.FC<DepositPermitProps> = ({ permitDeadline = -1 }) => {
    return (
        <div>
            <DepositStEthWithPermit permitDeadline={permitDeadline} />
        </div>
    )
}


function generateEIP712Message(value, nonce, types, deadline) {

    const { address } = useAccount()
    const message = {
        owner: address,  // User's address
        spender: stakePoolAddress[5],  // Address of the contract to which the user is permitting
        value: parseEther(value),
        nonce: nonce,
        deadline: deadline,
    } as const
    return message
}

interface DepositStEthWithPermitProps {
    permitDeadline: number;
}

function DepositStEthWithPermit({ permitDeadline }: DepositStEthWithPermitProps) {
    const { address } = useAccount()
    const [value, setValue] = useState('')
    const [isValid, setIsValid] = useState(false)
    const [signature, setSignature] = useState<string | null>(null)

    const debouncedValue = useDebounce(value);

    // const deadline = Math.floor(Date.now() / 1000) + 3600   // Valid for one hour
    const deadline = permitDeadline

    function handleInputChange(newValue: string, newIsValid: boolean) {
        setValue(newValue);
        setIsValid(newIsValid);
    }

    // use Wagmi hook for calling a read method on stETH Contract to get the nonce
    const { data: nonce } = useContractRead({
        address: ADDRESS[5].STETH as Address,
        abi: ierc20PermitABI,
        functionName: 'nonces',
        args: [address as Address],
        enabled: Boolean(address),
        watch: true,
    })

    const { data: domainSeparator } = useContractRead({
        address: ADDRESS[5].STETH as Address,
        abi: ierc20PermitABI,
        functionName: 'DOMAIN_SEPARATOR',
        enabled: Boolean(address),  // This can be always enabled since it doesn't require dynamic arguments.
    })


    const domain = {
        name: "Liquid staked Ether 2.0",
        version: "2",
        chainId: 5,
        verifyingContract: ADDRESS[5].STETH,
        salt: domainSeparator,
    } as const

    const types = {
        EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" }
        ],
        Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" }
        ]
    } as const

    // // Generate EIP712 message
    // const message = {
    //     owner: address,  // User's address
    //     spender: stakePoolAddress[5],  // Address of the contract to which the user is delegating
    //     value: parseEther(value),
    //     nonce: nonce,
    //     deadline: deadline,  // Valid for one hour
    // } as const

    const message = generateEIP712Message(value, nonce, types, deadline)

    console.log(message)

    const { data: sig, error: sigError, isLoading, signTypedData } = useSignTypedData({
        domain,
        message: message,
        primaryType: 'Permit',
        types,
        onSuccess(data) {
            console.log('Success: ', data)
            setSignature(data)
        },
    })

    const [recoveredAddress, setRecoveredAddress] = useState<Address>()
    useEffect(() => {
        if (!sig) return
            ; (async () => {
                setRecoveredAddress(
                    await recoverTypedDataAddress({
                        domain,
                        types,
                        message,
                        primaryType: 'Permit',
                        signature: sig,
                    }),
                )
            })()
    }, [sig])

    // const { data, error, isLoading, isSuccess, isError, refetch, isRefetching } = useIerc20PermitNonces({
    //     args: [address as Address],
    //     enabled: Boolean(address),
    // })

    let v, r, s;
    if (signature) {
        ({ v, r, s } = hexToSignature(signature));
        console.log('v: ', v)
        console.log('r: ', r)
        console.log('s: ', s)
    }


    console.log('args: ', debouncedValue ? parseEther(debouncedValue) : BigInt(0), deadline, v, r, s)
    const { config } = usePrepareStakePoolDepositStEthWithPermit({
        // value: debouncedValue ? parseEther(debouncedValue) : BigInt(0),
        args: [
            debouncedValue ? parseEther(debouncedValue) : BigInt(0),
            BigInt(deadline),
            v,
            r,
            s
        ],
        enabled: Boolean(signature)
    })

    const { write, data: depositPermitData, isError: depositPermitIsError } = useStakePoolDepositStEthWithPermit(config)

    // const { config } = usePrepareStakePoolDepositEth({
    //     value: debouncedValue ? parseEther(debouncedValue) : BigInt(0),
    //     enabled: Boolean(debouncedValue),
    // })

    // const { write, data, error, isLoading, isError } =
    //     useStakePoolDepositEth(config)

    const {
        data: receipt,
        isLoading: isPending,
        isSuccess: isDepositSuccess,
    } = useWaitForTransaction({ hash: depositPermitData?.hash })

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <ValidateInput
                    onChange={handleInputChange}
                    placeholder="stETH amount"
                    value={value}
                />
                <button disabled={isLoading} onClick={() => signTypedData()}>
                    {isLoading ? 'Check Wallet' : 'Sign Message'}
                </button>
                {sig && (
                    <div>
                        <div>Signature: {sig}</div>
                        <div>Recovered address {recoveredAddress}</div>
                    </div>
                )}
                {sigError && <div>Error: {sigError?.message}</div>}
            </form>

            <button disabled={!isValid && !signature} onClick={() => write?.()}>Deposit</button>
            {/* <form
                onSubmit={(e) => {
                    e.preventDefault()
                    write?.()
                }}
            >
                Deposit ETH:{' '}
                <ValidateInput
                    onChange={handleInputChange}
                    placeholder="ETH amount"
                    value={value}
                />
                <button disabled={!write && !isValid} type="submit">Send</button>
            </form> */}
        </>
    );
}

export default DepositStEthWithPermit;
