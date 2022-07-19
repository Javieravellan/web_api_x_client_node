import {WebSocketClient} from "./web_socket_client.js";
import { validarFormulario } from "./validador.js";
import { SolicitudCompra } from "./datos_db/solicitud_compra.js";
import { solicitudComponent, alertErrorRequest, cardNoData } from "./HTMLComponents/components.js";
import { notificador } from "./notificaciones.js";
import { CuentaBanco } from "./datos_db/cuenta_banco.js";
import { RoomsActivos } from "./datos_db/rooms_activos.js";
import { URL_BASE } from './vars.js';

var btnEnviarCompra = document.getElementById("enviarCompra");

if (sessionStorage.getItem("auth") === "null" || !sessionStorage.getItem("auth")) {
    window.location.href = "./page-login.html"
}

let userSession = sessionStorage.getItem("auth")
userSession = JSON.parse(userSession)
let idUsuario = userSession.userId
let nameUser = userSession.userName
const cliente = new WebSocketClient(idUsuario);
let rutaFotoPerfil = URL_BASE;
let roomsActivos = new RoomsActivos();
/** LOAD */
$(async () => {
    getMisSolicitudesPorID();
    $("#nameUser").html(nameUser)
    $("#idUser").html(idUsuario)
    $(".foto-perfil").attr("src", `${rutaFotoPerfil}${userSession.photoProfile}`)
    // eventos
    $("#btn-logout").click(_ => {
        sessionStorage.removeItem("auth");
        window.location.href = "./page-login.html"
    })
    try {
        let res = await new CuentaBanco().obtenerCuentasBancoDeUsuario(idUsuario)
        showCuentas($("#sel2"), res)
        showCuentas($("#ctasRecepcion"), res)
        let activosDigitales = await roomsActivos.obtenerRoomsActivos();
        showActivosDigitales(activosDigitales)
        // eventos
        $("#check-valor-mrk").on('change', e => {
            if (e.target.checked) {
                let valorActivoActual = parseFloat($("#select_de > option:selected").attr("valor-mrk"))
                console.log(valorActivoActual)
                let format = (valorActivoActual>=1) ? valorActivoActual.toFixed(2) : valorActivoActual.toFixed(6)
                $("#in_valor_a").val(format)
            } else $("#in_valor_a").val('')
        })
        $("#select_de").on('changed.bs.select', e => {
            $("#in_valor_a").val('')
            $("#check-valor-mrk").prop("checked", false)
        })
    } catch(e) {console.log(e)}

    $("#select_valor").selectpicker('val', $('#select_valor option:contains('+userSession.money+')').val())
    btnEnviarCompra.addEventListener("click", enviarForm);
});

function enviarForm(e) {
    e.preventDefault();
    if (validarFormulario()) {
        let fechaFin = new Date()
        fechaFin.setMinutes(fechaFin.getMinutes() + parseInt($("#in_tiempo").val()))
        let idsMetodoPago = ''
        $("#sel2").selectpicker('val').forEach((v, i) => {
            idsMetodoPago += v
            if (i < $("#sel2").selectpicker('val').length - 1) {
                idsMetodoPago += ","
            }
        })
        let idsReceptores = '';
        $("#ctasRecepcion").selectpicker('val').forEach((v, i) => {
            idsReceptores += v
            if (i < $("#ctasRecepcion").selectpicker('val').length - 1) {
                idsReceptores += ","
            }
        })
        if (idsMetodoPago === '' || idsReceptores === '') {
            alert("Debe seleccionar una cuenta para transferencia y otra para recepción.")
            return
        }
        let ofertaCompra = {
            idUsuario: idUsuario,
            propuestas: 0,
            requerimientoDescripcion: $("#select_valor > option:selected").text(),
            valorEntregaDescipcion: $("#select_de > option:selected").text(),
            idRoomActivo: $("#select_de").selectpicker('val'), // guarda el id del activo
            origenReq: "AppCoin",
            receptores: $("button[data-id=ctasRecepcion]").attr('title'),
            requerimientoCantidad: $("#valor").val(),
            valorOfertadoXRequerimiento: $("#in_valor_a").val(),
            valorComisionDescripcion: "nada",
            valorComision: 0.0,
            emisorHash: "512 bits",
            tiempoDeseado: $("#in_tiempo").val(),
            estado: "Pendiente",
            tipoOperacion: "Solicitud compra",
            fechaInicio: new Date(),
            fechaFin: fechaFin,
            valorEntregaCantidad: $("#in_auto").html(),
            idsReceptores: idsReceptores,
            metodosPago: $("button[data-id=sel2]").attr('title'), 
            idsMetodoPago: idsMetodoPago
        }
        $("input[name='submit']").val("Enviando...");
        let solCompra = new SolicitudCompra(ofertaCompra);
        solCompra.crearSolicitudCompra()
        .then(data => {
            showData([data])
            cliente.emitirEvento("new", {idOrden: data.idOrden, idRoomActivo: data.idRoomActivo});
            cleanFormCompra()
        })
        .catch(err => {
            console.log(err)
            cleanFormCompra()
        })
        .then(cleanFormCompra)
    }
}

function getMisSolicitudesPorID() {
    let solicitud = new SolicitudCompra(null);
    solicitud.obtenerSolicitudesCompraPorID(idUsuario)
    .then(response => {
        notificador.obtenerNotificacionesPorIdUsuario(idUsuario)
        .then(notificador.mostrarNotificaciones).catch(_ => console.log(_))
        showData(response)
    })
    .catch(err => gestionarError(err))
}

function cleanFormCompra() {    /// limpiar formulario de solicitud compra
    $("form[name=form_crear]")[0].reset();
    $("input[name='submit']").val("Enviar");
    $(".modal").modal('hide')
    $(".default-select").selectpicker('val', '')
    $("#in_auto").html("")
}

function showActivosDigitales(data) {
    if (data.length == 0) return
    let cmbCrypto = $("#select_de")
    data.forEach(d => {
        let option = `<option value="${d.idRoomActivo}" valor-mrk="${d.precioReferente}">${d.nombre}</option>`
        $(cmbCrypto).append(option)
    })
    $(cmbCrypto).selectpicker('refresh')
}

function showData(data) {
    if (!data.length || data.length == 0) {
        let card = cardNoData.replace(/@mensaje/g, "No has creado ninguna solicitud de compra.");
        card = card.replace(/@valueButton/g, "Crear mi primera solicitud");
        card = card.replace(/@link/g, "javascript:$('#btnSolicitar').click()")
        $("#navpills-1").prepend(card)
        return;
    }
    $("#noData").remove();
    $("#lastID").val(data[data.length - 1].idOrden)
    for (let item of data) {
        let primerHijo = $("#navpills-1:first-child")
        let newItem = solicitudComponent;
        newItem = newItem.replace(/@idSolicitudCompra/g, item.idOrden)
        newItem = newItem.replace(/@reqCantidad/g, item.requerimientoCantidad)
        newItem = newItem.replace(/@requerimientoDescripcion/g, item.requerimientoDescripcion)
        newItem = newItem.replace(/@calificacion/g, item.calificacionUsuario)
        newItem = newItem.replace(/@metodosPago/g, item.metodosPago)
        newItem = newItem.replace(/@origenReq/g, item.origenReq)
        newItem = newItem.replace(/@valorEntregaDescripcion/g, item.valorEntregaDescipcion)
        newItem = newItem.replace(/@valorOfertadoReq/g, item.valorOfertadoXRequerimiento)
        newItem = newItem.replace(/@valorEntregaCantidad/g, item.valorEntregaCantidad)
        newItem = newItem.replace(/@vistas/g, item.visto)
        newItem = newItem.replace(/@usuario/g, nameUser)
        newItem = newItem.replace(/@receptores/g, item.receptores)
        newItem = newItem.replace(/@propuestas/g, item.propuestas)
        newItem = newItem.replace(/@paginaOfertada/g, `./comprador_orden.html?idOrden=${item.idOrden}`)
        newItem = newItem.replace(/@mnd/g, item.valorEntregaDescipcion.toLowerCase()+".png")
        newItem = newItem.replace(/@title/g, `Ver`)

        if ($("#navpills-1").children() > 1) {
            $(newItem).insertBefore(primerHijo) // insert antes del primer hijo
        } else {
            $("#navpills-1").prepend(newItem) // insert al inicio
        }
        $("#delete_solicitud_"+item.idOrden).on('click', async  e => {
            if(!confirm("¿Esta seguro?")) return false
            try {
                $("body").css("opacity", "0.5")
                let res = await new SolicitudCompra().eliminarSolicitudCompra(item.idOrden)
                if (res != "") $("#"+item.idOrden).remove()
                showData([])
            } catch(e) { alert(e.statusText) }
            $("body").css("opacity", "1")
        })
    }
}

function showCuentas(elemento,ctas) { 
    if (ctas.length == 0) {
        $("#no-cuentas").html("No tiene cuentas registradas para poder operar. Necesita como mínimo 2 cuentas: una bancaria y una wallet.")
        $("#no-cuentas").html($("#no-cuentas").html() + " Para crear sus cuentas haga click <a style='text-decoration: underline !important' class='text-secondary' href='./profile.html#panel_cuentas'>AQUÍ</a>.")
        $("#enviarCompra").hide()
    }
    let optionsSelect = {
        "noneSelectedText": 'Seleccione al menos uno',
        'showSubtext' : true,
        'showContent': false,
    }
    $(elemento).selectpicker(optionsSelect)
    var myDefaultWhiteList = $.fn.selectpicker.Constructor.DEFAULTS.whiteList;
    //To allow data-custom for span elements
    myDefaultWhiteList.span = ['data-custom'];  
    ctas.forEach(c => {
        let option = $('<option/>', {
            'value': c.idCuenta,
            'html': `${c.nombreBanco}`,
            'data-content': `<strong>${c.descripcionCuenta}</strong><br/><span>${c.nombreBanco}</span>` 
        })
        $(elemento).append(option)
    })
    
    $(elemento).selectpicker("refresh")
    $($(elemento).attr("id") + " ~ button").addClass("p-1")
}

function gestionarError(xhr) {
    let errorInfo = alertErrorRequest;
    if (xhr.status == 400) {
        errorInfo = errorInfo.replace("@codigo", xhr.status)
        errorInfo = errorInfo.replace("@mensaje", xhr.statusText + ": No se pudo obtener la información requerida. Intente recargar la página.")
      } else if (xhr.status == 500) {
        errorInfo = errorInfo.replace("@codigo", xhr.status)
        errorInfo = errorInfo.replace("@mensaje", xhr.statusText + ": Problemas en el servidor al procesar la respuesta.")
      } else {
        errorInfo = errorInfo.replace("@codigo", xhr.status)
        errorInfo = errorInfo.replace("@mensaje", xhr.statusText)
      }
      $("#errorData").html(errorInfo);
}

// eventos websocket
cliente.socket.on('update', (data) => {
    console.log(data)
    $(`#propuesta_${data.idOrden}`).html(data.propuesta)
    notificador.obtenerNotificacionesPorIdUsuario(idUsuario)
    .then(notificador.mostrarNotificaciones).catch(_ => console.log(_))
})
cliente.socket.on('cambioEstadoOferta', _ => {
    notificador.obtenerNotificacionesPorIdUsuario(idUsuario)
    .then(notificador.mostrarNotificaciones).catch(_ => console.log(_))
})
cliente.socket.on('visto', data => $(`#visto_${data.idOrden}`).html(data.incremento))
cliente.socket.on('chat-message', _ => {
    console.log(_)
    notificador.obtenerNotificacionesPorIdUsuario(idUsuario)
    .then(notificador.mostrarNotificaciones).catch(_ => console.log(_))
})
cliente.socket.on('error', (err) => console.log('error', err));
