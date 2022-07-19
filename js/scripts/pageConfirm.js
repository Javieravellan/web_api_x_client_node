import { Base64 } from "./base64Lib.js";
import { UsuarioModelo } from "./datos_db/usuarioModelo.js";

const usuarioModelo = new UsuarioModelo()

const paramBase64 = new URLSearchParams(window.location.search)
const paramDecoded = Base64.decode(paramBase64.get("data")) 
const params = paramDecoded.split("&")
const exp = params[0].split("=")[1]
const idUsuario = params[1].split("=")[1]

$(document).ready(onLoad);

const activarCuenta = (e) => {
    e.preventDefault()
    // activar cuenta
    usuarioModelo.activarCuenta(idUsuario)
    .then(res => {
        $("#mensaje").html(res)
        $(".modal").modal("show")
    })
    .catch(er => console.log(er))
}

function onLoad() {
    const datosFechaArray = exp.split("/")
    const mesExp = (datosFechaArray[1] > 0) ? datosFechaArray[1] - 1 : datosFechaArray[1];
                              //   año             mes          día
    const fechaExp = new Date(datosFechaArray[2], mesExp, datosFechaArray[0]);
    const fechaActual = new Date();

    let diff = fechaActual - fechaExp; 
    diff = (diff / 1000) / 86400; // diff en días (1 día = 86400 segundos)
    // validación de la expiración.
    if (diff > 2) {
        console.log("Link no válido, fecha caducada.")
        console.log(fechaExp, fechaActual)
        return;
    }
    $("#btn-activar").click(activarCuenta)
}