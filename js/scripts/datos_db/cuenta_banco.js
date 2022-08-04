import { cerrarSession } from "../helper/validarCuenta.js"
import { URI_API_EXCHANGE } from "../vars.js"

export class CuentaBanco {
    constructor() {
        this.server = `${URI_API_EXCHANGE}`
    }

    obtenerCuentasBancoDeUsuario(idUsuario) {
        return new Promise((resolve, reject)=> {
            $.ajax({
                url: this.server+`cuentas`,
                type: 'GET',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                data: `idUsuario=${idUsuario}`,
                success: (res) => resolve(res),
                error:  err => { 
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    obtenerCuentasBancoPorIdOrden(idOrden) {
        return new Promise((resolve, reject)=> {
            $.ajax({
                url: this.server+`cuentasIdOrden`,
                type: 'GET',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                data: `idOrden=${idOrden}`,
                success: (res) => resolve(res),
                error: err => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    crearNuevaCuenta(cta) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: this.server + "cuentas",
                data: JSON.stringify(cta),
                headers: {
                    "Authorization": "Bearer " + sessionStorage.getItem("token"),
                    "Content-Type": "application/json",
                }, 
                success: res => resolve(res),
                error: err => reject(err)
            })
        })
    }

    editarCuenta(cta) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: this.server + "cuenta",
                data: JSON.stringify(cta),
                headers: {
                    "Authorization": "Bearer " + sessionStorage.getItem("token"),
                    "Content-Type": "application/json",
                }, 
                success: res => resolve(res),
                error: err => reject(err)
            })
        })
    }

    eliminarCuenta(idCuenta) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url: this.server + "eliminarCuenta?idCuenta="+idCuenta,
                headers: {
                    "Authorization": "Bearer " + sessionStorage.getItem("token"),
                    //"Content-Type": "application/json",
                }, 
                success: res => resolve(res),
                error: err => reject(err)
            })
        })
    }

    obtenerCuentasSeleccionadasParaTransaccion(idUsuario, idOferta) {
        return new Promise((resolve, reject)=> {
            $.ajax({
                url: this.server+`cuentasSeleccionadas`,
                type: 'GET',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                data: `idUsuario=${idUsuario}&idOferta=${idOferta}`,
                success: (res) => resolve(res),
                error: err => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    obtenerNCuentasDeUsuario(idUsuario) {
        return new Promise((resolve, reject)=> {
            $.ajax({
                url: this.server+`verificarCuentas`,
                type: 'GET',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                data: `idUsuario=${idUsuario}`,
                success: (res) => resolve(res),
                error:  err => { 
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    obtenerCuentaReceptoraPorId(idCuenta) {
        return new Promise((resolve, reject)=> {
            $.ajax({
                url: `${this.server}/cuentaReceptora`,
                type: 'GET',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                data: `idcuenta=${idCuenta}`,
                success: (res) => resolve(res),
                error:  err => { 
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }
}