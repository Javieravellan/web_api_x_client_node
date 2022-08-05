import React from 'react'
import ButtonWallet from '../solana-devtools/buttonConnect';

export class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            context: props.context
        }
        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        setTimeout(() => {
            this.state.context.ocultarEmitir(() => this.state.context)
        }, 2000)
    }

    render() {
        return (
            <div>
                <h4>Iniciar depósito de garantía</h4>
                <p>Conectar red</p>
                <div className='row'>
                    <div className='col-md-3 mb-3'>
                        <p>Dirección: </p>
                    </div>
                    <div className='col-md-9 mb-3'>
                        <input className='form-control' defaultValue={this.state.context.otraCta.otraDir} disabled={true} />
                    </div>
                    <div className='col-md-3 mb-3'>
                        <p>Red: </p>
                    </div>
                    <div className='col-md-9 mb-3'>
                        <input className='form-control' type={'text'} defaultValue={this.state.context.otraCta.otraRed} disabled={true} />
                    </div>
                    <div className='col-md-3 mb-3'>
                        <p>Cantidad: </p>
                    </div>
                    <div className='col-md-9 mb-3'>
                        <input type={"number"} className='form-control' defaultValue={''} />
                    </div>
                    <div className='col-md-12 d-flex align-self-center'>
                        <ButtonWallet context={this.state.context} />
                        <input type={'button'} onClick={this.onClick} value="Depositar" className='ml-2 btn btn-success' />
                        <input type={'button'} value="Cancelar" className='ml-2 btn btn-warning' />
                    </div>
                </div>
            </div>
        )
    }
} 