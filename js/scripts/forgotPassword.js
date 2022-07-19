import { UsuarioModelo } from "./datos_db/usuarioModelo.js"
const modelo = new UsuarioModelo()

const enviarEmailDeRecuperacion = async (e) => {
    $("body").css("opacity", "0.5")
    e.preventDefault()
    let email = e.target.elements[0]
    if (email.value.trim() == "") {
        email.focus()
        return;
    }
    try {
        let res = await modelo.recuperarContrasenia(email.value)
        sessionStorage.setItem("email", res)
        $("#authentication").hide();
        $("#rem").html(res)
        $("#popup-verify").modal("show")
    } catch(e) {
        alert(e.statusText)
    }
    $("body").css("opacity", "1")
}

const validarCodTmpClave = async e => {
    e.preventDefault();
    let email = sessionStorage.getItem("email")
    let codigoInput = $("#token").val()

    if (codigoInput.trim() == "") return false
    if (codigoInput.length < 4) return false

    try {
        $("#btn-validar").hide()
        await modelo.verificarCodigoDeCambioClave(codigoInput, email)
        $("#popup-verify").modal("hide")
        $("#popup-cambiar-clave").modal("show")
    } catch(e) {
        console.log(e)
        //return
    }
    $("#btn-validar").show()
}

const cambiarContrasenia = async e => {
    e.preventDefault()
    let form = $("#cambiarClave")[0]
    let pass = form.elements[0].value.trim()
    let repeatPass = form.elements[1].value.trim()
    if (pass.length < 3) {
        alert("La contraseña debe tener al menos 3 caracteres.")
        return
    }
    if (pass !== repeatPass) {
        alert("Las contraseñas no coinciden.")
        return
    }

    try {
        $("body").css("opacity", "0.5")
        await modelo.cambiarContrasenia(sessionStorage.getItem("email"), pass)
        window.location.href = "./page-login.html"
    } catch(e) {
        $("body").css("opacity", "1")
        alert(e.statusText)
        return
    }
}

const onLoad = () => {
    $("#form-email-recuperacion").submit(enviarEmailDeRecuperacion)
    $("#btn-validar").on('click', validarCodTmpClave)
    $("#cambiarClave").on('submit', cambiarContrasenia)
}

$(document).ready(onLoad)