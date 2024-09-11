import React from 'react';
import { B3TR_ADDRESS } from '~/config';
import { useConnex, useWallet } from '@vechain/dapp-kit-react';
import { unitsUtils } from '@vechain/sdk-core';

type Props = {
    onClick?: (balance: string) => void
}

export default function Balance({ onClick }: Props) {
    const { account } = useWallet()
    const connex = useConnex()

    const [balance, setBalance] = React.useState("0")

    React.useEffect(() => {
        if(!account || !connex) { return }
        connex.thor.account(B3TR_ADDRESS)
            .method(
                {
                    "inputs": [{ "name": "owner", "type": "address" }],
                    "name": "balanceOf",
                    "outputs": [{ "name": "balance", "type": "uint256" }]
                })
            .call(account)
            .then(({ decoded: { balance } }: { decoded: { balance: string } }) => {
                setBalance(unitsUtils.formatUnits(balance, 18))
            })
            .catch((error: Error) => {
                console.error(error)
            })
    }, [account, connex])

    if (!account) { return null }

    const handleClick = () => onClick && onClick(balance)
    return (
        <span onClick={handleClick}>
            Balance: {balance}
        </span>
    )

}