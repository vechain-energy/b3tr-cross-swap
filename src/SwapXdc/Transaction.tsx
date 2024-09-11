import React from 'react';
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon as IconSuccess, ExclamationTriangleIcon as IconError, ArrowPathIcon as IconLoading } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query';
import { NODE_URL } from '~/config';
import type { TransactionReceipt } from '@vechain/sdk-network';
import { useBeats } from '~/hooks/useBeats';

export default function TransactionStatus({ txId }: { txId: string }) {
    // fetch the transaction receipt
    const [open, setOpen] = React.useState<boolean>(false)
    const [hasReceipt, setHasReceipt] = React.useState<boolean>(false)
    const receipt = useQuery<TransactionReceipt | null>({
        queryKey: ['transaction', txId],
        queryFn: async () => fetch(`${NODE_URL}/transactions/${txId}/receipt`).then((res) => res.json()) as Promise<TransactionReceipt | null>,
        refetchInterval: 7000,
        placeholderData: (previousData) => previousData,
        enabled: Boolean(txId) && !hasReceipt
    })
    const txChange = useBeats([txId], NODE_URL)

    React.useEffect(() => {
        if (receipt.data) { setHasReceipt(true) }
    }, [receipt.data])

    React.useEffect(() => {
        if (!txId) { return }
        setOpen(true)
        setHasReceipt(false)
    }, [txId])

    React.useEffect(() => {
        if (txId && txChange) {
            receipt.refetch()
        }
    }, [txId, txChange, receipt])

    const status = !receipt.data ? 'pending' : receipt.data?.reverted ? 'reverted' : 'success'

    return (
        <Transition.Root show={open} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => { }}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                                <div>
                                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${status === 'pending' ? 'inherit' : status === 'reverted' ? 'bg-red-100' : 'bg-green-100'}`}>
                                        {
                                            status === 'pending'
                                                ? <IconLoading className="h-8 w-8 text-gray-400 animate-spin" aria-hidden="true" />
                                                : status === 'reverted'
                                                    ? <IconError className="h-8 w-8 text-red-600" aria-hidden="true" />
                                                    : <IconSuccess className="h-8 w-8 text-green-600" aria-hidden="true" />
                                        }
                                    </div>
                                    <div className="mt-3 text-center sm:mt-5">
                                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                            {
                                                status === 'pending'
                                                    ? 'Transaction pending'
                                                    : status === 'reverted'
                                                        ? 'Transaction reverted'
                                                        : 'Transaction successful'
                                            }
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {
                                                    status === 'pending'
                                                        ? 'Your transaction is being processed.'
                                                        : status === 'reverted'
                                                            ? 'Please try again.'
                                                            : 'Your transaction has been successfully processed.'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-6">
                                    <button
                                        type="button"
                                        className="inline-flex w-full h-10 items-center justify-center uppercase rounded-md bg-indigo-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        onClick={() => setOpen(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}