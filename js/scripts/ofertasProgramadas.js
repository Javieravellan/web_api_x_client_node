import { CuentaBanco } from "./datos_db/cuenta_banco.js"
import { OfertaModelo } from "./datos_db/oferta_modelo.js"
import { RoomsActivos } from "./datos_db/rooms_activos.js"
import { URL_BASE } from "./vars.js"

if (sessionStorage.getItem("auth") === "null" || !sessionStorage.getItem("auth")) {
    window.location.href = "./page-login.html"
}
let userSession = sessionStorage.getItem("auth")
userSession = JSON.parse(/*JSON.parse(*/userSession/*)*/)
let idUsuario = userSession.userId
let nameUser = userSession.userName
const rutaFotoPerfil = URL_BASE;
const ofertaModelo = new OfertaModelo()
const roomsActivos = new RoomsActivos()

const cargarDatosParaEditar = (orden) => {
    $("#cmbCrypto").selectpicker('val', $(`option:contains(${orden.valorEntregaDescipcion})`).val())
    $("#valorAceptado").val(orden.valorOfertadoXRequerimiento)
    $("#minimo").val(orden.minimo)
    $("#maximo").val(orden.maximo)
    $("#cmbReceptores").selectpicker('val', orden.idsReceptores.split(","))
    $("#cmbTransferencia").selectpicker('val', orden.transfiriendoDesde.split(","))
    $("#cmbTipo").selectpicker('val', orden.ordenPrivada)
    let checks = $(".checks")
    orden.diasActivos.split(",").forEach(_ => {
        for(let i = 0; i < checks.length; i++) {
            if (checks[i].value.includes(_.trim())) checks[i].checked = true
        }
    })
    $("#hDesde").val(orden.horarioInicio)
    $("#hHasta").val(orden.horarioFin)
    $("#estadoProgramada").val(orden.estadoProgramada)
    $("#estadoProgramada").attr("data-id", orden.idOrden)
};

const showOrdenesProgramadas = (ordenes) => {
    if (ordenes.length == 0) return
    ordenes.forEach(orden => {
        let esActivo = orden.estadoProgramada==1 ? true : false
        let elemento = `<div id="programada${orden.idOrden}" class="col-xl-6 col-lg-6 mb-3">
            <div class="card1 project-card" style="background-color: #fff">
                <div class="card-body" style="padding: 18px">
                    <div class="d-flex mb-4 align-items-start">
                        <div class="dz-media mr-3">
                            <img src="images/logos/pic1.jpg" class="img-fluid" alt="">
                        </div>
                        <div class="mr-auto">
                            <p class="text-primary mb-1">
                                <font style="vertical-align: inherit;">Vendiendo</font>
                            </p>
                            <h5 class="title font-w600 mb-2">
                                <a href="post-details.html" class="text-black">
                                    <font style="vertical-align: inherit;">${orden.valorEntregaDescipcion}</font>
                                    <font style="vertical-align: inherit;font-size: 11px;"> a </font>
                                    <font style="vertical-align: inherit;">${orden.valorOfertadoXRequerimiento} ${orden.requerimientoDescripcion}</font>
                                </a></h5>
                            <span>
                                <font style="vertical-align: inherit;">Limt. ${orden.minimo}${orden.valorEntregaDescipcion} - ${orden.maximo}${orden.valorEntregaDescipcion}</font>
                            </span>
                        </div>
                        <button id="btn-${orden.idOrden}" class="btn ${esActivo ? ' btn-secondary' : ' btn-warning'} d-sm-inline-block">${esActivo ? 'Activo' : 'Inactivo'}</button>
                    </div>
                    <div class="d-flex flex-wrap align-items-center">
                        <div class="mr-auto mb-4">
                            <p class="mb-2 font-w500 text-black">
                                <font style="vertical-align: inherit;">
                                    <font style="vertical-align: inherit;">Priorización</font>
                                </font>
                            </p>
                            <p class="mb-2 font-w500 text-black">
                                <font style="vertical-align: inherit;">
                                    <font style="vertical-align: inherit;font-size: 22px;color: #68cf29;">
                                        100%</font>
                                </font>
                            </p>
                        </div>
                        <div class="d-flex align-items-center mb-4">
                            <div class="text-center border-bx mr-3">
                                <span>
                                    <font style="vertical-align: inherit;">
                                        <font style="vertical-align: inherit;">Impresiones</font>
                                    </font>
                                </span>
                                <p class="mb-0 pt-1 font-w500 text-black">
                                    <font style="vertical-align: inherit;">
                                        <font style="vertical-align: inherit;">0</font>
                                    </font>
                                </p>
                            </div>
                            <div class="text-center border-bx">
                                <span>
                                    <font style="vertical-align: inherit;">
                                        <font style="vertical-align: inherit;">Ventas generadas</font>
                                    </font>
                                </span>
                                <p class="mb-0 pt-1 font-w500 text-black">
                                    <font style="vertical-align: inherit;">
                                        <font style="vertical-align: inherit;">$0,00</font>
                                    </font>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12">
                            <div>
                                <font style="vertical-align: inherit;">
                                    <font style="vertical-align: inherit;">Recibiendo Pagos: </font>
                                </font><span class="text-black ml-3 font-w600">
                                    <font style="vertical-align: inherit;">
                                        <font style="vertical-align: inherit;">${orden.receptores}
                                        </font>
                                    </font>
                                </span>
                            </div>
                            <div>
                                <font style="vertical-align: inherit;">
                                    <font style="vertical-align: inherit;">Entregando desde: </font>
                                </font><span class="text-black ml-3 font-w600">
                                    <font style="vertical-align: inherit;">
                                        <font style="vertical-align: inherit;">${orden.transfiriendoDesde}</font>
                                    </font>
                                </span>
                            </div>
                            <div>
                                <font style="vertical-align: inherit;">
                                    <font style="vertical-align: inherit;">
                                        <font style="vertical-align: inherit;">
                                            <font style="vertical-align: inherit;">Horario activo: ${orden.horarioInicio}
                                                hasta ${orden.horarioFin} ${orden.diasActivos}</font>
                                        </font>
                                    </font>
                                </font>
                            </div>
                            <div class="d-flex justify-content-center mt-3">
                                <a id="btnActualizar${orden.idOrden}" style="font-size: 1.5em !important" class="btn btn-primary mr-2" href="javascript:void(0)"><i class="fa fa-edit"></i></a>
                                <a id="btnEliminar${orden.idOrden}" style="font-size: 1.5em !important" class="btn btn-danger" href="javascript:void(0)"><i class="las la-trash"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        $("#contenedor-programadas").append(elemento)
        // evento para activar y desactivar
        $(`#btn-${orden.idOrden}`).on('click', async e => {
            let target = e.target
            $("body").css("opacity", '0.5')
            try {
                if (target.innerHTML == 'Activo') {
                    let cambioEstado = await ofertaModelo.cambiarEstadoProgramada(orden.idOrden, 0)
                    if (cambioEstado) {
                        $(`#${target.id}`).addClass("btn-warning").removeClass("btn-secondary")
                        target.innerHTML = 'Inactivo'
                    }
                } else {
                    let cambioEstado = await ofertaModelo.cambiarEstadoProgramada(orden.idOrden, 1)
                    if (cambioEstado) {
                        target.innerHTML = 'Activo'
                        $(`#${target.id}`).addClass("btn-secondary").removeClass("btn-warning")
                    }
                }
            } catch(e) {alert(e.statusText)}
            $("body").css("opacity", '1')
        })
        $("#btnActualizar"+orden.idOrden).on('click', _ => {
            $(".modal .modal-title").html("Modificar orden de venta programada.")
            $(".modal").attr("data-actualizar", true)
            cargarDatosParaEditar(orden)
            // lo demás lo hace el formulario de registro/modificación
            $(".modal").modal("show")
        })
        $("#btnEliminar"+orden.idOrden).on('click', async _=> {
            if(confirm("¿Est seguro?")) {
                try {
                    $("body").css("opacity", "0.5")
                    let res = await ofertaModelo.eliminarOfertaProgramada(orden.idOrden)
                    if (res) $("#programada"+orden.idOrden).remove()
                } catch(e) {alert(e.statusText)}
                $("body").css("opacity", "1")
            }
        })
    })
};

const limpiarForm = () => {
    $("#formCrear")[0].reset()
    $("#cmbTipo").selectpicker('val', 0)
    $("#cmbCrypto").selectpicker("val", '')
    $("#cmbTransferencia").selectpicker("val", '')
    $("#cmbReceptores").selectpicker('val', '')
    $(".modal .modal-title").html("Crear orden de venta programada")
    $(".modal").attr("data-actualizar", false)
    $("#estadoProgramada").val("")
    $("#estadoProgramada").attr("data-id", '')
};

const validarYEnviarFormDeVentaProgramada = async (e) => {
    e.preventDefault();
    $(".error").html("").addClass("d-none")
    let formDeVentaProgramada = e.target
    // dias seleccionados
    let checks = $("#" + formDeVentaProgramada.id + " .checks:checked")
    if (checks.length == 0) {
        $(".error").html("Debe seleccionar al menos un día de actividad.").removeClass("d-none")
        return false
    }
    let checksSeleccionados = ""
    $.each(checks, (i, v) => {
        checksSeleccionados += v.value.substring(0, 3)
        if (i < checks.length - 1) checksSeleccionados += ", "
    })
    // cuentas receptoras seleccionadas
    let valorCmbIdRecpetores = $(`#cmbReceptores`).selectpicker('val')
    let nombreReceptores = $("button[data-id=cmbReceptores]").attr('title')
    if (valorCmbIdRecpetores.length == 0) {
        $(".error").html("Debe seleccionar al menos una cuenta en la cual receptar.")
        .removeClass("d-none")
        return false
    }
    let idReceptoresFinal = ''
    valorCmbIdRecpetores.forEach((v, i) => {
        idReceptoresFinal += v;
        if (i < valorCmbIdRecpetores.length - 1) 
            idReceptoresFinal += ","
    })
    // cuentas en las que se dispone a transferir
    let valorCmbIdTransferencia = $(`#cmbTransferencia`).selectpicker('val')
    if (valorCmbIdTransferencia.length == 0) {
        $(".error").html("Debe seleccionar las cuentas en las que está dispuesto a transferir.")
        .removeClass("d-none")
        return false
    }
    let nombreCuentaTransferencias = $("button[data-id=cmbTransferencia]").attr('title')
    // horario de actividad
    let hDesde = formDeVentaProgramada.hDesde
    let hHasta = formDeVentaProgramada.hHasta
    if (hDesde.value.trim() == "" || hHasta.value.trim() == "") {
        $(".error").html("Debe definir el horario de actividad")
        .removeClass("d-none")
        return false
    }
    if (parseInt(hDesde.value.split(":")[0]) > parseInt(hHasta.value.split(":")[0])) {
        $(".error").html("La hora de inicio debe ser menor que la hora de fin.")
        .removeClass("d-none")
        return false
    }
    // tipo
    if ($("#cmbTipo").selectpicker("val").trim() == "") {
        $(".error").html("Debe seleccionar el tipo (pública/privada)").removeClass("d-none")
        return false
    }
    let tipo = $("#cmbTipo").selectpicker("val").trim()

    // esto es lo que se enviará
    let datos = {
        idsReceptores: idReceptoresFinal, 
        idUsuario: idUsuario,
        receptores: nombreReceptores,
        diasActivos: checksSeleccionados, 
        transfiriendoDesde: nombreCuentaTransferencias,
        horarioInicio: hDesde.value, 
        horarioFin: hHasta.value, tipo,
        minimo: formDeVentaProgramada.minimo.value.trim(),
        maximo: formDeVentaProgramada.maximo.value.trim(),
        requerimientoDescripcion: userSession.money,
        valorOfertadoXRequerimiento: formDeVentaProgramada.valorAceptado.value.trim(),
        valorEntregaDescipcion: $("#cmbCrypto option:selected").text(),
        idRoomActivo: $("#cmbCrypto").selectpicker('val').trim(),
        ordenPrivada: tipo
    }
    try {
        $("body").css("opacity", "0.5")
        let res = null
        if ($(".modal").attr("data-actualizar") == "false") {
            console.log("Nuevo registro");
            res = await ofertaModelo.crearOfertaProgramada(datos)
        } else {
            // llamar a actualizar datos que aun no se crea
            datos.estadoProgramada = $("#estadoProgramada").val()
            datos.idOrden = $("#estadoProgramada").attr("data-id")
            res = await ofertaModelo.actualizarDatosOfertaProgramada(datos)
            // eliminar datos anteriores y poner nuevos
            $("#programada"+datos.idOrden).remove();
        }
        showOrdenesProgramadas([res])
        $(".modal").modal('hide')
    } catch(e) {alert(e.statusText)}
    $("body").css("opacity", "1")
};

const showCuentas = (cmb, ctas) => {
    $(cmb).selectpicker({
        "noneSelectedText": 'Seleccione al menos uno',
        'showSubtext' : true,
        'showContent': false,
    })
    var myDefaultWhiteList = $.fn.selectpicker.Constructor.DEFAULTS.whiteList;
    //To allow data-custom for span elements
    myDefaultWhiteList.span = ['data-custom'];  
    ctas.forEach(c => {
        let option = $('<option/>', {
            'value': c.idCuenta,
            'html': `${c.nombreBanco}`,
            'data-content': `<strong>${c.descripcionCuenta}</strong><br/><span>${c.nombreBanco}</span>` 
        })
        $(cmb).append(option)
    })
    $(cmb).selectpicker("refresh")
    $(`#${$(cmb).attr("id")} ~ button`).addClass("p-1")
}

const showActivosDigitales = (data) => {
    if (data.length == 0) return
    let cmbCrypto = $("#cmbCrypto")
    data.forEach(d => {
        let option = `<option value="${d.idRoomActivo}" valor-mrk="${d.precioReferente}">${d.nombre}</option>`
        $(cmbCrypto).append(option)
    })
    $(cmbCrypto).selectpicker('refresh')
}

const onLoad = async () => {
    $("#nameUser").html(nameUser)
    $("#idUser").html(idUsuario)
    $(".foto-perfil").attr("src", `${rutaFotoPerfil}${userSession.photoProfile}`)
    $(document.forms.formCrear).on('submit', validarYEnviarFormDeVentaProgramada)
    $(".modal").on("hidden.bs.modal", limpiarForm)
    try{
        let res = await new CuentaBanco().obtenerCuentasBancoDeUsuario(idUsuario)
        showCuentas($("#cmbReceptores"),res)
        showCuentas($("#cmbTransferencia"), res)
        let programadas = await ofertaModelo.obtenerOfertasProgramadas(idUsuario)
        showOrdenesProgramadas(programadas)
        let activos = await roomsActivos.obtenerRoomsActivos()
        showActivosDigitales(activos)
        // eventos
        $("#check-valor-mrk").on('change', e => {
            if (e.target.checked) {
                let valorActivoActual = parseFloat($("#cmbCrypto > option:selected").attr("valor-mrk"))
                console.log(valorActivoActual)
                let format = (valorActivoActual>=1) ? valorActivoActual.toFixed(2) : valorActivoActual.toFixed(6)
                $("#valorAceptado").val(format)
            } else $("#valorAceptado").val('')
        })
        $("#cmbCrypto").on('changed.bs.select', e => {
            $("#valorAceptado").val('')
            $("#check-valor-mrk").prop("checked", false)
        })
    } catch(e) {alert(e.statusText)}
};

$(document).ready(onLoad);