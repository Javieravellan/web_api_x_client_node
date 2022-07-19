import { cerrarSession } from "../helper/validarCuenta.js";
import { URI_API_EXCHANGE } from "../vars.js";

export class OfertaModelo {
    constructor(objOferta) {
        this.oferta = objOferta;
        this.server = `${URI_API_EXCHANGE}`
    }

    crearOferta() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+'crearOferta',
                type: 'POST',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                crossDomain: true,
                data: JSON.stringify(this.oferta),
                contentType: 'application/json',
                success: (res) => resolve(res),
                error: (error) => {
                    cerrarSession(error)
                    reject(error)
                }
            });
        })
    }

    obtenerOfertaPorId(idOferta) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+'oferta',
                type: 'GET',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                crossDomain: true,
                data: 'idOferta='+idOferta,
                contentType: 'application/json',
                success: (res) => resolve(res),
                error: (error) => {
                    cerrarSession(error)
                    reject(error);
                }
            });
        })
    }

    crearOfertaProgramada(programada) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+'ofertaProgramada',
                type: 'POST',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                crossDomain: true,
                data: JSON.stringify(programada),
                contentType: 'application/json',
                success: (res) => resolve(res),
                error: (error) => {
                    cerrarSession(error)
                    reject(error);
                }
            });
        })
    }

    obtenerOfertasProgramadas(idUsuario) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+'ofertasProgramadas',
                type: 'GET',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                data: `idUsuario=${idUsuario}`,
                success: (res) => resolve(res),
                error: (error) => {
                    cerrarSession(error)
                    reject(error);
                }
            });
        })
    }

    cambiarEstadoProgramada(idOrden, estado) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+`estadoProgramada?idOrden=${idOrden}&estado=${estado}`,
                type: 'POST',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token"),
                },
                success: (res) => resolve(res),
                error: (error) => {
                    cerrarSession(error)
                    reject(error);
                }
            });
        })
    }

    eliminarOfertaProgramada(idOrden) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+`eliminarProgramada?idOrden=${idOrden}`,
                type: 'POST',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token"),
                },
                success: (res) => resolve(res),
                error: (error) => {
                    cerrarSession(error)
                    reject(error);
                }
            });
        })
    }

    actualizarDatosOfertaProgramada(programada) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+'actualizarProgramada',
                type: 'POST',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                crossDomain: true,
                data: JSON.stringify(programada),
                contentType: 'application/json',
                success: (res) => resolve(res),
                error: (error) => {
                    cerrarSession(error)
                    reject(error);
                }
            });
        })
    }

    obtenerOfertasProgramadasDisponibles(idUsuario, valOfertadoReq, valorEntregadoReq, 
        valEntregadoDesc,idOrdenCreacion, reqDesc) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+'solicitudesProgramadas',
                type: 'get',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                crossDomain: true,
                data: `idUsuario=${idUsuario}&valOfertadoReq=${valOfertadoReq}&valorEntregadoReq=${valorEntregadoReq}&valEntregadoDesc=${valEntregadoDesc}&idOrdenCreacion=${idOrdenCreacion}&reqDesc=${reqDesc}`,
                contentType: 'application/json',
                success: (res) => resolve(res),
                error: (error) => {
                    cerrarSession(error)
                    reject(error);
                }
            });
        })
    }

    existeProgramada(idOrden, idUsuario) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.server+'existeProgramada',
                type: 'get',
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token")
                },
                crossDomain: true,
                data: `idOrden=${idOrden}&idUsuario=${idUsuario}`,
                contentType: 'application/json',
                success: (res) => resolve(res),
                error: (error) => {
                    cerrarSession(error)
                    reject(error);
                }
            });
        })
    }
}