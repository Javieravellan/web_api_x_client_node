import { UsuarioModelo } from "./datos_db/usuarioModelo.js";
import { parseJwt } from "./helper/validarCuenta.js";
import { SITE_KEY } from "./vars.js";

const formLogin = $("#form-login")[0];
const usuarioModelo = new UsuarioModelo();

var reCaptchaToken = null;

const gestionarErrorLogin = (err) => {
    if (err.status !== 403) {
        let alerta = `<div class="alert alert-danger alert-dismissible fade show">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            ${err.statusText}
            <button type="button" class="close h-100" data-dismiss="alert" aria-label="Close"><span><i class="mdi mdi-close"></i></span>
            </button>
        </div>`
        $(".caja_alert").html(alerta)
    }
    console.log(err)
}

const hacerLogin = (e) => {
    e.preventDefault();
    let email = $("input[type=email]").val().trim()
    let pass = $("input[type=password]").val().trim()

    if (email == "" || pass == "") {
        alert("Todos los campos son obligatorios")
        return;
    }
    $("body").css("opacity", 0.5)
    usuarioModelo.hacerLogin(email, pass, reCaptchaToken) //
    .then(res => {
        sessionStorage.setItem("auth", parseJwt(res))
        sessionStorage.setItem("token", res)
        //return
        window.location.href = "./index.html"
    })
    .catch(gestionarErrorLogin)
    .then(_ => {
        grecaptcha.reset()
        $("body").css("opacity", 1)
    })
}
// captcha callbacks
const verificarCaptcha = _ => {
    reCaptchaToken = _
    $("button[type='submit']").prop("disabled", false)
}
const expiredCallbackCaptcha = _ => {
    reCaptchaToken = null
    $("button[type='submit']").prop("disabled", true)
}
// end captcha callbacks

const onLoad = () => {
    if (sessionStorage.getItem("auth") != null && sessionStorage.getItem("auth") !== undefined) {  // comprueba que haya iniciado sesión.
        history.back()
    }
    grecaptcha.render('captcha', {
        'sitekey': SITE_KEY,
        'callback': verificarCaptcha,
        'expired-callback': expiredCallbackCaptcha
    })
    $("button[type='submit']").prop("disabled", true)
    $(formLogin).on("submit", hacerLogin)
}

$(document).ready(onLoad);