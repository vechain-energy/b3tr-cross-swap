import React from 'react';
import { APP_DESCRIPTION, APP_TITLE, SWAP_ADDRESS, B3TR_ADDRESS } from '~/config';
import { useWallet, useConnex } from '@vechain/dapp-kit-react';
import { clauseBuilder, FunctionFragment, unitsUtils } from '@vechain/sdk-core';
import Transaction from './Transaction';
import Error from '~/common/Error';
import Balance from './Balance';
import PendingTransactions from './PendingTransactions';

export default function SwapB3TR() {
    // get the connected wallet
    const { account } = useWallet();

    // and access to connex for interaction with vechain
    const connex = useConnex()

    // state for the amount to send
    const [amount, setAmount] = React.useState<string>('')
    const handleChangeAmount = async (event: React.ChangeEvent<HTMLInputElement>) => setAmount(event.target.value)

    const [recipientAddress, setRecipientAddress] = React.useState<string>('')
    const [recipientNetwork] = React.useState<string>('xdc')
    const handleChangeRecipientAddress = async (event: React.ChangeEvent<HTMLInputElement>) => setRecipientAddress(event.target.value)

    // state for sending status
    const [txId, setTxId] = React.useState<string>('')
    const [error, setError] = React.useState<string>('')
    const handleSend = async () => {
        if (!account || !SWAP_ADDRESS) { return }

        // Validate recipient address
        const recipientAddressPattern = /^(xdc)[0-9A-Za-z]{30,70}$/
        if (!recipientAddressPattern.test(recipientAddress)) {
            setError('Invalid recipient address')
            return
        }

        try {
            setError('')

            const clauses = [
                {
                    ...clauseBuilder.functionInteraction(B3TR_ADDRESS, 'approve(address,uint256)' as unknown as FunctionFragment, [SWAP_ADDRESS, unitsUtils.parseUnits(amount, 18)]),
                    comment: 'Approve Swap Contract to access B3TR'
                },
                {
                    ...clauseBuilder.functionInteraction(SWAP_ADDRESS, 'function swapB3TRTokenTo(uint256 amount, string recipient, string network)' as unknown as FunctionFragment, [unitsUtils.parseUnits(amount, 18), recipientAddress, recipientNetwork]),
                    comment: 'Initiate a Swap'
                }
            ]

            // build a transaction for the given clauses
            const tx = connex.vendor.sign('tx', clauses)

                // requesting a specific signer will prevent the user from changing the signer to another wallet than the signed in one, preventing confusion
                .signer(account)

            // ask the user to sign the transaction
            const { txid } = await tx.request()

            // the resulting transaction id is stored to check for its status later
            setTxId(txid)
        }
        catch (err) {
            setError(String(err))
        }
    }


    if (!account) { return 'Please connect your wallet to continue.' }

    // sending is disabled if there is no signed in account or no amount entered
    const canSend = Boolean(account && amount)
    return (
        <div className='space-y-4 max-w-lg'>
            <div className='text-xl font-semibold'>{APP_TITLE}</div>
            <p>{APP_DESCRIPTION}</p>

            <div>
                <div className="relative mt-2 rounded-md shadow-sm">
                    <input
                        type="text"
                        name="amount"
                        id="amount"
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-24 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="0"
                        autoComplete="off"
                        value={amount}
                        onChange={handleChangeAmount}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-2">
                        B3TR
                    </div>
                </div>
                <div className='text-xs text-gray-400 text-right cursor-pointer'>
                    <Balance onClick={setAmount} />
                </div>
            </div>

            <div>
                <div className="relative mt-2 rounded-md shadow-sm">
                    <input
                        type="text"
                        name="recipientAddress"
                        id="recipientAddress"
                        className="block w-full rounded-md border-0 py-1.5 pl-2 pr-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="xdc.."
                        autoComplete="off"
                        value={recipientAddress}
                        onChange={handleChangeRecipientAddress}
                    />
                </div>
            </div>

            <div>
                <button
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!canSend ? 'opacity-25' : ''}`}
                    disabled={!canSend}
                    onClick={handleSend}
                >
                    send {amount} B3TR
                </button>

            </div>

            {Boolean(error) && <Error>{error}</Error>}
            <Transaction txId={txId} />

            <PendingTransactions />
        </div>
    )
}