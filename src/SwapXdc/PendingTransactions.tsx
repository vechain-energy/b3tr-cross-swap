import React from 'react';
import { NODE_URL, SWAP_ADDRESS } from '~/config';
import { useConnex, useWallet } from '@vechain/dapp-kit-react';
import { useBeats } from '~/hooks/useBeats';

export default function PendingTransactions() {
    const { account } = useWallet()
    const connex = useConnex()

    const [transactionIds, setTransactionIds] = React.useState<string[]>([])
    const update = useBeats([account ?? '', SWAP_ADDRESS], NODE_URL)

    React.useEffect(() => {
        if (!account || !connex) { return }
        connex.thor.account(SWAP_ADDRESS)
            .method(
                {
                    "inputs": [{ "name": "sender", "type": "address" }],
                    "name": "pendingUserTransactions",
                    "outputs": [{ "internalType": "bytes32[]", "name": "transactionIds", "type": "bytes32[]" }]
                })
            .call(account)
            .then(({ decoded: { transactionIds } }: { decoded: { transactionIds: string[] } }) => {
                setTransactionIds(transactionIds)
            })
            .catch((error: Error) => {
                console.error(error)
            })
    }, [account, connex, update])

    if (!account) { return null }
    return (
        <ol className=' list-inside'>
            {transactionIds.map((txId) => (
                <li key={txId}>
                    <Transaction txId={txId} />
                </li>
            ))}
        </ol>
    )

}

function Transaction({ txId }: { txId: string }) {
    const [swapData, setSwapData] = React.useState<string>('')
    const connex = useConnex()

    React.useEffect(() => {
        if (!txId || !connex) { return }
        connex.thor.account(SWAP_ADDRESS)
            .method(
                {
                    "inputs": [
                        {
                            "internalType": "bytes32",
                            "name": "transactionId",
                            "type": "bytes32"
                        }
                    ],
                    "name": "swaps",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "outputAmount",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "sender",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "swapAddress",
                            "type": "address"
                        },
                        {
                            "internalType": "string",
                            "name": "recipient",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "network",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "swapId",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "cancelReason",
                            "type": "string"
                        },
                        {
                            "internalType": "enum B3TRBridge.SwapStatus",
                            "name": "status",
                            "type": "uint8"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }
            )
            .call(txId)
            .then(({ decoded: swapData }: { decoded: any }) => {
                setSwapData(JSON.stringify(swapData, null, 2))
            })
            .catch((error: Error) => {
                console.error(error)
            })
    }, [txId, connex])

    return (
        <div>
            <div className='font-bold'>{txId}</div>
            <pre className='text-xs'>{swapData}</pre>
        </div>
    )
}