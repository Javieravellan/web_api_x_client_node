import { URI_API_EXCHANGE } from "../vars.js"

export class Comentario {
    constructor() {
        /**
         * Dirección http base del endpoint de comentarios
         */
        this.urlApi = `${URI_API_EXCHANGE}`
    }

    getComentatiosYcalificacion(idUsuarioCalificado) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'GET',
                url: this.urlApi + "comentarios",
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                data: `idUsuarioCalificado=${idUsuarioCalificado}`,
                success: res => resolve(res),
                error: err => reject(err)
            })
        })
    }
}