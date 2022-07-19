import { cerrarSession } from "../helper/validarCuenta.js"
import { URI_API_EXCHANGE } from "../vars.js"

export class Transaccion {
    constructor() {
        this.urlApi = `${URI_API_EXCHANGE}`
    }

    crearTransaccionInicial(tran) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type:"POST",
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token"),
                    "Content-Type": 'application/json'
                },
                url: `${this.urlApi}crearTran`,
                data: JSON.stringify(tran),
                success: res => resolve(res),
                error: (err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    obtenerEstadoTransaccionPorIdOferta(idOferta, idUsuario,receptor, esComprador) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type:"GET",
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token"),
                    "Content-type": "application/json"
                },
                url: `${this.urlApi}estadoTran`,
                data: `idOferta=${idOferta}&idUsuario=${idUsuario}&idUsuarioReceptor=${receptor}&esComprador=${esComprador}`,
                success: res => resolve(res),
                error:(err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    guardarFechaPago(uri, tran) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${this.urlApi}${uri}`,
                data: JSON.stringify(tran),
                type: 'POST',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token"),
                    "Content-type": "application/json"
                },
                success: res => resolve(res),
                error: (err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    guardarMensajeChat(chat) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type:"POST",
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token"),
                    "Content-type": "application/json"
                },
                url: `${this.urlApi}chats`,
                data: JSON.stringify(chat),
                success: res => resolve(res),
                error: (err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    finalizarTransaccion(valor) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                url: `${this.urlApi}finalizarTransaccion`,
                data: `${JSON.stringify(valor)}`,
                headers: {
                    "Authorization": "Bearer " + sessionStorage.getItem("token"),
                    "Content-Type": "application/json"
                },
                success: res => resolve(res),
                error: err => reject(err)
            })
        })
    }

    cambiarEstadoTransaccion(idTransaccion, idOrden, idUsuario) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                url: `${this.urlApi}cambiarEstadoTran?idTransaccion=${idTransaccion}
                    &idOrden=${idOrden}&idUsuarioReceptor=${idUsuario}`,
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem("token")}`,
                },
                success: res => resolve(res),
                error: err => reject(err)
            })
        })
    }

    denunciarTransaccion(idOferta, idComp, idTran) {
        return new Promise((resol, rej) => {
            $.ajax({
                type: 'POST',
                url: `${this.urlApi}denunciar?idOferta=${idOferta}
                    &idComp=${idComp}&idTran=${idTran}`,
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem("token")}`,
                },
                success: res => resol(res),
                error: err => rej(err)
            })
        })
    }

    obtenerResumenComercial(idUsuario, periodo) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type:"GET",
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token"),
                },
                url: `${this.urlApi}resumen`,
                data: `idUsuario=${idUsuario}&periodo=${periodo}`,
                success: res => resolve(res),
                error:(err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }
}