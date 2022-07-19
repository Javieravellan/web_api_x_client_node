import { UsuarioModelo } from "../datos_db/usuarioModelo.js";
import { Base64 } from "../base64Lib.js";

const generarNuevoCodigo = (email) => {
    new UsuarioModelo().generarNuevoCodigo(email)
    .then(_ => {
        $("#token").val("")
        alert(_)
    }).catch(er=>console.log(er))
    .then(() => $("#btn-generar").attr("disabled", true))
}

export const parseJwt = (token) => {
    try {
        let payload = Base64.decode(token.split('.')[1])
        payload = JSON.stringify(payload)
        payload = payload.replace(/\\u0000/g, "")
        payload = payload.substring(1,payload.length)
        payload = payload.substring(0, payload.length - 1)
        return payload.replace(/\\/g,"")
    } catch (e) {
        return null;
    }
};

export const cerrarSession = (err) => {
    if (err.status === 401) {
        sessionStorage.removeItem("auth")
        sessionStorage.removeItem("token")
        window.location.href = "./page-login.html"
        return false;
    }
    console.log("Error", err)
}

export const validarCuenta = () => {
    let email = JSON.parse(sessionStorage.getItem("auth")).email
    let codigo = $("#token").val().trim()
    if (email.trim() !== "" || codigo.trim() !== "") {
         new UsuarioModelo().activarCuenta(email, codigo)
        .then(_ => {
            window.location.href = "./index.html"
        })
        .catch(err => {
            if (err.status == 408) {
                $("#btn-generar").attr("disabled", false)
                $("#btn-generar").click(() => generarNuevoCodigo(email));
            }
            let alerta = `<div class="alert alert-danger alert-dismissible fade show">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                ${err.statusText}
                <button type="button" class="close h-100" data-dismiss="alert" aria-label="Close"><span><i class="mdi mdi-close"></i></span>
                </button>
            </div>`
            $("#err").html(alerta)
        })
    }
}