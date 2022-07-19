import { cerrarSession } from "../helper/validarCuenta.js"
import { URI_API_EXCHANGE } from "../vars.js"

export class SolicitudOfertada {
    constructor(ofertada) {
        this.ofertada = ofertada
        this.urlApi = `${URI_API_EXCHANGE}`
    }
    /**
     * Obtiene todas las solicitudes de compra disponibles
     * @returns new Promise
     */
    getSoliOfertadas() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${this.urlApi}ofertadas`,
                type: 'GET',
                headers: {
                    "contentType": 'application/json',
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                crossDomain: true,
                data: `idUsuario=${this.ofertada.id}`,
                success: (res) => resolve(res),
                error:(err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }
/**
 * Obtiene todas las solicitudes de compra con un id mayor al último registrado.
 * @returns new Promise
 */
    getSoliOfertadasPorID() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${this.urlApi}ofertada`,
                type: 'GET',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token"),
                    contentType: 'application/json'
                },
                crossDomain: true,
                data: `idUsuario=${this.ofertada.id}&idOrden=${this.ofertada.lastID}`,
                success: (res) => resolve(res),
                error: (err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    obtenerOfertasdeVentaParaUsuario() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${this.urlApi}ofertasVenta`,
                type: 'GET',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token"),
                    contentType: 'application/json'
                },
                crossDomain: true,
                data: `idOrden=${this.ofertada.id}&idUsuario=${this.ofertada.idUsuario}`,
                success: (res) => {
                    resolve(res)
                },
                error: (err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }

    cambiarEstadoDeOfertaPorId(data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'post',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                url:`${this.urlApi}cambiarEstadoOferta?idOferta=${data.idOferta}&estado=${data.estado}`,
                success: (res) => {
                    resolve(res)
                },
                error:(err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        }) 
    }
}