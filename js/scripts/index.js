import { CuentaBanco } from './datos_db/cuenta_banco.js';
import { MediosPago } from './datos_db/mediosPago.js';
import { OfertaModelo } from './datos_db/oferta_modelo.js';
import { RoomsActivos } from './datos_db/rooms_activos.js';
import { SolicitudCompra } from './datos_db/solicitud_compra.js';
import { SolicitudOfertada } from './datos_db/solicitud_ofertada.js';
import { Transaccion } from './datos_db/transaccion.js';
import { UsuarioModelo } from './datos_db/usuarioModelo.js';
import { validarCuenta, cerrarSession } from './helper/validarCuenta.js';
import { blobToBase64 } from './helper/visorImagen.js';
import {
    alertaComponent,
    cardNoData, oferComponent, solComponent
} from './HTMLComponents/components.js';
import { notificador } from './notificaciones.js';
import { validarForm2 } from "./validador.js";
import { URL_BASE } from './vars.js';
import { WebSocketClient } from './web_socket_client.js';
// import react react-dom
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './solana-devtools/buttonConnect'

// my component react
//import { MyComponent } from './HTMLComponents/react_component'

// inicio de prueba con reactJS
/*const UIManager = {
    getColor: function (parent, callback) {
        callback($("#oferCount").css('background-color'), parent)
    },
    setColor: function (name) {
        $("#oferCount").css('background-color', name);
    }
}; */
/// fin de objeto de prueba

let nota = `Presione el botón <strong>Pagar, siguiente</strong> solo si está seguro de haber realizado`
nota += ` la transacción de pago, en caso contrario, si lo oprime sin haber realizado el pago `
nota += `será sancionado.`
var currentOrder = null;
const transaccion = new Transaccion()
const modelo = new UsuarioModelo()
let cronometro = null
const medioPago = new MediosPago()
let divNoData;
if (sessionStorage.getItem("auth") === "null" || !sessionStorage.getItem("auth")) {
    window.location.href = "./page-login.html"
}
let userSession = sessionStorage.getItem("auth")
userSession = JSON.parse(userSession)
let idUsuarioLogeado = userSession.userId
let nameUser = userSession.userName
const cliente = new WebSocketClient(idUsuarioLogeado);
let idOfertante = null, idTransaccionActual = null
let rutaFotoPerfil = URL_BASE
const activos = new RoomsActivos()
const solicitudCompra = new SolicitudCompra(null)

// función LOAD
$(async function () {
    $("#mensajeRegistro").on("hidden.bs.modal", () => window.location.href = window.location.origin)
    modelo.consultarEstadoCuentaUsuario(userSession.email)
    .then(estadoUsuario => {
        if (estadoUsuario === 0) {  // estado 0 = no activado
            $("#mensajeRegistro").modal("show")
            $("#btn-validar").click(validarCuenta)
        }
    })

    $("#idUser").html(idUsuarioLogeado)
    $("#nameUser").html(nameUser)
    $("img.foto-perfil").attr("src", `${rutaFotoPerfil}${userSession.photoProfile}`)
    notificador.obtenerNotificacionesPorIdUsuario(idUsuarioLogeado)
        .then(notificador.mostrarNotificaciones).catch(_ => console.log(_))

    $("#btn-logout").click(_ => {
        sessionStorage.removeItem("auth");
        sessionStorage.removeItem("token");
        window.location.href = "./page-login.html"
    })
    try {
        await obtenerMediosPago("0")   // traer datos de medios de pago.
        let pagoPreferido, pagoPreferidoText, recibeEn, recibeEnText
        if (!userSession.pagoPreferido && !userSession.recibeEn) {
            pagoPreferido = $(`#cmbPagos > option[data-todos='${userSession.country}']`).val()
            pagoPreferidoText = "Todos / " + userSession.country
            recibeEn = $(`#cmbRecibos>option[data-todos='${userSession.country}']`).val()
            recibeEnText = "Todos / " + userSession.country
        } else {
            if (userSession.pagoPreferido.includes("Todos /")){
                let pActual = userSession.pagoPreferido.split("/")[1].trim()
                pagoPreferido = $(`#cmbPagos>option[data-todos='${pActual}']`).val()
                pagoPreferidoText = userSession.pagoPreferido
            } else {
                pagoPreferido = $(`#cmbPagos>option:contains('${userSession.pagoPreferido}')`).val()
                pagoPreferidoText = $(`#cmbPagos>option[value='${pagoPreferido}']`).text()
            }  
            if (userSession.recibeEn.includes("Todos /")) {
                let pActual = userSession.recibeEn.split("/")[1].trim()
                recibeEn = $(`#cmbRecibos>option[data-todos='${pActual}']`).val()
                recibeEnText = userSession.recibeEn
            } else {
                recibeEn = $(`#cmbRecibos>option:contains(${userSession.recibeEn})`).val()
                recibeEnText = $(`#cmbRecibos>option[value='${recibeEn}']`).text()
            }      
        }

        $("#cmbPagos").selectpicker('val', pagoPreferido);
        $("#cmbRecibos").selectpicker('val', recibeEn);
        userSession.pagoPreferido=pagoPreferidoText
        userSession.recibeEn=recibeEnText
        sessionStorage.setItem("auth", JSON.stringify(userSession))
        mostrarDatosAPI(await solicitudCompra.
            obtenerSolicitudesCompraDisponibles(idUsuarioLogeado, userSession.preferencias, 
                pagoPreferidoText, recibeEnText))

        let solicitudOfertada = new SolicitudOfertada({ id: idUsuarioLogeado })
        showOfertadas(await solicitudOfertada.getSoliOfertadas())
        
        showActivosEnPreferencias(await activos.obtenerRoomsActivos())
        // EVENTO CHANGE PARA SELECCIONAR CADA ACTIVO PREFERIDO
        $(".checks-activos").on('change', e => {
            if (e.target.checked) {
                $(`label[for=${e.target.id}]`).addClass("border-1 border-primary text-primary")
                agregarActivosSeleccionados("data-selected", "data-id", e.target)
                agregarActivosSeleccionados("data-names", "id", e.target)
            } else {
                $(`label[for=${e.target.id}]`).removeClass("border-1 border-primary text-primary")
                eliminarActivosSeleccionados("data-selected", "data-id", e.target)
                eliminarActivosSeleccionados("data-names", "id", e.target)
            }
        })
        // validar preferencias
        if (userSession.preferencias == "") $("#modal-preferencias").modal('show')
        else {
            let pref = userSession.preferencias.split(",")
            pref.forEach(p => {
                let check = $(`input[data-id=${p}]`)
                $(check).prop("checked", true)
                $(check).change()
            })
            $("#cBusqueda").val($("#row").attr("data-names").substring(0, 
                $("#row").attr("data-names").length - 1))
        }
    }catch(e){ console.log("Linea 94",e.statusText||e) }

    $(".star").each((_, elem) => $(elem).click(onClickStar2))
    $("#btnCalificar").click(alCalificar2)
    $("#modal_pago").on('hidden.bs.modal', onHiddenModal)
    $("#sendMessageModal2").on('show.bs.modal', verificarCuentasUsuario)
    $("#btnGuardarPreferencia").on('click', onGuardarPreferencias)
    $("#cmbPagos").on('changed.bs.select', cambiaValorCmbPagos)
    $("#cmbRecibos").on('changed.bs.select', cambiaValorCmbPagos)
    // prueba
    $("#send-message").click(enviarMensajeChat)
    $("#text-message").keypress(enviarMensajeChatConENTER)
    $("#send-image").change(enviarMensajeChat)

    /*setTimeout(function()  {*/
    let root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
        React.createElement(App /*, { context: UIManager }*/)
    )
    /*}, 0)*/
});

// funciones para renderizar en la GUI
function cleanFormOferta() {
    $("form[name='form_vender']")[0].reset()
    $("#vender").val("Enviar")
    $(".modal").modal('hide')
}

function crearAlerta(count) {
    let ale = alertaComponent
    ale = ale.replace(/@count/g, count)
    return ale;
}

function crearBotonesPago() {
    return `<div class="d-flex justify-content-center" tabindex="0">
      <button id="btnCancelar" type="button" class="btn btn-warning light mr-2">Cancelar</button>
      <button id="siguiente" type="button" class="btn btn-success" >Pagar, siguiente</button>
  </div>`
}

function mostrarDatosCuenta(res) {
    let html = `<div style='height: 150px;overflow-y: scroll;'>`
    console.log(res)
    if (res.length || res.length > 1) {
        res.forEach((elem) => {
            html += `<div class="chat-list-area" style='margin-right:.5em;margin-bottom: .5rem;padding: 0.5rem; border-bottom: 1px solid #ccc;'><div class="info-body">`
            html += `<div class="d-flex">`
            html += `<h7 class="text-black user-name mb-0 font-w600 fs-14">`
            html += `<font style="vertical-align: inherit;">`
            html += `   <font style="vertical-align: inherit;">${elem.nombreBanco}</font>`
            html += `</font>`
            html += `</h7></div>`
            html += `<p class="fs-14">Alias: <strong>${elem.descripcionCuenta}</strong></p>`
            if (elem.tipoCuenta == 0) {
                html += `<p class="fs-14">Número de cuenta: <span>${elem.numeroCuenta}</span></p>`
                html += `<p class="fs-14">Cédula: <span>${elem.cedula}</span></p>`
                html += `<p class="fs-14">Nombre del titular: <span>${elem.nombrePropietario}</span></p>`
            } else {
                html += `<p class="fs-14">Dir. Wallet: <br><span >${elem.numeroCuenta}</span></p>`
            }
            html += `</div></div>`
        })
        html += `</div>`
        html += `<div class='card mb-3'>`
        html += `<div class='card-header border-0 pl-3 pt-3 pr-3 pb-0'><h5 class='card-title text-danger'>Nota</h5></div>`
        html += `<div class='card-body p-3'>`
        html += `<p class='card-text text-muted'>${nota}</p>`
        html += `</div>`
        html += `</div>`
        html += crearBotonesPago()
        $("#realiza_pago").html(html)
    }
}

function mostrarDatosEnFormDePago(oferta) {
    $("#cantidad").html(`${oferta.cantidadRequerimiento} ${oferta.descripcionValorOferta}`)
    $("#modena_compra").html(`${oferta.valorEntregadoDescripcion}`)
    $("#precio").html(`${oferta.valorOferta} ${oferta.descripcionValorOferta}`)
    let recibe = oferta.cantidadRequerimiento / oferta.valorOferta
    recibe = (recibe >= 1) ? recibe.toFixed(2) : recibe.toFixed(6)
    $("#recibe").html(`${recibe} ${oferta.valorEntregadoDescripcion}`)
}

function showActivosEnPreferencias(activos) {
    let tamanio = activos.length
    let centro = Math.floor(tamanio / 2).toFixed(0)
    let columna1 = $("<div/>", {
        'class': 'col-md-6'
    })
    let columna2 = $("<div/>", {
        'class': 'col-md-6'
    })
    let row = $("#row")
    $(row).append(columna1).append(columna2)
    activos.forEach((ac, i) => {
        let elemento = `<div>
        <label for="${ac.nombre}" class="badge p-1" style="cursor:pointer">
            <img width="32" src='${rutaFotoPerfil}${ac.icono}' /> ${ac.nombre}
        </label>
        <input type="checkbox" class="checks-activos d-none" id="${ac.nombre}" data-id="${ac.idRoomActivo}" />
        </di>`;
        if (i <= centro) {
            $(columna1).append(elemento)
        } else {
            $(columna2).append(elemento)
        }
    })
}

/**
 * @param { Array } data 
 * @param { Boolean } esPaginacion 
 */
function showData(data, esPaginacion=false) {
    divNoData = $("#noData").remove();
    for (let item of data) {
        let lastId = item.idOrden;
        if (parseInt($("#lastID").val()) < parseInt(lastId)) $("#lastID").val(lastId);
        let primerHijo = $("#navpills-1:first-child")
        let es_ofertado = (item.estado !== null) ? true : false;
        let valor = item.valorEntregaCantidad
        let newItem = solComponent;
        newItem = newItem.replace(/@idOrden/g, item.idOrden)
        if (item.opConcretadas != 0) newItem = newItem.replace(/@op/g, item.opConcretadas)
        else newItem = newItem.replace(/@op/g, 0)
        newItem = newItem.replace(/@idOferta/g, item.idOferta)
        newItem = newItem.replace(/@receptores/g, item.receptores)
        newItem = newItem.replace(/@nombreUsuario/g, item.nombreUsuario)
        newItem = newItem.replace(/@origenReq/g, notificador.formatearFecha(item.fechaInicio))
        newItem = newItem.replace(/@valorEntregaDescipcion/g, item.valorEntregaDescipcion)
        newItem = newItem.replace(/@requerimientoCantidad/g, item.requerimientoCantidad)
        newItem = newItem.replace(/@requerimientoDescripcion/g, item.requerimientoDescripcion)
        newItem = newItem.replace(/@idUsuario/g, item.idUsuario)
        newItem = newItem.replace(/@valorOfertadoXRequerimiento/g, item.valorOfertadoXRequerimiento)
        newItem = newItem.replace(/@valorEntregaCantidad/g, (valor < 1) ? valor.toFixed(6) : valor.toFixed(2))
        newItem = newItem.replace(/@stars/g, item.calificacionUsuario/* _showCalf(item.calificacionUsuario) */)
        newItem = newItem.replace(/@metodosPago/g, item.metodosPago)
        newItem = newItem.replace(/@estado/g, item.estado)
        newItem = newItem.replace(/@idChat/g, item.idChat)
        newItem = newItem.replace(/@foto/g, item.fotoPerfilUsuario)
        newItem = newItem.replace(/@pais/g, item.pais)
        newItem = newItem.replace(/@mnd/g, item.valorEntregaDescipcion.toLowerCase())
        
        if ($("#navpills-1").children() > 1) $(newItem).insertBefore(primerHijo);
        else if (esPaginacion) {$("#navpills-1").append(newItem);console.log(item)}
        else $("#navpills-1").prepend(newItem)

        if (es_ofertado) {
            $(`#vender_${item.idOrden}`).hide();
            $(`#oferta_${item.idOrden}`).show();
        } else {
            $(`#vender_${item.idOrden}`).show();
            $(`#oferta_${item.idOrden}`).hide();
        }
        if (item.estado == "aceptada" || item.estado == "cancelada"
            || item.estado == "denunciada" || item.idChat !== 0) {
                // $(`#sol_bolt_${item.idOrden}`).click(() => onClickDeOfertaAceptada(item))
            $(`#sol_bolt_${item.idOrden}`).click(() => onClickDeOfertaAceptada2(item.idOrden,item.idOferta,item.idUsuario))
        }

        mostrarEstadoOrden(item)
        $(`#vender_${item.idOrden}`).click((e) => cargarDatosForm(item, e))
    }
}

function showMessageReceived(msg, fechaHora, tipo) {
    let hora = formatearTiempoCrono(fechaHora.getHours(), fechaHora.getMinutes())
    let path = `${rutaFotoPerfil}/imgs_chat${msg}`
    // una prubea 
    let msgBox = (tipo === 0) ? `<a href='javascript:window.open(\"${path}\")'><img width='120' height='135' src='${path}'></a>` :
        msg;

    let component = `<div class="media mb-4 received-msg  justify-content-start align-items-start">
      <div class="image-bx mr-sm-3 mr-2">
        <img src="${$("#foto-oferta-actual").attr("src")}" alt="" class="rounded-circle img-1">
      </div>
      <div class="message-received">
        <p style="padding: 10px" class='mb-1'>${msgBox}</p>
        <span class="fs-12 text-black">${hora}</span>
      </div>
  </div>`
    $("#inbox").append(component)
}

function showMessageSent(msg, fechaHora, tipo) {
    let hora = formatearTiempoCrono(fechaHora.getHours(), fechaHora.getMinutes())
    let path = `${rutaFotoPerfil}/imgs_chat${msg}`
    let msgBox = (tipo === 0) ? `<a href='javascript:window.open(\"${path}\")'><img width='120' src='${path}'></a>` :
        msg;

    let component = `<div class="media mb-4 justify-content-end align-items-end">
      <div class="message-sent">
        <p style="padding: 10px" class='mb-1'>${msgBox}</p>
        <span class="fs-12 text-black">${hora}</span>
      </div>
      <div class="image-bx ml-sm-3 ml-2 mb-4">
        <img src="${$(".foto-perfil").attr("src")}" alt="" class="rounded-circle img-1">
      </div>
  </div>`
    $("#inbox").append(component)
}

function showMessagesChatDb(chat) {
    if (chat.length > 0) {
        for (let c of chat) {
            if (c.idUsuario == idUsuarioLogeado) {
                showMessageSent(c.msg, new Date(c.fechaHora), c.tipo);
            } else {
                showMessageReceived(c.msg, new Date(c.fechaHora), c.tipo)
            }
        }
        let inbox = document.getElementById("chartBox");
        inbox.scrollTop = inbox.scrollHeight
    }
}

function showOfertadas(data) {
    if (data.length <= 0) {
        let card = cardNoData
        card = card.replace(/@mensaje/g, "No has hecho ninguna oferta.");
        card = card.replace(/@valueButton/g, "Lanzar oferta!");
        card = card.replace(/@link/g, "javascript:$('#tabDisponibles').click()")
        $("#navpills-2").append(card)
        return false;
    }
    divNoData = $("#navpills-2 #noData").remove();
    $("#oferCount").html(data.length + Number.parseInt($("#oferCount").html()))
    $("#lastId_ofer").val(data[data.length - 1].idOferta)

    for (let item of data) {
        let primerHijo = $("#navpills-2:first-child")
        let valor = item.valorEntregaCantidad
        let newItem = oferComponent;
        newItem = newItem.replace(/@idOrden/g, item.idOrden)
        newItem = newItem.replace(/@idOferta/g, item.idOferta)
        newItem = newItem.replace(/@nombreUsuario/g, item.nombreUsuario)
        newItem = newItem.replace(/@foto/g, item.fotoPerfilUsuario)
        newItem = newItem.replace(/@origenReq/g, notificador.formatearFecha(item.fechaInicio))
        newItem = newItem.replace(/@receptores/g, item.receptores)
        newItem = newItem.replace(/@valorEntregaDescipcion/g, item.valorEntregaDescipcion)
        newItem = newItem.replace(/@requerimientoCantidad/g, item.requerimientoCantidad)
        newItem = newItem.replace(/@requerimientoDescripcion/g, item.requerimientoDescripcion)
        newItem = newItem.replace(/@idUsuario/g, item.idUsuario/* + "f"*/)
        newItem = newItem.replace(/@valorOfertadoXRequerimiento/g, item.valorOfertadoXRequerimiento)
        newItem = newItem.replace(/@valorEntregaCantidad/g, valor < 1 ? valor.toFixed(6) : valor.toFixed(2))
        newItem = newItem.replace(/@stars/g, item.calificacionUsuario)
        newItem = newItem.replace(/@mnd/g, item.valorEntregaDescipcion)
        newItem = newItem.replace(/@op/g, item.opConcretadas)
        newItem = newItem.replace(/@idChat/g, item.idChat)
        newItem = newItem.replace(/@pais/g, item.pais)
        if ($("#navpills-2").children() > 1) {
            $(newItem).insertBefore(primerHijo)
        } else {
            $("#navpills-2").prepend(newItem)
        }
        if (item.estado == "aceptada" || item.estado == "cancelada"
        || item.estado == "denunciada" || item.idChat !== 0){
            // $(`#ofer_bolt_${item.idOrden}`).click(() => onClickDeOfertaAceptada(item))
            $(`#ofer_bolt_${item.idOrden}`).click(() => onClickDeOfertaAceptada2(item.idOrden, item.idOferta, item.idUsuario))
            $(`div[id*='_bolt_${item.idOrden}'].power-ic`).css({'color': 'var(--secondary)'})
        }
        mostrarEstadoOrden(item)
    }
}
// fin funciones para renderizar en la GUI

// métodos de comunicación con el servidor **
function guardarFechaPagoVendedor(oferta) {
    let recibido = parseFloat(document.getElementById("recibe").innerHTML)
    //return;
    transaccion.guardarFechaPago(`fechaPagoVendedor`, {
        idOferta: oferta.idOferta, valRecibido: recibido
    }).then((res) => {
        gestionarRespuestaDePago(res, oferta)
        if (cronometro !== null) clearInterval(cronometro)
        cliente.emitirEvento("pagado", oferta)
    })
        .catch(gestionarErrorDePago)
}

function agregarActivosSeleccionados(atributo, valor, tagHtml) {
    let seleccionActual = $("#row").attr(atributo)
    $("#row").attr(atributo, seleccionActual + "" + tagHtml.getAttribute(valor)+",")
}

function eliminarActivosSeleccionados(atributo, atributo2, tagHtml) {
    let valActual = tagHtml.getAttribute(atributo2) + ","
    let seleccionActual = $("#row").attr(atributo)
    let nuevaSeleccion = seleccionActual.replace(valActual, "")
    $("#row").attr(atributo, nuevaSeleccion)
}

function guardarMensajeChat(chat) {
    transaccion.guardarMensajeChat(chat)
        .then(res => {
            chat.mensajes[0].msg = res.mensajes[0].msg
            cliente.emitirEvento("chat-message", chat)
            showMessageSent(res.mensajes[0].msg, new Date(res.mensajes[0].fechaHora), res.mensajes[0].tipo);
            let inbox = document.getElementById("chartBox");
            inbox.scrollTop = inbox.scrollHeight
            $("#text-message").val("");
        })
        .catch(err => console.log(err))
}

function incrementarVisto(res) {
    let solicitudCompra = new SolicitudCompra(null)
    res.forEach(elem => {
        solicitudCompra.incrementarCampoVisto(elem.idOrden, idUsuarioLogeado)
            .then(res =>
                emitirEventoVisto({ idOrden: elem.idOrden, idUser: elem.idUsuario, count: res }))
            .catch(err => console.log(err))
    })
}

function mostrarDatosAPI(response, esPaginacion = false) {
    if (response.length > 0) {
        showData(response, esPaginacion)
        let param = new URLSearchParams(location.search)
        $(`#sol_bolt_${param.get("notify")}`).click()
        return;
    }
    if (response.length == 0) {
        let card = cardNoData.replace(/@mensaje/g, "No hay solicitudes disponible por el momento.");
        card = card.replace(/@valueButton/g, "Disabled");
        card = card.replace(/@link/g, "javascript:void(0)")
        $("#navpills-1").prepend(card)
        $("#btnCard").hide()
    }
}

async function obtenerBilleteras() {
    try {
        let res = await medioPago.obtenerBilleteras()
        let cmbRecibos = $("#cmbRecibos")
        if (res.length) {
            let optionsSelect = {
                "noneSelectedText": 'Seleccione al menos uno',
                'showSubtext' : true,
                'showContent': false,
                //'width': "120px",
                'size': 10
            }
            $(cmbRecibos).selectpicker(optionsSelect)
            var myDefaultWhiteList = $.fn.selectpicker.Constructor.DEFAULTS.whiteList;
            //To allow data-custom for span elements
            myDefaultWhiteList.span = ['data-custom'];
            res.forEach(elem => {
                let red = Math.trunc(Math.random() * 255)
                let green = Math.trunc(Math.random() * 255)
                let blue = Math.trunc(Math.random() * 255)
                let option = $('<option/>', {
                    'value': elem.idBilletera,
                    'html': `${elem.nombre}`,
                    //"data-todos": `${(elem.nombreBanco.includes("Todos")) ? elem.inicialesPais : null}`,
                    'data-content': `<span style="display:inline-block;background-color: rgb(${red},${green}, ${blue});width:5px; height:14px"></span>&nbsp;<span>${elem.nombre}</span>` 
                })
                $(cmbRecibos).append(option)
            })
            $(cmbRecibos).selectpicker("refresh")
        }
    } catch(e) {console.log(e)}
}

async function obtenerMediosPago(tipo) {
    try{
        let res = await medioPago.obtenerMediosPago(tipo)
        let cmbPagos = $("#cmbPagos")
        let cmbRecibos = $("#cmbRecibos")

        if (res.length) {
            let optionsSelect = {
                "noneSelectedText": 'Seleccione al menos uno',
                'showSubtext' : true,
                'showContent': false,
                'size': 10
            }
            let optionsSelect2 = JSON.parse(JSON.stringify(optionsSelect))
            $(cmbPagos).selectpicker(optionsSelect)
            $(cmbRecibos).selectpicker(optionsSelect2)
            var myDefaultWhiteList = $.fn.selectpicker.Constructor.DEFAULTS.whiteList;
            //To allow data-custom for span elements
            myDefaultWhiteList.span = ['data-custom'];
            res.forEach(elem => {
                let red = Math.trunc(Math.random() * 255)
                let green = Math.trunc(Math.random() * 255)
                let blue = Math.trunc(Math.random() * 255)
                let option = $('<option/>', {
                    'value': elem.idBanco,
                    'html': `${elem.nombreBanco}`,
                    "data-todos": `${(elem.nombreBanco.includes("Todos")) ? elem.inicialesPais : null}`,
                    'data-content': `<span style="display:inline-block;background-color: rgb(${red},${green}, ${blue});width:5px; height:14px"></span>&nbsp;<span>${elem.nombreBanco}</span>` 
                })
                $(cmbPagos).append(option)
                /*if (!$(option).html().includes("/")) */
                $(cmbRecibos).append($(option)[0].outerHTML)
            })
            $(cmbPagos).selectpicker("refresh")
            $(cmbRecibos).selectpicker("refresh")
        }
    } catch(e) {console.log(e)}
}

// fin métodos de comunicación con el servidor

// controladores de eventos
async function alCalificar2() {
    let calificacion = $("#rango").attr("data-calificacion")
    let comentario = $("#comment").val()
    if (calificacion != 0) {
        let finalizaTransaccion = {
            idTransaccion: idTransaccionActual,
            idUsuario: idUsuarioLogeado,
            idOfertante: idOfertante,
            calificacion: calificacion,
            comentario: comentario,
            idOferta: $("#p_orden").attr("data-actual")
        }
        await transaccion.finalizarTransaccion(finalizaTransaccion)
        $(".star").css("color", "initial")
        $(".modal").modal('hide')
        $("#rango").attr("data-calificacion", 0)
        // emitir evento de finalizacion de transacción
        return
    }
}
/**
 * 
 * @param {Event} e 
 */
async function cambiaValorCmbPagos(e, clickedIndex, isSelected, previousValue) {
    let user = JSON.parse(sessionStorage.getItem("auth"))
    let optionSelected = $("#"+e.target.id + " > option:selected")
    let otraOpcionFiltro;
    let pagosTodos, recibeTodos
    if (e.target.id == "cmbPagos") {
        otraOpcionFiltro = $("#cmbRecibos > option:selected")
        user.pagoPreferido = $(optionSelected).html()
        user.recibeEn = $(otraOpcionFiltro).text()
        console.log(user.pagoPreferido);
        pagosTodos = $(optionSelected).attr("data-todos")
        recibeTodos = $(otraOpcionFiltro).attr("data-todos")
    } else  {
        otraOpcionFiltro = $("#cmbPagos > option:selected")
        user.pagoPreferido = $(otraOpcionFiltro).text()
        user.recibeEn = $(optionSelected).text()
        pagosTodos = $(otraOpcionFiltro).attr("data-todos")
        recibeTodos = $(optionSelected).attr("data-todos")
    }
    console.log(pagosTodos, " - ", recibeTodos)
    if (user.pagoPreferido.includes("Todos /")) 
        user.pagoPreferido = `Todos / ${pagosTodos}`
    if (user.recibeEn.includes("Todos /"))
        user.recibeEn = `Todos / ${recibeTodos}`
    
    sessionStorage.setItem("auth", JSON.stringify(user))
    // enviar los paramétros para la consulta de todos las órdenes
    $("#navpills-1").html("")
    let res = await solicitudCompra.obtenerSolicitudesCompraDisponibles(idUsuarioLogeado, 
        userSession.preferencias, user.pagoPreferido, user.recibeEn)
    if (res.length > 0) {
        showData(res)
    } else {
        let card = cardNoData.replace(/@mensaje/g, "No hay solicitudes disponible por el momento.");
        card = card.replace(/@valueButton/g, "Disabled");
        card = card.replace(/@link/g, "javascript:void(0)")
        $("#navpills-1").prepend(card)
        $("#btnCard").hide()
    }
}

async function cancelarTransaccion(idTran, idUsuario, idOferta, idOrden) {
    if (confirm(`¿Estás completamente seguro de cancelar esta transacción(id: ${idTran})?`)) {
        // paso 1: cambiar el estado de la transacción a CANCELADO=4
        try {
            let res = await transaccion.cambiarEstadoTransaccion(idTran, idOferta, idUsuarioLogeado)
            if (res) $(".estado_en_" + idOrden).html("Transacción cancelada.").addClass("text-muted")
            // paso 2: emitir el evento de cambio de estado, pasando el id de transacción
            let obj = {
                idTran: idTran,
                idReceptor: idUsuario,
                idOferta: idOferta,
                idOrden: idOrden,
                idEmisor: idUsuarioLogeado
            }
            cliente.emitirEvento("tran-cancel", obj)
            // paso 3: salir del popup
            $("#modal_pago").modal("hide")
        } catch (e) {
            cerrarSession(e)
        }
    }
}

function cargarDatosForm(item, e) {
    e.preventDefault();console.log(item.valorEntregaDescipcion)
    $("#titulo-activo").html("&nbsp;" + item.valorEntregaDescipcion)
    $("#idOrden").val(item.idOrden);
    $("#idOrden").attr("data-user-receptor", item.idUsuario)
    $("#moneda_origen").html(item.requerimientoDescripcion)
    $("#moneda").val(item.valorEntregaDescipcion);
    $("#in_a").val(item.valorOfertadoXRequerimiento);
    $("#in_solicitud").val(item.valorOfertadoXRequerimiento);
    $("#in_cantidad").val(item.requerimientoCantidad);
    $("#in_can_soli").val(item.requerimientoCantidad);
    $("#in_tiempo_res").val(item.tiempoDeseado);
}

async function enviarMensajeChat(e) {
    let msg = $("#text-message").val().trim();
    let tipo = 1 // texto
    if (this && this.files) {
        let b2 = await blobToBase64(e.target.files[0])
        msg = b2.split(",")[1]
        tipo = 0  // imagen
    }
    if ((msg !== "" && currentOrder != null) || $("#send-image")[0].files[0]) {
        let chat = {
            other: (currentOrder.idUsuario == undefined) ? currentOrder.idSolicitante : currentOrder.idUsuario,
            mensajes: [{ msg: msg, tipo: tipo }],
            idOferta: currentOrder.idOferta,
            idOrden: currentOrder.idOrden,
            yo: idUsuarioLogeado,
            origen: "vendedor:envia mensaje",
        };
        guardarMensajeChat(chat)
    }
}

function enviarMensajeChatConENTER(e) {
    let code = (e.keyCode ? e.keyCode : e.which)
    if (code == 13) {
        enviarMensajeChat(e);
        return false;
    }
}

async function onGuardarPreferencias() {
    $("body").css("opacity", 0.5)
    let selectIds = $("#row").attr("data-selected")
    let selectNombres = $("#row").attr("data-names")
    selectIds = selectIds.substring(0, selectIds.length - 1)
    selectNombres = selectNombres.substring(0, selectNombres.length - 1)
    $("#cBusqueda").val(selectNombres)
    
    await modelo.guardarPreferenciaDeActivos(selectIds, idUsuarioLogeado)
    userSession.preferencias=selectIds
    sessionStorage.setItem("auth",JSON.stringify(userSession))
    
    let compras = await solicitudCompra
        .obtenerSolicitudesCompraDisponibles(idUsuarioLogeado, selectIds, 
            $("#cmbPagos>option:selected").text(), $("#cmbRecibos>option:selected").text())
    $("#navpills-1 > div[id*='card_']").remove()
    $("#noData").remove()
    mostrarDatosAPI(compras)
    
    let solicitudOfertada = new SolicitudOfertada({ id: idUsuarioLogeado })
    $("#oferCount").html("0")
    $("#navpills-2 > div.card").remove()
    showOfertadas(await solicitudOfertada.getSoliOfertadas())
    
    $("body").css("opacity", 1)
    $("#modal-preferencias").modal('hide')
}

function onAlertClick() {
    $("#alerta strong").html(`Actualizando...`);
    let solicitud = new SolicitudCompra(null);
    let user = JSON.parse(sessionStorage.getItem("auth"))
    let pagoPreferido = user.pagoPreferido || "Todos / " + user.country
    let recibeEn = user.recibeEn || "Todos"

    solicitud.obtenerSolicitudesCompraDisponiblesPorIdOrden(idUsuarioLogeado, $("#lastID").val(),
        user.preferencias, pagoPreferido, recibeEn)
        .then(res => {
            showData(res);
            // incrementar visto por usuario a cada una de las nuevas ofertas.
            incrementarVisto(res)
            $(".alert").alert('close')
            $("#alerta").off("click")
            cliente.socket.emit('cerrarAlerta');
        })
        .catch(err => console.log(err))
}

function onClickStar2(e) {
    let parent = $(this).parent()
    let children = parent.children();

    let ci = 0
    $.each(children, (_, elem) => {
        if (e.target == elem) {
            ci = _
            $("#rango").attr("data-calificacion", ci + 1)
            return false;
        }
    })
    for (let i = ci; i >= 0; i--) {
        $(children[i]).css("color", "gold")
    }
    for (let i = ci + 1; i < children.length; i++) {
        $(children[i]).css("color", "initial")
    }
}

function onHiddenModal() {
    $("a[href='#espera_envio']").addClass("disabled")
    $("a[href='#califica']").addClass("disabled")
    $("a[href='#datos_pago']").click()
    // reset
    $("#mensaje_aviso h5").html("")
    //$("#realiza_pago").removeClass("active")
    //$("#califica").removeClass("active")
    if (cronometro != null) clearInterval(cronometro)
    $("span[id*='crono'").html("00:00")
    $("#inbox").html("")    // limpiamos la bandeja de chat cada vez que se cierra el popup
    $("#text-message").val("")
    $("#p_orden").attr("data-actual", 0)
}

var haConsultado = false
async function onScroll(e) {
    let diffHeight = $(document).height() - $(window).height()
    if ($(window).scrollTop() + 1 >= diffHeight && !haConsultado) {
        let divPills_1 = $("#myTabContent > div.active")[0];
        if(divPills_1.id !== "navpills-1") return
        haConsultado = true
        $(document.body).css({'opacity': 0.6})
        try {
            let filtro = userSession.preferencias
            let pagandoEn = JSON.parse(sessionStorage.getItem("auth")).pagoPreferido || "Todos"
            let recibeEn = JSON.parse(sessionStorage.getItem("auth")).recibeEn || "Todos"
            let res = await new SolicitudCompra(null)
                .obtenerSolicitudesCompraDisponiblesPorIdOrden(idUsuarioLogeado, 
                    $("#lastID").val(), filtro, pagandoEn, recibeEn)
            if (res.length > 0) mostrarDatosAPI(res, true) //showData(res, true)
        }catch(e) {
            console.log(e)
        }
        $(document.body).css({'opacity': 1})
        haConsultado = false;
    }
}

async function verificarCuentasUsuario() {
    try {
        let bco = new CuentaBanco()
        let res = await bco.obtenerNCuentasDeUsuario(idUsuarioLogeado)
        if (res < 2) {
            let span = `<i class='fa fa-warning align-self-center mr-2 text-warning' style="font-size:4em"> </i> 
                <span class="text-dark" style="flex: 0.8"><b style="font-size: 1em" class="text-danger">No tiene cuentas registradas</b><br>Necesita registrar una cuenta desde dónde envía los pagos y de dónde acepta pagos.
                <a style='text-decoration: underline !important' class='font-weight-bold text-secondary' href='./profile.html?tab=panel_cuentas'> Crear cuentas.</a></span>
            `
            $("#vender").hide()
            $("#no-cuentas").html(span)
        }
    }catch(e) {
        console.log(e)
    }
}
// fin controladores de eventos

// funciones de cronómetro
function iniciarCronometro(fechaInicio) {
    let fechaFuturo = new Date(fechaInicio)
    fechaFuturo.setMinutes(fechaFuturo.getMinutes() + 10) // momento en el debe finalizar.
    let fechaActual = new Date()
    if (fechaFuturo < fechaActual) { // fecha futuro anterior a fecha actual...
        clearInterval(cronometro)
        return
    }
    let diff = fechaFuturo - fechaActual
    let diffM = parseFloat(((diff / 1000) / 60).toFixed(2)) // obtiene minutos
    let diffS = Math.round((diffM % 1) * 60) // obtiene segundos

    let tiempo = new Date()
    tiempo.setMinutes(diffM)
    tiempo.setSeconds(diffS)
    let format = formatearTiempoCrono(diffM, diffS)
    $("#crono").html(format)
    $("#crono2").html(format)
    cronometro = setInterval(() => crearCronometro(tiempo), 1000)
}

function crearCronometro(tiempo) {
    let min = tiempo.getMinutes(),
        sec = tiempo.getSeconds();

    if ($("#crono").html() !== "00:00") {
        tiempo.setSeconds(sec - 1)
        let tiempoActual = formatearTiempoCrono(min, sec)
        $("#crono").html(tiempoActual)
        $("#crono2").html(tiempoActual)
        return
    }
    $("#crono").html("00:00")
    $("#crono2").html("00:00")
    clearInterval(cronometro)
}
// fin funciones de cronómetro

// Funciones para gestionar las respuestas y errores en las comunicaciones
function gestionarRespuestaDePago(res, oferta) {
    $("a[href='#califica']").removeClass("disabled").click()
    $("a[href='#realiza_pago']").addClass("disabled")
    $("#siguiente").attr("disabled", true) // desactiva el botón siguiente
}

function gestionarErrorDePago(err) {
    alert("Error al guardar la fecha del pago. Intente otra vez.")
}
// fin funciones para gestionar las respuestas y errores en las comunicaciones

// Controladores de eventos del websocket
function emitirEventoVisto(obj) {
    cliente.socket.emit('visto', obj)
}

function mostrarEstadoOrden(item, esSocket = false) {
    switch (item.estado) {
        case "favorito":
            $(`.estado_en_${item.idOrden}`).html(` Ha sido agregado a favoritos`)
            $(`.estado_en_${item.idOrden}`).css("color", "#68cf29")
            break;
        case "cancelada":
            $(`.estado_en_${item.idOrden}`).html(` Transacción cancelada`).addClass("text-muted")
            break;
        case "aceptada":
            $(`.estado_en_${item.idOrden}`).html(` Esta oferta ha sido aceptada`)
            $(`.estado_en_${item.idOrden}`).css("color", "green")
            $(`div[id*='_bolt_${item.idOrden}']`).css({'color':'var(--secondary)'})
            break;
        case "denunciada":
            $(`.estado_en_${item.idOrden}`).html(` Ha sido denunciado.`)
            $(`.estado_en_${item.idOrden}`).css("color", "red")
            break;
        case 'finalizado':
            $(`.estado_en_${item.idOrden}`).html(` El intercambio ha finalizado.`)
            $(`.estado_en_${item.idOrden}`).css("color", "salmon")
            $(`div[id*='_bolt_${item.idOrden}']`).css({'color':'var(--muted)'})
            $(`#ofer_bolt_${item.idOrden}`).off("click")
            $(`#sol_bolt_${item.idOrden}`).off("click")
            break;
    }
}

function onNewSolicitudCompra(data) {
    console.log(data)
    if (!userSession.preferencias.includes(data.idRoomActivo)) return
    if (cliente.io.id !== data.IDEmisor && $("#alerta").children().length === 0) {
        let alerta = crearAlerta(data.count)
        $("#alerta").html(alerta)
        $("#alerta").click(() => onAlertClick())
        return;
    }
    $("#notify").html(data.count)
}

function transaccionCancelada(data) {
    let actual = parseInt($("#p_orden").attr("data-actual"))
    if (data.idOferta !== actual) return;
    let popup = `<div id="m-aviso" class="modal fade bd-example-modal-sm" tabindex="-1" 
        role="dialog" style="display: none;" aria-hidden="true">
        <div class="modal-dialog modal-sm modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Aviso!</h5>
                    <button type="button" class="close" data-dismiss="modal"><span>×</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-2 align-self-center h1 mb-0">
                            <i class="text-warning fa fa-warning"></i>
                        </div>
                        <div class="col-md-10">
                            El usuario comprador a cancelado la oferta 
                            <b>#00${data.idOferta}</b>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-success" 
                        data-dismiss="modal">Aceptar</button>
                </div>
            </div>
        </div>
    </div>`
    $("body").prepend(popup)
    $("#btn-aviso").click()
    $("#m-aviso").css("z-index", "10000000")
    $("#modal_pago").css("opacity", "0.8")
    $("#m-aviso").on("hidden.bs.modal", _ => {
        $("#m-aviso").remove()
        $("#modal_pago").css("opacity", "1")
    })
    $(".estado_en_" + data.idOrden).html(" Transacción cancelada").addClass("text-muted")
    if ($("#p_orden").attr("data-actual") == data.idOferta) {
        $("a[href='#espera_pago']").removeClass("disabled").click()
        $("a[href='#califica']").addClass("disabled")
        $("a[href='#realiza_pago']").addClass("disabled")
        $("#mensaje_aviso h5").html("Esta transaccion ha sido cancelada.")
        $("#mensaje_aviso").addClass('d-flex').removeClass("d-none")
        $("#cargando").addClass("d-none").removeClass("d-block")
    }
    if (cronometro !== null && $("#p_orden").attr("data-actual") == data.idOferta) 
        clearInterval(cronometro)
}
// fin controladores de eventos del websocket

// Utils
function formatearTiempoCrono(min, sec) {
    let minutoActual = (min < 10) ? "0" + min
        : min;
    let segundoActual = (sec < 10) ? "0" + sec
        : sec;
    return minutoActual + ":" + segundoActual
}
// fin utils

$(window).on('scroll', onScroll)  // evento scroll

$("form[name='form_vender']").on('submit', (e) => {
    e.preventDefault();
    if (validarForm2()) {
        $("#vender").val("Enviando...")
        let fechaFin = new Date();
        fechaFin.setMinutes(fechaFin.getMinutes() + Number.parseInt($("#in_tiempo_res").val()))
        let objDatos = {
            idUsuario: idUsuarioLogeado,
            idOrden: $("#idOrden").val(),
            ofertasCol: "",
            descripcionValorOferta: $("#moneda_origen").html(),
            cantidadRequerimiento: $("#in_cantidad").val(),
            mensaje: "",
            estado: "ofertando",
            tipoOperacion: "Oferta",
            coincidencia: "",
            fechaInicio: new Date(),
            fechaFin: fechaFin,
            valorOferta: $("#in_a").val(),
            fotoPerfil: userSession.photoProfile,
            idOrdenCreacion: 0
        };
        
        let modelo = new OfertaModelo(objDatos);
        modelo.crearOferta(objDatos)
            .then((res) => {
                $(`#vender_${objDatos.idOrden}`).hide()
                $(`#oferta_${objDatos.idOrden}`).show()
                objDatos.receptor = $("#idOrden").attr('data-user-receptor')
                objDatos.propuesta = res.aux
                objDatos.idOferta = res.idOferta
                objDatos.requerimientoDescripcion = objDatos.descripcionValorOferta,
                objDatos.nombreUsuario = nameUser
                console.log(objDatos)
                // obtener la solicitudes ofertadas por el último id
                new SolicitudOfertada({ id: idUsuarioLogeado, lastID: $("#lastId_ofer").val() })
                    .getSoliOfertadasPorID().then(showOfertadas).catch(err => console.log(err))

                let notify = {
                    idNotificacion: 1,
                    idItemOperacion: objDatos.idOrden,
                    idUsuarioEmisor: objDatos.idUsuario,
                    idUsuarioReceptor: objDatos.receptor,
                    trigger: 2, // es oferta
                    operacion: "vendedor: ha ofertado"
                }
                notificador.guardarNotificaciones(notify).then(_ => cliente.emitirEvento('haOfertado', objDatos))
                  .catch(err => console.log(err))
            }).catch((err) => {
                cleanFormOferta()
            }).then(cleanFormOferta)
    }
});

cliente.socket.on('nuevaSolicitud', onNewSolicitudCompra)
cliente.socket.on('cambioEstadoOferta', data => {
    let eventsOrden = $._data($(`#sol_bolt_${data.idOrden}`)[0], 'events') 
    if (data.estado == "aceptada" && !eventsOrden) {
        $(`#sol_bolt_${data.idOrden}`).click(() => onClickDeOfertaAceptada2(data.idOrden, data.idOferta, data.idSolicitante))
        $(`#ofer_bolt_${data.idOrden}`).click(() => onClickDeOfertaAceptada2(data.idOrden, data.idOferta, data.idSolicitante))
    }
    mostrarEstadoOrden(data)
})
cliente.socket.on('ofertaIgnorada', (data) => mostrarEstadoOrden(data, true))

// ESCUCHA DEL EVENTO DEL SOCKET <PAGADO>....
cliente.socket.on('pagado', async (dat) => { // por evento que cambia estado de tran a 2.
    let actual = parseInt($("#p_orden").attr("data-actual"))
    if (dat.idOferta !== actual) return;

    $("a[href='#realiza_pago']").removeClass("disabled").click()
    $("a[href='#espera_pago']").addClass("disabled")
    $("a[href='#califica']").addClass("disabled")

    if (cronometro != null) clearInterval(cronometro) // detiene el cronómetro anterior.
    iniciarCronometro(dat.fechaPago)    // inicia cronómetro con la fecha de pago del comprador.
    try{
        let ctas = await new CuentaBanco().obtenerCuentasBancoPorIdOrden(dat.idOrden)
        $("#realiza_pago").html("")
        mostrarDatosCuenta(ctas)
    } catch(e) {console.log(e)}
    let newEmisor = dat.idReceptor // el receptor ahora es el emisor
    let newReceptor = dat.idEmisor // el emisor se convierte en receptor
    dat.idEmisor = newEmisor
    dat.idReceptor = newReceptor
    $("#siguiente").click(() => guardarFechaPagoVendedor(dat))
    let cEvents = null;
    if ($("#btnCancelar")) cEvents = $._data($("#btnCancelar")[0], 'events');
    console.log(cEvents)
    if (!cEvents && $("#btnCancelar")) {
        $("#btnCancelar").click(_ => cancelarTransaccion(dat.idTran, dat.idReceptor, dat.idOferta, dat.idOrden))
    }
})
cliente.socket.on("chat-message", (data) => {
    let actual = parseInt($("#p_orden").attr("data-actual"))
    let eventsOrden = $._data($(`#sol_bolt_${data.idOrden}`)[0], 'events')
    if (!eventsOrden) {
        $(`#sol_bolt_${data.idOrden}`).click(() => onClickDeOfertaAceptada2(data.idOrden, data.idOferta, data.yo))
        $(`#ofer_bolt_${data.idOrden}`).click(() => onClickDeOfertaAceptada2(data.idOrden, data.idOferta, data.yo))
        $(`div[id*='_bolt_${data.idOrden}'].power-ic`).css({'color': 'var(--secondary)'})
    }
    console.log(eventsOrden)
    if (data.idOferta != actual) return

    showMessageReceived(data.mensajes[0].msg, new Date(), data.mensajes[0].tipo)
    let inbox = document.getElementById("chartBox");
    inbox.scrollTop = inbox.scrollHeight
})
cliente.socket.on("update", _ => {
    // recargar el panel de notificaciones
    notificador.obtenerNotificacionesPorIdUsuario(idUsuarioLogeado)
        .then(notificador.mostrarNotificaciones).catch(_ => console.log(_))
})

cliente.socket.on('tran-cancel', transaccionCancelada)
cliente.socket.on('tran-finalizada', d => {
    $(`#sol_bolt_${d.idOrden}`).off("click")
    $(`#ofer_bolt_${d.idOrden}`).off('click')
    // agregar aquí el cambio de color al botón de chat en un futuro
    $(`.estado_en_${d.idOrden}`).html("Transacción finalizada").css("color", "salmon")
})
cliente.socket.on('error', (err) => console.log('error', err));

//  ==================== 
//  EXPERIMENTAL!! 
//  ====================
function gestionarEstadoTransaccion2(idOrden, idOferta, idSolicitante) {
    let compradorId = idSolicitante;
    transaccion.obtenerEstadoTransaccionPorIdOferta(idOferta, compradorId, idUsuarioLogeado, false)
        .then(res => {
            //console.log(res)
            idOfertante = compradorId
            idTransaccionActual = (res.transaccion) ? res.transaccion.idTransaccion : null
            console.log(compradorId)
            $("#chatDest").html($("span[data-userId='" + compradorId + "']").html())
            $("#name-comprador").html("a "+$("#chatDest").html())
            // $("#p_orden").html(`#00${data.idOrden}`).attr("data-actual", data.idOferta)
            $("#p_orden").html(`#00${idOrden}`).attr("data-actual", idOferta)
            let foto = (!$(`#solicitud_${idOrden}`).attr('data-ip')) ? $(`div[id*='_${idOrden}']`).attr("data-ip"): 
                $(`#solicitud_${idOrden}`).attr('data-ip');
            $("#foto-oferta-actual").attr('src',  URL_BASE + foto)
            showMessagesChatDb(res.chat)
            mostrarDatosCuenta(res.ctas)  // muestra los datos de la cuenta del comprador
            switch (res.transaccion.estado) {
                case 1:
                    $("a[href='#espera_pago']").removeClass("disabled").click()
                    $("a[href='#realiza_pago']").addClass("disabled")
                    $("a[href='#califica']").addClass("disabled")
                    $("#mensaje_aviso").addClass("d-none").removeClass("d-flex")
                    $("#cargando").addClass("d-block").removeClass("d-none")
                    // iniciar el cronómetro de 15 min. respecto a la fecha de inicio de la oferta
                    iniciarCronometro(res.transaccion.fechaInicioTransaccion)
                    break;
                case 2: // por estado de transacción
                    $("#mensaje_aviso").addClass("d-none").removeClass("d-flex")
                    if (cronometro != null) clearInterval(cronometro)
                    $("a[href='#realiza_pago']").removeClass("disabled").click()
                    $("a[href='#espera_pago']").addClass("disabled")
                    $("a[href='#califica']").addClass("disabled")
                    if (res.transaccion.fechaPagoComprador !== "0001-01-01T00:00:00")
                        iniciarCronometro(res.transaccion.fechaPagoComprador)
                    else
                        iniciarCronometro(res.transaccion.fechaInicioTransaccion)
                    let dataSocket = {
                        idEmisor: idUsuarioLogeado, idReceptor: compradorId,
                        // idOrden: data.idOrden, idOferta: data.idOferta
                        idOrden: idOrden, idOferta: idOferta
                    }
                    $("#siguiente").click(() => guardarFechaPagoVendedor(dataSocket))
                    $("#btnCancelar").click(() => cancelarTransaccion(res.transaccion.idTransaccion, compradorId,
                        /*dataidOferta, data.idOrden*/ idOferta, idOrden))
                    break;
                case 3:
                    $("a[href='#califica']").removeClass("disabled").click()
                    $("a[href='#espera_pago']").addClass("disabled")
                    $("a[href='#realiza_pago']").addClass("disabled")
                    $("#mensaje_aviso").addClass("d-none").removeClass("d-flex")
                    break;
                case 4:
                    $("a[href='#califica']").addClass("disabled")
                    $("a[href='#realiza_pago']").addClass("disabled")
                    $("#mensaje_aviso h5").html("Esta transaccion ha sido cancelada.")
                    $("#mensaje_aviso").addClass('d-flex').removeClass("d-none")
                    $("#cargando").addClass("d-none").removeClass("d-block")
                    $("a[href='#espera_pago']").removeClass("disabled").click()
                    break;
                case 5: 
                    $("a[href='#califica']").addClass("disabled")
                    $("a[href='#realiza_pago']").addClass("disabled")
                    let aviso = "Esta transacción ha sido cancelada."
                    if (res.transaccion.idUsuarioCancelado == idUsuarioLogeado) {
                        aviso += "<b class='text-danger'> Ha sido denunciado.</b>"
                    }
                    $("#mensaje_aviso h5").html(aviso)
                    $("#mensaje_aviso").addClass('d-flex').removeClass("d-none")
                    $("#cargando").addClass("d-none").removeClass("d-block")
                    $("a[href='#espera_pago']").removeClass("disabled").click()
                    break;
            }
        })
        .catch(err => console.log(err))
    $("#modal_pago").modal("show")
}

function onClickDeOfertaAceptada2(idOrden, idOferta, idSolicitante) {
    currentOrder = {
        idOrden: idOrden, 
        idOferta: idOferta, 
        idSolicitante: idSolicitante
    };
    new OfertaModelo(null).obtenerOfertaPorId(idOferta)
        .then(res => {
            //sessionStorage.setItem(data.idOferta, JSON.stringify(res))
            mostrarDatosEnFormDePago(res)
        })
        .catch(err => console.log("Error al intentar recuperar los datos de la oferta " + idOferta))
    //}
    gestionarEstadoTransaccion2(idOrden, idOferta, idSolicitante)
}