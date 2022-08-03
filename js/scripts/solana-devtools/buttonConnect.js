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
     * Wallet porviders available
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

        this.onConnect = this.onConnect.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        //this._managePanel = this._managePanel.bind(this);

        this.phantom.on('connect', this.onConnect); // evento al conectar
        this.phantom.on('disconnect', this.onDisconnect) // evento al desconectar
    }

    onConnect() {
        if (!this.state.isShow) {
            this.state.context.show();
            this.setState({
                ...this.state.context,
                isShow: true
            })
        }
    }

    onDisconnect() {
        if (this.state.isShow) {
            this.state.context.hide();
            this.setState({
                ...this.state.context,
                isShow: false
            })
        }
    }

    _managePanel(isShow) {
        if (this.state.isShow) {
            this.state.context.hide();
            isShow = !this.state.isShow;
        } else {
            this.state.context.show();
            isShow = !this.state.isShow;
        }
        this.setState({
            ...this.state.context,
            isShow: isShow
        })
    }

    componentDidMount() {
        if (!this.phantom.connected) this.onDisconnect();
    }

    render() {
        return (
            <ConnectionProvider endpoint={this.endpoint}>
                <WalletProvider
                    wallets={this.wallets}
                    onError={(err)=>console.log(err)}
                    autoConnect={true}>
                    <WalletModalProvider>
                        <ButtonConnect />
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        )
    }
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

export default ButtonWallet;