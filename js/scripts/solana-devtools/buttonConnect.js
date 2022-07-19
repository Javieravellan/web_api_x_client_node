import React, { useMemo } from 'react'
import {
    GlowWalletAdapter,
    PhantomWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { 
    ConnectionProvider, 
    useConnection, 
    WalletProvider,
    useWallet
} from '@solana/wallet-adapter-react'
import { WalletModalProvider, 
    WalletMultiButton } from '@solana/wallet-adapter-react-ui'

// Styles
require("@solana/wallet-adapter-react-ui/styles.css")

const App = () => {
    const solNetwork = 'http://localhost:8899'
    const endpoint = useMemo(_ => solNetwork)
    // load wallets available
    const wallets = useMemo(
        _ => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter()
        ],
        [solNetwork]
    )

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect={true}>
                <WalletModalProvider>
                    <ButtonConnect />
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

const ButtonConnect = () => {
    const { connection } = useConnection()
    const { pubKey, sendTransaction } = useWallet()

    return (
        <div>
            <WalletMultiButton />
        </div>
    )
}

export default App;