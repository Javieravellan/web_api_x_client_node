import { cerrarSession } from "../helper/validarCuenta.js"
import { URI_API_EXCHANGE } from "../vars.js"


export class MediosPago {
    constructor(){
        this.api = URI_API_EXCHANGE
    }

    obtenerMediosPago(tipo) {
        console.log(tipo)
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${this.api}medios-pago?tipo=${tipo}`,
                type: 'GET',
                crossDomain: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem("token")}`
                },
                beforeSend: () => $("body").css('opacity', 0.5),
                success: res => resolve(res),
                error: err => {
                    cerrarSession(err)
                    reject(err)
                },
                complete: () => $("body").css('opacity', 1)
            })
        })
    }

    obtenerBilleteras() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${this.api}billeteras`,
                type: 'GET',
                crossDomain: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem("token")}`
                },
                beforeSend: () => $("body").css('opacity', 0.5),
                success: res => resolve(res),
                error: err => {
                    cerrarSession(err)
                    reject(err)
                },
                complete: () => $("body").css('opacity', 1)
            })
        })
    }
}