import { URI_API_EXCHANGE } from "../vars.js"
import { cerrarSession } from "../helper/validarCuenta.js"
export class RoomsActivos {
    constructor() {
        this.api = `${URI_API_EXCHANGE}`
    }

    obtenerRoomsActivos() {
        return new Promise((resolve, reject) => {
            $.ajax({
                type:"GET",
                headers: {
                    "Authorization": "Bearer "+sessionStorage.getItem("token"),
                    "Content-type": "application/json"
                },
                url: `${this.api}roomsActivos`,
                success: res => resolve(res),
                error:(err) => {
                    cerrarSession(err)
                    reject(err)
                }
            })
        })
    }
}