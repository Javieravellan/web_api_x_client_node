import { UsuarioModelo } from "./datos_db/usuarioModelo.js";
import { validarCuenta, parseJwt } from "./helper/validarCuenta.js";
import { selectPicker } from "./plugin-select/js/index.js";
import { SITE_KEY } from "./vars.js";

const usuarioModelo = new UsuarioModelo()
let response = null
var reCaptchaToken = null;

$(document).ready(onLoad);

const administrarErrorRegistro = (err) => {
    alert(err.statusText)
};

const enviarRegistro = (e) => {
    e.preventDefault()
    let esUsuarioValido = validarCampo("#usuario", '#user-error', 'Nombre de usuario obligatorio.')
    let esEmailValido = validarCampo("#email", '#email-error', 'Email obligatiorio.')
    let esClaveValida = validarCampo("input[type='password']", '#pass-error', 'Contraseña obligatoria.')

    if (!esClaveValida || !esEmailValido || !esUsuarioValido) return;
    if (window.selectPicker.itemSelected==null) {
        $("#pais-error").css({
            'color': 'red', 'font-size': '.9em'
        }).html("País es obligatorio.");return;
    }
    $(".errors").html('')
    $("body").css("opacity", 0.5)
    const nuevoUsuario = {
        email: $("#email").val().trim(),
        nombre: $("#usuario").val().trim(),
        pass: $("input[type='password']").val().trim(),
        pais: window.selectPicker.itemSelected.dataset.value,
        moneda: window.selectPicker.itemSelected.dataset.moneda
    }
    usuarioModelo.registrarUsuario(nuevoUsuario, reCaptchaToken)
    .then(_ => {
        sessionStorage.setItem("auth", parseJwt(_))
        sessionStorage.setItem("token", _)
        $(".modal").modal("show")
        $("#btn-validar").click(validarCuenta)
        response = _    // esto podría eliminarse ya que se externalizó la activación de la cta.
        $(".auth-form").hide()
    })
    .catch(administrarErrorRegistro)
    .then(() => $("body").css("opacity", 1))
};

const validarCampo = (tagId, divMsg, msg) => {
    let tag = $(tagId).val().trim()
    if (tag == "") {
        $(divMsg).css({
            'color': 'red', 'font-size': '.9em'
        }).html(msg)
        return false;
    } else $(divMsg).html('')
    return true
}

const cerrarPopup = () => $(".auth-form").show();
// captcha callbacks
const verificarCaptcha = _ => {
    reCaptchaToken = _
    $("#btn-register").prop("disabled", false)
}
const expiredCallbackCaptcha = _ => {
    reCaptchaToken = null
    $("#btn-register").prop("disabled", true)
}
// end captcha callbacks

function onLoad() {
    if (sessionStorage.getItem("auth") !== null) {  // comprueba que haya iniciado sesión.
        history.back()
    }
    grecaptcha.render("captcha", {
        'sitekey': SITE_KEY,
        'callback': verificarCaptcha,
        'expired-callback' : expiredCallbackCaptcha,
    }) 

    selectPicker.iniciar("select", "item")
    $("#btn-register").prop("disabled", true)
    $("#form-register").submit(enviarRegistro)
    $(".modal").on("hidden.bs.modal", cerrarPopup)
}