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

class ButtonWallet extends React.Component {
    /**
     * Wallet providers available
     */
    phantom = new PhantomWalletAdapter()
    glow = new GlowWalletAdapter()
    // array of wallets provider | undefined
    wallets = [this.phantom, this.glow]
    // Solana network
    solNetwork = 'http://localhost:8899'
    endpoint = this.solNetwork
    
    constructor(props) {
        super(props);
        this.state = {
            context: props.context,
            isShow: true
        }
    }

    componentDidMount() {
        //if (!this.phantom.connected) this.onDisconnect();
    }

    render() {
        return (
            <ConnectionProvider endpoint={this.endpoint}>
                <WalletProvider
                    wallets={this.wallets}
                    onError={(err)=>console.log(err)}
                    autoConnect={true}>
                    <WalletModalProvider>
                        <WalletMultiButton />
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        )
    }
}

/*const ButtonConnect = () => {
    const { connection } = useConnection()
    const { pubKey, sendTransaction } = useWallet()

    return (
        <div>
            <WalletMultiButton />
        </div>
    )
}*/

export default ButtonWallet;