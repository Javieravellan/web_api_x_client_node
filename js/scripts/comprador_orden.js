import { solicitudComponent, itemTimeline, cardNoData } from './HTMLComponents/components.js'
import { SolicitudCompra } from './datos_db/solicitud_compra.js'
import { SolicitudOfertada } from './datos_db/solicitud_ofertada.js';
import { WebSocketClient } from './web_socket_client.js';
import { CuentaBanco } from './datos_db/cuenta_banco.js';
import { Transaccion } from './datos_db/transaccion.js';
import { notificador } from './notificaciones.js'
import { blobToBase64 } from './helper/visorImagen.js';
import { cerrarSession } from './helper/validarCuenta.js';
import { OfertaModelo } from './datos_db/oferta_modelo.js';
import { URL_BASE } from './vars.js';

const solicitudCompra = new SolicitudCompra(null)
var modeloOferta = new OfertaModelo();
const paramId = new URLSearchParams(location.search)

if (sessionStorage.getItem("auth") === "null" || !sessionStorage.getItem("auth")) {
    window.location.href = "./page-login.html"
}
let userSession = sessionStorage.getItem("auth")
userSession = JSON.parse(/*JSON.parse(*/userSession/*)*/)
let idUsuario = userSession.userId
let nameUser = userSession.userName
const cliente = new WebSocketClient(idUsuario);

const tran = new Transaccion()
let cronometro = null
// para probar el envío de mensajes por chat al destinatario correspondiente.
var currentOffer = null;
let nota = `Presione el botón <strong>Pagar, siguiente</strong> solo si está seguro de haber realizado`
nota += ` la transacción de pago, en caso contrario, si lo oprime sin haber realizado el pago `
nota += `será sancionado.`
let ordenActual = null
let idOfertante = null, idTransaccionActual = null
let rutaFotoPerfil = `${URL_BASE}`;
let cuentaBancos = new CuentaBanco()

$(function() {
    $(".disabled").attr("disabled", true)
    $("input[type=radio][name=opciones]").on('change', elegirOpcion)
    if (validarParametro(paramId.get("idOrden"))) {
        $("#nameUser").html(nameUser)
        $("#idUser").html(idUsuario)
        $(".foto-perfil").attr("src", `${rutaFotoPerfil}${userSession.photoProfile}`)
        let valorParametro = paramId.get("idOrden")
        solicitudCompra.obtenerSolicitudCompraPorId(valorParametro, idUsuario)
        .then(async response => {
            showData([response])
            $("#send-message").click(enviarMensajeChat)
            $("#text-message").keypress(enviarMensajeChatConENTER)
            $("#send-image").change(enviarMensajeChat)
            $("#modena_compra").html(ordenActual.valorEntregaDescipcion)
            obtenerOfertas(valorParametro, idUsuario)
            // obtener la cuenta receptora, es algo nuevo..
            let idReceptores = response.idsReceptores
            if (idReceptores.includes(",")) idReceptores = idReceptores.split(",")[0]
            let cta = await cuentaBancos.obtenerCuentaReceptoraPorId(idReceptores)
            cargarDatosCuentaReceptora(cta)
            // fin obtener la cuenta receptora.
            setTimeout(async () => {
                try {
                    let programadas = await modeloOferta.obtenerOfertasProgramadasDisponibles(
                        idUsuario, response.valorOfertadoXRequerimiento,
                        response.valorEntregaCantidad, 
                        response.valorEntregaDescipcion, response.idOrden,
                        response.requerimientoDescripcion
                    );
                    showOfertasProgramadas(programadas)
                } catch(e) {console.log(e)}
            }, 3000)
            // este método de llamada también en archivo independiente.
            notificador.obtenerNotificacionesPorIdUsuario(idUsuario)
            .then(res => {
                notificador.mostrarNotificaciones(res)
                if (window.location.href.includes("#item_")) {
                    $(`li[data-item-id=${valorParametro}]`).click()
                }
            }).catch(_ => cerrarSession(_))
            
            $("#btnCalificar").click(()=>alCalificar(response))
            $(".star").each((_, elem) => $(elem).click(onClickStar))
        })
        .catch(err => cerrarSession(err))
        $("#check_favorito").change(mostrarSoloFavoritos)
        $("#modal_tran").on('hidden.bs.modal', onHiddenModal)
        $("#btn-logout").click(_ => {
            sessionStorage.removeItem("auth");
            window.location.href = "./page-login.html"
        })
        return;
    }
    alert("No se encontró valor para el parámetro idOrden en la URL")
});

// FUNCIONES PARA RENDERIZAR LA GUI

/**
 * Muestra los datos en la ventana popup y verifica el estado de la transacción.
 * @param {*} oferta datos que se mostrarán en el popup
 */
async function cargarDatosEnFormularioDePago(oferta) {
    if (oferta.idOferta == 0) {
        let idObtenido = await new OfertaModelo(null).existeProgramada(ordenActual.idOrden, oferta.idUsuario)
        
        if (idObtenido !== 0){
            oferta.cantidadRequerimiento = parseFloat($("#valEntrega").html())
            oferta.valorOferta = $("#valor_xcu").html()
            oferta.descripcionValorOferta = oferta.requerimientoDescripcion
            oferta.idOferta = idObtenido
            console.log(oferta);
        }
        else {
            let fechaFin = new Date();
            fechaFin.setMinutes(fechaFin.getMinutes() + 30)
            let newOfer = {
                idUsuario: oferta.idUsuario,
                idOrden: ordenActual.idOrden,   // id de oferta actual
                descripcionValorOferta: oferta.requerimientoDescripcion,
                cantidadRequerimiento: parseFloat($("#valEntrega").html()),
                mensaje: "",
                estado: "ofertando",
                tipoOperacion: "Oferta",
                coincidencia: "",
                fechaInicio: new Date(),
                fechaFin: fechaFin,
                valorOferta: oferta.valorOfertadoXRequerimiento,
                receptores: oferta.receptores,
                idsReceptores: oferta.idsReceptores,
                idOrdenCreacion: oferta.idOrden
            };
            modeloOferta = new OfertaModelo(newOfer)
            try {
                oferta = await modeloOferta.crearOferta()
                oferta.requerimientoDescripcion = oferta.descripcionValorOferta;
                window.location.reload()
            }catch(e){alert(e.statusText)}
        }
    }
    currentOffer = oferta;
    $("#cantidad").html(`${oferta.cantidadRequerimiento} ${oferta.requerimientoDescripcion}`)
    $("#precio").html(`${oferta.valorOferta} ${oferta.descripcionValorOferta}`)
    let result = oferta.cantidadRequerimiento / oferta.valorOferta
    $("#recibe").html(`${result.toFixed(result >= 1 ? 2 : 6)} ${ordenActual.valorEntregaDescipcion}`)
    $("#div_empezar").html(`<button id="empezar_${oferta.idOferta}" class="btn btn-warning btn-sm">Aceptar</button>`)
    oferta.valorEntregadoDescripcion = ordenActual.valorEntregaDescipcion
    gestionarEstadoTransaccionPorIdOferta(oferta)
}

function cargarDatosCuentaReceptora(cta) {
    $("#direccion").html(cta.numeroCuenta)
    $("#red").html(cta.nombreBanco)
}

function crearBotonesPago() {
    return `<div class="d-flex justify-content-center" tabindex="0">
        <button id="btnCancelar" type="button" class="btn btn-warning light mr-2">Cancelar</button>
        <button id="siguiente" type="button" class="btn btn-success" >Pagar, siguiente</button>
    </div>`
}

function mostrarDatosCuenta(res) {
    let html = `<div style='height: 150px;overflow-y: scroll;'>`
    if(res.length || res.length > 1) {
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
        $("#datos_pago").html(html)
    }
}

function mostrarEnFavorito(idUsuario) {
    $(`#favorito_${idUsuario}`).removeClass("btn-outline-info")
    $(`#favorito_${idUsuario}`).addClass(!$(this).attr("data-favorito") ? "btn-info":"")
    $(`#favorito_${idUsuario}`).attr("disabled",true)
}

function mostrarSoloFavoritos(e) {
    if (e.target.checked) {
        $.each($("ul.timeline li[data-favorito]"), (_, li) => {
            if ($(li).attr("data-favorito") == "false") {
                $(li).hide(500)
            }
        })
    } else {
        $("li[id*=item_]").show(500)
    }
}

function showData(data) {
    if (data[0] == null) {
        let card = cardNoData.replace(/@mensaje/g, "No has creado ninguna solicitud de compra.");
        card = card.replace(/@valueButton/g, "Crear mi primera solicitud");
        card = card.replace(/@link/g, "javascript:$('#btnSolicitar').click()")
        //$("#navpills-1").prepend(card)
        return;
    }
    $("#noData").remove();
    $("#lastID").val(data[data.length - 1].idOrden)
    for (let item of data) {
        ordenActual = item  // asignamos la orden a una variable de scope global
        let primerHijo = $("#navpills-1:first-child")
        let newItem = solicitudComponent;
        newItem = newItem.replace(/@idSolicitudCompra/g, item.idOrden)
        newItem = newItem.replace(/@reqCantidad/g, item.requerimientoCantidad)
        newItem = newItem.replace(/@requerimientoDescripcion/g, item.requerimientoDescripcion)
        newItem = newItem.replace(/@calificacion/g, item.calificacionUsuario)
        newItem = newItem.replace(/@metodosPago/g, item.metodosPago)
        newItem = newItem.replace(/@origenReq/g, item.origenReq)
        newItem = newItem.replace(/@receptores/g, item.receptores)
        newItem = newItem.replace(/@valorEntregaDescripcion/g, item.valorEntregaDescipcion)
        newItem = newItem.replace(/@valorOfertadoReq/g, item.valorOfertadoXRequerimiento)
        newItem = newItem.replace(/@valorEntregaCantidad/g, item.valorEntregaCantidad)
        newItem = newItem.replace(/@vistas/g, item.visto)
        newItem = newItem.replace(/@usuario/g, item.nombreUsuario)
        newItem = newItem.replace(/@propuestas/g, item.propuestas)
        newItem = newItem.replace(/@paginaOfertada/g, `javascript:void(0)`)
        newItem = newItem.replace(/@title/g, `Finalizar`)
        // newItem = newItem.replace(/@foto/g, item.fotoPerfil)
        newItem = newItem.replace(/@mnd/g, item.valorEntregaDescipcion.toLowerCase()+".png")

        if ($("#navpills-1").children() > 1) {
            $(newItem).insertBefore(primerHijo) // insert antes del primer hijo
        } else {
            $("#navpills-1").prepend(newItem) // insert al inicio
        }
        // click para finalizar por completo la/as transacciones de está solicitud
        $(`#btnFinalizar${item.idOrden}`).click(()=>confirmarCierreOperacion(item.idOrden))
    }
}

function showOfertasParaEstaOrden(data) {
    data.forEach(elem => {
        let newItem = itemTimeline
        newItem = newItem.replace(/@nombreUsuario/g, elem.nombreUsuario)
        newItem = newItem.replace(/@idOferta/g, elem.idOferta)
        newItem = newItem.replace(/@idUsuario/g, elem.idUsuario)
        newItem = newItem.replace(/@valorOfertadoXRequerimiento/g, elem.valorOferta)
        newItem = newItem.replace(/@valorOfertadoDescripcion/g, elem.descripcionValorOferta)
        newItem = newItem.replace(/@requerimientoCantidad/g, elem.cantidadRequerimiento)
        newItem = newItem.replace(/@requerimientoDescripcion/g, elem.requerimientoDescripcion)
        newItem = newItem.replace(/@fechaInicio/g, notificador.formatearFecha(elem.fechaInicio))
        newItem = newItem.replace(/@fotoPerfil/g, rutaFotoPerfil + elem.fotoPerfil)
        newItem = newItem.replace(/@op/g, elem.opConcretadas)
        newItem = newItem.replace(/@stars/g, elem.calificacionUsuario)
        if (elem.estado == "favorito") {
            newItem = newItem.replace(/@clase/g, "btn btn-info btn-xxs")
            newItem = newItem.replace(/@favorito/g, true)
            newItem = newItem.replace(/@disabled/g, 'disabled')
        } else {
            newItem = newItem.replace(/@clase/g, "btn btn-outline-info btn-xxs")
            newItem = newItem.replace(/@favorito/g, false)
            newItem = newItem.replace(/@disabled/g, "")
        }

        if ($("#DZ_W_Todo3 > ul li:first-child").children().length > 0) {
            let firstChild = $("#DZ_W_Todo3 > ul li:first-child")
            $(newItem).insertBefore(firstChild)
        } else {
            $("#DZ_W_Todo3 > ul").prepend(newItem)
        }
        evaluarEstadoAceptada(elem);
        $(`#favorito_${elem.idUsuario}`).click(() => cambiarEstadoDeOferta(elem, "favorito"))
        $(`#rechazar_${elem.idUsuario}`).click(() => cambiarEstadoDeOferta(elem, "rechazada"))
        $(`#ver_${elem.idUsuario}`).click(() => cargarDatosEnFormularioDePago(elem))
    })
}

function showOfertasProgramadas(data) {
    if (data.length == 0) return;
    data.forEach(ovp => {
        let item = `<li id='item_${ovp.idUsuario}' style="transition: all ease-in-out .3s">
        <div class="timeline-panel p-2 mb-0">
            <div class="media mr-2">
            <img alt="imagen" width="50" src="${rutaFotoPerfil}${ovp.fotoPerfilUsuario}">
            </div>
            <div class="media-body">
            <h5 class="mb-1"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">${ovp.nombreUsuario} </font></font>
            <small class="text-muted"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">${notificador.formatearFecha(ovp.fechaInicio)}</font></font></small></h5>
            <p class="mb-0 font-w50"><font style="vertical-align: inherit;font-size: initial;"><font style="vertical-align: inherit;">Ofrece a ${ovp.valorOfertadoXRequerimiento} ${ovp.requerimientoDescripcion}. Valores entre ${ovp.minimo} y ${ovp.maximo} ${ovp.valorEntregaDescipcion}'s </font></font></p>
            <p class="mb-1"><font style="vertical-align: inherit;font-size: 12px;">
            <i class="fa fa-star fs-16" style="color: gold"></i>
            &nbsp;<b>${ovp.calificacionUsuario}.</b>
            <span>&nbsp;Transacciones <b>${ovp.opConcretadas}</b>
            </font>
            <font style="vertical-align: inherit;"></p>
            <a data-toggle="modal" data-target=".bd-example-modal-lg" href="javascript:void(0)" id='ver_${ovp.idUsuario}' class="btn btn-primary btn-xxs shadow"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Aceptar</font></font></a>
            <a href="javascript:void(0)" id='ofIgnorar_${ovp.idUsuario}' class="btn btn-outline-danger btn-xxs"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Ignorar</font></font></a>
            </div>
        </div>
        </li>`;
        $("#ul-programadas").prepend(item)
        // jugar con el botón de aceptar...
        $(`#ver_${ovp.idUsuario}`).on('click', () => {
            cargarDatosEnFormularioDePago(ovp);
        })
    })
    $("#contendedor-programadas").removeClass("d-none")
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
            if (c.idUsuario == idUsuario) { 
                showMessageSent(c.msg, new Date(c.fechaHora), c.tipo);
            } else {
                showMessageReceived(c.msg, new Date(c.fechaHora), c.tipo)
            }
        }
        let inbox = document.getElementById("chartBox");
        inbox.scrollTop = inbox.scrollHeight
    }
}

function transaccionCancelada(data) {
    let actual = parseInt($("#p_orden").attr("data-actual"))
    if (data.idOferta !== actual) return;
    let popupAviso = `<div id="m-aviso" class="modal fade bd-example-modal-sm" tabindex="-1" 
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
                        El usuario vendedor a cancelado la oferta número 
                            <b>#00${data.idOferta}</b>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-warning" 
                        data-dismiss="modal">Aceptar</button>
                </div>
            </div>
        </div>
    </div>`
    $("body").prepend(popupAviso)
    $("#btn-aviso").click() // con este botón, al hacer click, se abre el popup de aviso
    $("#m-aviso").css("z-index", "10000000")
    $("#modal_tran").css("opacity", "0.8")
    $("#m-aviso").on("hidden.bs.modal", _ => {
        $("#m-aviso").remove()
        $("#modal_tran").css("opacity", "1")
    })

    if ($("#p_orden").attr("data-actual") == data.idOferta) {
        $("a[href='#espera_envio']").addClass("disabled")
        $("a[href='#datos_pago']").addClass("disabled")
        $("a[href='#califica']").addClass("disabled")
        $("#mensaje_aviso2 h5").html(`Esta transaccion ha sido cancelada.
        <div>
            <a id="btnDenun" class="mt-2 btn btn-danger" href="javascript:void(0)">Denunciar</a>
        </div>`)
        $("#btnDenun").click(_ => denunciarTransaccion(data.idOferta, data.idTransaccion, 
            data.idEmisor))
        $("#mensaje_aviso2").addClass('d-block').removeClass("d-none")
        $("#s-info").addClass("d-none").removeClass("d-block")
        $("#splash").show()
    }
    if (cronometro !== null && $("#p_orden").attr("data-actual") == data.idOferta) 
        clearInterval(cronometro)
    $("#ver_"+data.idEmisor).html("Cancelada").addClass("btn-danger")
    .removeClass("btn-primary")
    $("#item_"+data.idEmisor).css("background-color", "#dedede")
}
// FIN DE FUNCIONES PARA RENDERIZAR GUI

// FUNCIONES PARA OBTENER O ENVIAR DATOS DEL SERVIDOR
function cambiarEstadoDeOferta(oferta, estado) {
    let solOfertada = new SolicitudOfertada(null)
    solOfertada.cambiarEstadoDeOfertaPorId({
        idOferta: oferta.idOferta, 
        estado: estado
    })
    .then(() => successCambioEstado(oferta, estado))
    .catch(err => console.log(err))
}

function gestionarEstadoTransaccionPorIdOferta(oferta) {
    tran.obtenerEstadoTransaccionPorIdOferta(oferta.idOferta, oferta.idUsuario, idUsuario, true)
    .then((res) => {
        idOfertante = oferta.idUsuario
        $("#foto-oferta-actual").attr("src", $(`#item_${idOfertante} img`).attr("src"))
        showMessagesChatDb(res.chat)
        idTransaccionActual = (res.transaccion) ? res.transaccion.idTransaccion : null
        $("#chatDest").html(oferta.nombreUsuario)
        $("#name-vendedor").html("a "+oferta.nombreUsuario)
        $("#p_orden").html(`#00${oferta.idOrden}`).attr("data-actual", oferta.idOferta)
        switch(res.transaccion.estado) {
            case 1:
                $("#splash").hide()
                mostrarDatosCuenta(res.ctas)
                $("#siguiente").click(() => guardarDatosPago(oferta))
                $("#btnCancelar").click((e) => cancelarTransaccion(res.transaccion.idTransaccion, 
                    oferta.idUsuario, oferta.idOferta, oferta.idOrden))
                $("#s-info").removeClass("d-none").addClass("d-block")
                $("#mensaje_aviso2").addClass('d-none').removeClass("d-block")
                $("#tab").show(300)
                $("a[href='#datos_pago']").removeClass("disabled").click()
                $("a[href='#espera_envio']").addClass("disabled")
                $("a[href='#califica']").addClass("disabled") 
                iniciarCronometro(res.transaccion.fechaInicioTransaccion)
                break;
            case 2:
                $("#splash").hide()
                $("#s-info").removeClass("d-none").addClass("d-block")
                $("#mensaje_aviso2").addClass('d-none').removeClass("d-block")
                mostrarDatosCuenta(res.ctas)
                $("#tab").show(300)
                $("a[href='#espera_envio']").removeClass("disabled").click()
                $("a[href='#datos_pago']").addClass("disabled")
                $("a[href='#califica']").addClass("disabled")
                $("#empezar_"+oferta.idOferta).attr('disabled', true)
                $("#indicador_carga").addClass("d-flex")
                .removeClass("d-none")
                // si no ha pagado, muestra cronometro fechaini, sino, muestra fechapagocompra
                if (res.transaccion.fechaPagoComprador !== "0001-01-01T00:00:00")
                    iniciarCronometro(res.transaccion.fechaPagoComprador)
                else
                    iniciarCronometro(res.transaccion.fechaInicioTransaccion)
                break;
            case 3:
                $("#splash").hide()
                $("#s-info").removeClass("d-none").addClass("d-block")
                $("#tab").show(300)
                $("a[href='#espera_envio']").addClass("disabled")
                $("a[href='#datos_pago']").addClass("disabled")
                $("a[href='#califica']").removeClass("disabled").click()
                break;
            case 4:
                $("a[href='#espera_envio']").addClass("disabled")
                $("a[href='#datos_pago']").addClass("disabled")
                $("a[href='#califica']").addClass("disabled")
                let sms = `Esta transaccion ha sido cancelada.`
                if (res.transaccion.idUsuarioCancelado != idUsuario) {
                    console.log(res.transaccion.idUsuarioCancelado, idUsuario)
                    sms += `<div><a id="btnDenun" class="mt-2 btn btn-danger" 
                        href="javascript:void(0)">Denunciar</a></div>`
                }
                $("#mensaje_aviso2 h5").html(sms)
                $("#btnDenun").click(_ => denunciarTransaccion(oferta.idOferta, 
                    idTransaccionActual, idOfertante))
                $("#mensaje_aviso2").addClass('d-block').removeClass("d-none")
                $("#s-info").addClass("d-none").removeClass("d-block")
                $("#splash").show()
                break;
            case 5:
                $("a[href='#espera_envio']").addClass("disabled")
                $("a[href='#datos_pago']").addClass("disabled")
                $("a[href='#califica']").addClass("disabled")
                let avisoDenuncia = `Esta transaccion ha sido cancelada. 
                    <b class="text-danger"> Y ya has puesto tu denuncia</b>`
                $("#mensaje_aviso2 h5").html(avisoDenuncia)
                $("#mensaje_aviso2").addClass('d-block').removeClass("d-none")
                $("#s-info").addClass("d-none").removeClass("d-block")
                $("#splash").show()
                break;
            default:    // si no hay estado, entonces mostramos de cero
                $("#s-info").removeClass("d-none").addClass("d-block")
                $("#mensaje_aviso2").addClass('d-none').removeClass("d-block")
                $("#tab").hide(300)
                obtenerCuentasDeBanco(oferta)
                $("#empezar_"+oferta.idOferta).click(() => onClickEnEmpezar(oferta))
                $("#splash").show()
                break;
        }
    })
    .catch(err => console.log(err))
}

function guardarDatosPago(oferta) {
    $("a[href='#espera_envio']")
    .removeClass("disabled")
    .click();
    $("a[href='#datos_pago']")
    .addClass("disabled")
    let recibido = parseFloat(document.getElementById("recibe").innerHTML)
    let data = {
        idOferta: oferta.idOferta,
        valRecibido: recibido
    }
    tran.guardarFechaPago(`fechaPagoComprador`, data)
    .then(res => {
        gestionarRespuestaDePago(res.idTran, oferta, res.fechaPago)
        if (cronometro != null) clearInterval(cronometro)
        iniciarCronometro(res.fechaPago)
    })
    .catch(gestionarErrorDePago)
    $("#siguiente").off("click")
}

function guardarMensajeChat(chat) {
    tran.guardarMensajeChat(chat)
    .then(res => {
        chat.idChat = res.idChat
        chat.mensajes[0].msg = res.mensajes[0].msg
        cliente.emitirEvento("chat-message", chat)
        showMessageSent(res.mensajes[0].msg, new Date(res.mensajes[0].fechaHora), res.mensajes[0].tipo);
        let inbox = document.getElementById("chartBox");
        inbox.scrollTop = inbox.scrollHeight
        $("#text-message").val("");
    })
    .catch(err => console.log(err))
}

function obtenerOfertas(idOrden, idUsuario) {
    let ofertada = new SolicitudOfertada({id: idOrden, idUsuario: idUsuario})
    ofertada.obtenerOfertasdeVentaParaUsuario()
    .then(response => {
        if (response.length > 0) {
            showOfertasParaEstaOrden(response)
            $("#ofertantes").children().length > 0 ? $("#caja_favorito").show() : $("#caja_favorito").hide()
        }
        if (!isNaN(paramId.get("notify"))) { // si viene de una redirección por notificación
            $(`#ver_${paramId.get("notify")}`).click()
        }
    })
    .catch(err => alert(err))
}

function obtenerCuentasDeBanco(oferta) {
    new CuentaBanco().obtenerCuentasSeleccionadasParaTransaccion(oferta.idUsuario, oferta.idOferta)
    .then(res => {
        mostrarDatosCuenta(res)
        $("#siguiente").click(() => guardarDatosPago(oferta))
    })
    .catch(err => alert(err))
}

function rechazarOferta(oferta) {
    let solicitud = new SolicitudCompra(null)
    solicitud.disminuirNumeroDePropuestasPorIdOrden(oferta.idOrden)
    .then(res => {
        $(`#item_${oferta.idUsuario}`).remove()
        $(`#propuesta_${oferta.idOrden}`).html(res)
    })
    .catch(err => console.log(err))
}
// FIN FUNCIONES PARA OBTENER O ENVIAR DATOS DEL SERVIDOR.

// CONTROLADORES DE EVENTOS DE LA GUI
async function alCalificar(data) {
    let calificacion = $("#rango").attr("data-calificacion")
    let comentario = $("#comment").val()
    if (calificacion != 0) {
        try {
            // guardar la calificación
            // vamos a incrementar el número de operaciones concretadas.
            let finalizaTransaccion = {
                idTransaccion: idTransaccionActual,
                idUsuario: idUsuario,
                idOfertante: idOfertante,
                calificacion: calificacion,
                comentario: comentario,
                idOrden: data.idOrden,
                idOferta: $("#p_orden").attr("data-actual")
            }
            //console.log(finalizaTransaccion); return;
            let res = await tran.finalizarTransaccion(finalizaTransaccion)
            if (!res) $(`#item_${idOfertante}`).remove()
            // emitir evento de finalizado
            cliente.emitirEvento('tran-finalizada', finalizaTransaccion)
            confirmarCierreOperacion(data.idOrden)
            $(".star").css("color", "initial")
            $("#modal_tran").modal('hide')
            $("#rango").attr("data-calificacion", 0)
        } catch(e) {
            console.log(e)
        }
        
    } else alert("La calificación es obligatoria.")
}

async function cancelarTransaccion(idTran, idUsuarioReceptor, idOferta, idOrden) {
    if (confirm(`¿Estás completamente seguro de cancelar esta transacción(id: ${idTran})?`)) {
        // paso 1: cambiar el estado de la transacción a CANCELADO=5
        try {
            let res = await tran.cambiarEstadoTransaccion(idTran, idOferta, idUsuario)
            if (res) $("#ver_"+idUsuarioReceptor).html("Cancelada").addClass("btn-danger")

            // paso 2: emitir el evento de cambio de estado, pasando el id de transacción
            cliente.emitirEvento("tran-cancel", {
                //idTran: idTran, 
                idReceptor: idUsuarioReceptor,
                idOferta: idOferta,
                idOrden: idOrden,
                idEmisor: idUsuario
            })
            // paso 3: salir del popup
            $("#modal_tran").modal("hide")
            .removeClass("btn-primary")
            $("#item_"+idUsuarioReceptor).css("background-color", "#dedede")
        } catch(e) {
            cerrarSession(e)
        }
    }
}

function confirmarCierreOperacion(idOrden) {
    if (confirm("¿Desea finalizar por completo la transacción de esta solicitud(verifique que no tenga más ofertas pendientes)?")) {
        console.log("Transacción finalizada por completo. Redireccionando...", idOrden)
        solicitudCompra.cambiarEstadoOrden(idOrden, "finalizado")
        .then(_ => {
            window.location.href = "./comprador.html"
        }).catch(err => console.log(err))
    }    
    //else
       // console.log("La transacción no ha finalizado por completo.", idOrden)
}

async function denunciarTransaccion(idOferta, idTransaccion, idVen) {
    try {
        $("body").css("opacity", "0.5")
        await tran.denunciarTransaccion(idOferta, idUsuario, idTransaccion)
        // emitir evento al denunciado.
        let elm = $("<p/>", {
            'style': 'color:var(--secondary); font-size: 10px',
            'html': 'Denuncia exitosa.'
        });
        console.log(elm)
        $("#btnDenun").hide()
        $("#mensaje_aviso2 h5").append(elm)
        // cambiar texto botón a denunciada
        $("#ver_"+idVen).html("Denunciada").addClass("btn-danger")
        .removeClass("btn-primary")
    }catch(e) { console.log(e);cerrarSession(e) }
    $("body").css("opacity", "1")
}

function elegirOpcion(e) {
    if (e.target.value == 1) {
        $(".disabled").attr("disabled", false)
    } else {
        $(".disabled").attr("disabled", true)
        $("#otraDireccion").val('')
    }
}
async function enviarMensajeChat(e) {
    let msg = $("#text-message").val().trim();
    let tipo = 1 // texto
    if (this && this.files) {
        let b2 = await blobToBase64(e.target.files[0])
        msg = b2.split(",")[1]
        tipo = 0  // imagen
    } 
    if ((msg !== "") || $("#send-image")[0].files[0]) {
        let chat = {
            other: currentOffer.idUsuario,
            mensajes: [{ msg: msg, tipo: tipo }],
            idOferta: currentOffer.idOferta,
            idOrden: currentOffer.idOrden,
            yo: idUsuario,
            origen: "comprador:envia mensaje"
        }
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

function evaluarEstadoAceptada(item) {
    if (item.estado == "aceptada") {
        $(`#rechazar_${item.idUsuario}`).hide()
        $(`#ver_${item.idUsuario}`).html("En proceso")
    } else if (item.estado == "denunciada") {
        $(`#rechazar_${item.idUsuario}`).hide()
        $(`#ver_${item.idUsuario}`).html("Denunciada").addClass("btn-danger")
        .removeClass("btn-primary")
        $("#item_"+item.idUsuario).css("background-color", "#dedede")
    } else if (item.estado == "cancelada") {
        $(`#rechazar_${item.idUsuario}`).hide()
        $(`#ver_${item.idUsuario}`).html("Cancelada").addClass("btn-warning")
        .removeClass("btn-primary")
        $("#item_"+item.idUsuario).css("background-color", "#dedede")
    }
}

async function onClickEnEmpezar(oferta) {
    $("#splash").fadeOut(300)
    $("#tab").show(300)
    $("a[href='#datos_pago']").removeClass("disabled").click()
    $("a[href='#espera_envio']").addClass("disabled")
    $("a[href='#califica']").addClass("disabled")
    $(`#ver_${oferta.idUsuario}`).html("En proceso")
    $(`#rechazar_${oferta.idUsuario}`).hide() // oculta botón rechazar
    // enviar nuevos datos solo si se seleccionó la opción 'otro'
    if ($("input[type=radio][name=opciones]").val() == 1
        && $("#cmbOtraRed").val() != "" && $("#otraDireccion").val().trim() != "") {
        const opcionSeleccionada = $("input[type=radio][name=opciones]").val()
        const nomCta = $("#cmbOtraRed").val()
        const dirCta = $("#otraDireccion").val().trim()
        let ok = await cuentaBancos.agregarNuevaCuentaReceptora(oferta.idOrden, opcionSeleccionada, nomCta, dirCta)
        if (ok != 1) {
            alert("Hubo un error al guardar la nueva cuenta. Intente otra vez")
            return;
        }
    }
    tran.crearTransaccionInicial({
        idOferta: oferta.idOferta, idOrden: oferta.idOrden,
        estado: 1, idComprador: idUsuario, idVendedor: oferta.idUsuario,
        reqDesc: oferta.requerimientoDescripcion, 
        valorEntregaDesc: oferta.valorEntregadoDescripcion, valorOferta: oferta.valorOferta
    }).then(res => { 
        if(res.idTransaccion != 0) {
            idTransaccionActual = res.idTransaccion
            iniciarCronometro(res.fechaInicioTransaccion)
            // aquí guardar notificación por que en el servidor, la transaccion no lleva 
            // los id de los usuarios.
            let noti = {
                idNotificacion: 1,
                idItemOperacion: res.idOrden,
                idUsuarioEmisor: idUsuario,
                idUsuarioReceptor: oferta.idUsuario,
                trigger: 3,
                operacion: "comprador: aceptó la oferta."
            }
            // verificar que no exista un controlador de click para este elemento
            if ($._data($("#btnCancelar"))[0]) {
                if ($._data($("#btnCancelar")[0], "events") == undefined) {
                    $("#btnCancelar").click(_ => cancelarTransaccion(res.idTransaccion, oferta.idUsuario,
                        res.idOferta, res.idOrden))
                }
            }
            notificador.guardarNotificaciones(noti)
            .then(_ => cambiarEstadoDeOferta(oferta, "aceptada"))
            .catch(er=>console.log(er))
        }
    })
    .catch(err=>{ console.log(err); $(".modal").modal('hide')})

    $(`#empezar_${oferta.idOferta}`).off("click");
}

function onClickStar(e) {
    let parent = $(this).parent()
    let children = parent.children();
    
    let ci = 0
    $.each(children, (_, elem) => {
        if (e.target == elem)  {
            ci = _
            $("#rango").attr("data-calificacion", ci + 1)
            return false;
        }
    })
    for (let i = ci; i >= 0; i--) {
        $(children[i]).css("color", "gold")
    }
    for (let i = ci+1; i < children.length; i++) {
        $(children[i]).css("color", "initial")
    }
}

function onHiddenModal() {
    $("a[href='#espera_envio']").addClass("disabled")
    $("a[href='#califica']").addClass("disabled")
    $("a[href='#datos_pago']").click()
    // reset
    $("#splash").hide()
    $("#datos_pago").html("")
    //$("#califica").removeClass("active")
    if (cronometro != null) clearInterval(cronometro)
    $("span[id*='crono'").html("00:00")
    $("#inbox").html("")    // limpiamos la bandeja de chat cada vez que se cierra el popup
    $("#text-message").val("")
    $("#p_orden").attr("data-actual", 0)
}
// FIN DE CONTROLADORES DE EVENTOS DE LA GUI

// FUNCIONES DE CRONÓMETRO
function iniciarCronometro(fechaInicio) {
    let fechaFuturo = new Date(fechaInicio) 
    fechaFuturo.setMinutes(fechaFuturo.getMinutes() + 10) // momento en el debe finalizar.
    let fechaActual =  new Date()
    if (fechaFuturo < fechaActual) { // fecha futuro anterior a fecha actual...
        clearInterval(cronometro)
        return
    }
    let diff = fechaFuturo - fechaActual
    let diffM = parseFloat(((diff/1000)/60).toFixed(2)) // obtiene minutos
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
// FIN FUNCIONES DE CRONÓMETRO

// FUNCIONES PARA GESTIONAR LAS RESPUESTAS Y ERRORES DE LAS COMUNICACIONES CON EL SERVIDOR
function gestionarRespuestaDePago(idTran, oferta, fechaPago) {
    $("#indicador_carga").addClass("d-flex")    // indicador aparece y espera respuesta..
    .removeClass("d-none")
    let dat = {
        idEmisor: idUsuario,
        idReceptor: oferta.idUsuario,
        idOferta: oferta.idOferta,
        idOrden: oferta.idOrden,
        idTran: idTran,
        fechaPago: new Date(fechaPago).toISOString()
    }
    console.log(dat)
    cliente.emitirEvento("pagado", dat)
    $("#siguiente").attr("disabled", true) // desactiva el botón siguiente
}

function gestionarErrorDePago(err) {
    $("a[href='#espera_envio']").addClass("disabled")  
    $("a[href='#datos_pago']").click()    // regresamos a datos pago para que intente otra vez.  
    
    alert("Error al guardar la fecha del pago. Intente otra vez.")
}

function successCambioEstado(oferta, estado) {
    if (estado == "favorito") {
        mostrarEnFavorito(oferta.idUsuario)
    } else if (estado == "rechazada") {
        rechazarOferta(oferta)
    }

    let data = {
        idOferta: oferta.idOferta,
        idReceptor: oferta.idUsuario, 
        estado: estado,
        idOrden: oferta.idOrden,
        idSolicitante: idUsuario
    }
    cliente.io.emit("cambioEstadoOferta", data)
}
// FIN DE FUNCIONES PARA GESTIONAR RESPUESTAS Y ERRORES DEL SERVIDOR

// UTILS
function formatearTiempoCrono(min, sec) {
    let minutoActual = (min < 10) ? "0" + min
        : min;
    let segundoActual = (sec < 10) ? "0" + sec 
        : sec;

    return minutoActual +":"+ segundoActual
}

function validarParametro(param) {
    let validado = true
    if (param == "" || param == null) {
        console.log(param)
        validado = false
    } else {
        if (isNaN(escape(param))) {
            console.log(param)
            validado = false
        }
    }
    return validado
}
// FIN UTILS

cliente.socket.on('update', data => {
    if (paramId.get("idOrden") != data.idOrden) return;
    $(`#propuesta_${data.idOrden}`).html(data.propuesta)
    showOfertasParaEstaOrden([data])
});
cliente.socket.on('visto', data => $(`#visto_${data.idOrden}`).html(data.incremento))
cliente.socket.on('pagado', (data) => { // cuando el vendedor ya pagó.
    let actual = parseInt($("#p_orden").attr("data-actual"))
    if (data.idOferta !== actual) return;
    if (cronometro != null) clearInterval(cronometro)
    $("#splash").hide()
    $("#tab").show(300)
    $("a[href='#califica']").removeClass("disabled").click()
    $("a[href='#espera_envio']").addClass("disabled")
    $("a[href='#datos_pago']").addClass("disabled")
    $("#indicador_carga").addClass("d-none")
    .removeClass("d-flex")
    if ($._data($("#btnCalificar")[0], "events") == undefined) {
        $("#btnCalificar").click(_ => alCalificar(dat))
    }
})
cliente.socket.on("chat-message", (data) => {
    let actual = parseInt($("#p_orden").attr("data-actual"))
    //console.log(data)
    if (data.idOferta !== actual) return; // si no es la oferta actual entonces no mostrar mensaje
    
    showMessageReceived(data.mensajes[0].msg, new Date(), data.mensajes[0].tipo)
    let inbox = document.getElementById("chartBox");
    inbox.scrollTop = inbox.scrollHeight
})
cliente.socket.on("tran-cancel", transaccionCancelada)
cliente.socket.on('error', (err) => console.log('error', err));