import { cerrarSession } from "../helper/validarCuenta.js";
import { URI_API_EXCHANGE } from "../vars.js";

export class SolicitudCompra {
    constructor(solicitudCompra) {
        this.solicitudCompra = solicitudCompra;
        this.server = `${URI_API_EXCHANGE}`
    }

    crearSolicitudCompra() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+'crearSolicitud',
                type: 'post',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                data: JSON.stringify(this.solicitudCompra),
                contentType: 'application/json',
                success: (res) => resolve(res),
                error: (err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    obtenerSolicitudesCompraPorID(idUsuario, filtro, pagandoEn) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+'misSolicitudes',
                type: 'GET',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                data: `idUsuario=${idUsuario}`,
                contentType: 'application/json',
                success: (res) => {
                    resolve(res)
                },
                error:(err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        });
    }

    obtenerSolicitudesCompraDisponiblesPorIdOrden(idUsuario, idOrden, filtro, pagandoEn, recibeEn) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+'solicitud',
                type: 'GET',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                data: `idOrden=${idOrden}&idUsuario=${idUsuario}&filtro=${filtro}&pagandoEn=${pagandoEn}&recibeEn=${recibeEn}`,
                contentType: 'application/json',
                success: (res) => resolve(res),
                error:(err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        });
    }

    obtenerSolicitudesCompraDisponibles(idUsuario, filtro, pagandoEn, recibeEn) {
        return new Promise ((resolve, reject) => 
        $.ajax({
            url: this.server+`solicitudes`, // url de API
            type: `GET`,
            headers: {
                "Authorization": "Bearer "+sessionStorage.getItem("token")
            },
            data: `idUsuario=${idUsuario}&filtro=${filtro}&pagandoEn=${pagandoEn}&recibeEn=${recibeEn}`,
            crossDomain: true,
            success: res => resolve(res),
            error: (err) => {
                cerrarSession(err)
                reject(err)
            }
        }))
    }

    obtenerSolicitudCompraPorId(idOrden, idUsuario) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'GET',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                url: this.server+`miSolicitud`,
                data: `idOrden=${idOrden}&idUsuario=${idUsuario}`,
                crossDomain: true,
                success: response => resolve(response),
                error:(err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    incrementarCampoVisto(idOrden, idUsuario) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+`incrementar?idOrden=${idOrden}&idUsuario=${idUsuario}`,
                type: 'POST',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                success: res => resolve(res),
                error: (err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    disminuirNumeroDePropuestasPorIdOrden(idOrden) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+`disminuirPropuesta?idOrden=${idOrden}`,
                type: 'POST',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                success: res => resolve(res),
                error:(err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    cambiarEstadoOrden(idOrden, estado) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+`cambiarEstadoOrden?idOrden=${idOrden}&estado=${estado}`,
                type: 'POST',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                success: res => resolve(res),
                error: (err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    obtenerNotificaciones(idUsuario) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+`notificaciones?idUsuario=${idUsuario}`,
                type: 'GET',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                success: res => resolve(res),
                error: (err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    eliminarSolicitudCompra(id) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+`eliminar?idOrden=${id}`,
                type: 'POST',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                success: res => resolve(res),
                error: (err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }
}