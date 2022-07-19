const formulario = $("form[name='form_crear']")[0];

const valor = $("#valor")
const select_valor = $("#select_valor")
const select_de = $("#select_de")
const in_valor_a = $("#in_valor_a")
const in_auto = $("#in_auto")
const select_banco = $("#sel2")
const in_tiempo = $("#in_tiempo")

export function validarFormulario(e=null) {
    //e.preventDefault()
    if (valor.val() == "") {
        alert("Debe ingresar el valor")
        $(valor).focus()
        return false
    }
    else if (select_valor.val() == "Seleccione...") {
        alert("Debe seleccionar el tipo de moneda")
        $(select_valor).focus()
        return false
    }
    else if (select_de.val() == "Seleccione...") {
        alert("Debe seleccionar el tipo de moneda que va a solicitar")
        select_de.focus()
        return false
    }
    else if (in_valor_a.val() == "") {
        alert("Debe ingresar el valor de oferta")
        in_valor_a.focus()
        return false
    }
    else if (select_banco.val() == "Nothing selected") {
        alert("Debe seleccionar desde qué entidad hace la transferencia")
        select_banco.focus()
        return false
    }
    else if (in_tiempo.val() == "") {
        alert("Debe ingresar el tiempo que permanecerá activa la solicitud")
        in_tiempo.focus()
        return false
    } 
    else if ($("button[data-id=sel2]").attr("title") == "Nothing selected") {
        alert("Debe completar este campo")
        $("button[data-id=sel2]").focus()
        return false
    }
    else if ($("button[data-id='ctasRecepcion']").attr("title") == "Nothing selected") {
        alert("Debe completar el campo de cuentas receptoras")
        $("button[data-id=ctasRecepcion]").focus()
        return false
    }
    return true
}

export function validarForm2() {
    let incant = $("#in_cantidad")
    let in_a = $("#in_a")
    let cmbReceptoras = $("#cmbReceptoras")
    if (incant.val() == "") {
        alert("El campo es requerido")
        incant.focus()
        return false;
    } else if (in_a.val() == "") {
        alert("El campo es requerido")
        in_a.focus()
        return false;
    }
    /*else if ($(cmbReceptoras).selectpicker('val').length == 0) {
        $(cmbReceptoras).selectpicker('focus')
        alert("Debe seleccionar al menos una cuenta de recepción.")
        return false;
    }*/
    return true;
}
// eventos
valor.on('input', onFocusOut)
in_valor_a.on('input', onFocusOut)

function onFocusOut() {
    let v = valor.val()
    let v2 = in_valor_a.val()

    if (v !== "" && v2 !== "") {
        in_auto.html((v / v2).toFixed(6))
    } 
}