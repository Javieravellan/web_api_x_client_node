import { cerrarSession } from "../helper/validarCuenta.js";
import { URI_API_USUARIO } from "../vars.js";

export class UsuarioModelo {
    constructor() {
        this.urlApi = `${URI_API_USUARIO}`
    }

    registrarUsuario(nuevoUsuario, captcha) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                headers: {
                    're-captcha': captcha
                },
                url: `${this.urlApi}registrar`,
                data: JSON.stringify(nuevoUsuario),
                contentType: "application/json",
                success: res => resolve(res),
                error:err => {
                    //cerrarSession()
                    reject(err)
                }
            })
        })
    }
    activarCuenta(email, codigo) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token"),
                    contentType: "application/json"
                },
                url: `${this.urlApi}activar?email=${email}&codValidacion=${codigo}`,
                success: res => resolve(res),
                error:err => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        });
    }

    hacerLogin(email, pass, captcha) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                headers: {
                    're-captcha': captcha
                },
                url: `${this.urlApi}login?email=${email}&pass=${pass}`,
                success: res => resolve(res),
                error: err => {
                    //cerrarSession()
                    reject(err)
                }
            })
        });
    }

    generarNuevoCodigo(email) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token"),
                    "Content-type": "application/json"
                },
                url: `${this.urlApi}generar?email=${email}`,
                success: res => resolve(res),
                error: err => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        });
    }

    consultarEstadoCuentaUsuario(email) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'GET',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                url: `${this.urlApi}estado?email=${email}`,
                success: res => resolve(res),
                error: err => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        });
    }

    actualizarDatos(usuario) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token"),
                    "Content-Type": "application/json"
                },
                url: `${this.urlApi}actualizar`,
                data: `${JSON.stringify(usuario)}`,
                success: res => resolve(res),
                error: err => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        });
    }

    recuperarContrasenia(email) {
        return new Promise((resol, rej) => {
            $.ajax({
                type: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                url: `${this.urlApi}recuperarClave?email=${email}`,
                success: res => resol(res),
                error: err => {
                    cerrarSession(err)
                    rej(err)
                }
            })
        })
    }

    verificarCodigoDeCambioClave(codigo, email) {
        return new Promise((resol, rej) => {
            $.ajax({
                type: 'GET',
                headers: {
                    "Content-Type": "application/json"
                },
                url: `${this.urlApi}recuperarClave?codigo=${codigo}&email=${email}`,
                success: res => resol(res),
                error: err => {
                    cerrarSession(err)
                    rej(err)
                }
            })
        })
    }

    cambiarContrasenia(email, newPass) {
        return new Promise((resol, rej) => {
            $.ajax({
                type: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                url: `${this.urlApi}cambiarClave?email=${email}&contrasenia=${newPass}`,
                success: res => resol(res),
                error: err => {
                    cerrarSession(err)
                    rej(err)
                }
            })
        })
    }

    guardarPreferenciaDeActivos(activos, idUsuario) {
        return new Promise((resol, rej) => {
            $.ajax({
                type: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                url: `${this.urlApi}preferencias?activos=${activos}&idUsuario=${idUsuario}`,
                success: res => resol(res),
                error: err => {
                    cerrarSession(err)
                    rej(err)
                }
            })
        })
    }
}