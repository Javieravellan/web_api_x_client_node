import { Comentario } from "./datos_db/comentarios.js"
import { CuentaBanco } from "./datos_db/cuenta_banco.js"
import { RoomsActivos } from "./datos_db/rooms_activos.js"
import { Transaccion } from "./datos_db/transaccion.js"
import { UsuarioModelo } from "./datos_db/usuarioModelo.js"
import {Grafico} from "./helper/graficos.js"
import { cerrarSession, parseJwt } from "./helper/validarCuenta.js"
import { blobToBase64 } from "./helper/visorImagen.js"
import { ICON_COUNTRY_URI, URL_BASE } from "./vars.js"
import { selectPicker } from "./plugin-select/js/index.js";
import { MediosPago } from "./datos_db/mediosPago.js"

if (sessionStorage.getItem("auth") === "null" || !sessionStorage.getItem("auth")) {
    window.location.href = "./page-login.html"
}
let userSession = sessionStorage.getItem("auth")
userSession = JSON.parse(userSession)
let idUsuarioLogeado = userSession.userId
let nameUser = userSession.userName
const banco = new CuentaBanco()
const usuarioModelo = new UsuarioModelo()
const tran = new Transaccion()
const roomsActivos = new RoomsActivos()
const params = new URLSearchParams(window.location.search)
const medioPago = new MediosPago()
let rutaFotoPerfil = URL_BASE

const abrirFormYCargarDatos = () => {
    let formEdit = document.getElementById("form-edit")
    formEdit.usuario.value = nameUser
    formEdit.email.value = $("#email").html()
    $(`li[data-value='${$("#span-pais").html()}'`).trigger('click')
    $("#pantalla").click()
    formEdit.msg.value = (userSession.msg !== '') ? userSession.msg : "";
    $("#field-photo").attr("src", $(".foto-perfil")[0].src)
    $(`#cmbMoneda`).selectpicker('val',$(`option:contains(${userSession.money})`).val())
}

const tratarRespuestaDeEdicion = (res) => {
    $("#edit-profile").modal("hide");
    $("body").css("opacity", "1")
    userSession = parseJwt(res)
    let utmp = JSON.parse(userSession)
    sessionStorage.setItem("auth", userSession)
    sessionStorage.setItem("token", res)
    if (utmp.email !== $("#email").html()) {
        $("#newMail").html(utmp.email) // mostrar nuevo mail
        $("#mensajeRegistro").modal("show")
        $("#btn-validar").click(async _ => {
            $("body").css("opacity", "0.5")
            try {
                let r = await usuarioModelo.activarCuenta(utmp.email, $("#token").val())
                console.log(r)
            }catch (e) { cerrarSession(e) }
            $("body").css("opacity", "1")
            window.location.href="./profile.html"
        })
    } else window.location.href="./profile.html"
}

const guardarDatosEditados = async (e) => {
    e.preventDefault()
    // validar form
    let formEdit = document.getElementById("form-edit")
    let index = -1;
    let elementos = formEdit.elements
    for (let i = 0; i < elementos.length; i++) {
        if (i == 0 || (i >= 4 || i <= 9)) continue
        if (elementos[i].value == "") {
            index = i
            break;
        }
    }
    if (index != -1) {
        console.log(index)
        elementos[index].focus()
        return
    }
    
    // enviar formulario de actualización.
    let foto = ""
    if (formEdit.cambiarFoto.files[0]) {
        let b64 = await blobToBase64(formEdit.cambiarFoto.files[0])
        foto = b64.split(",")[1]
    }
    let usuario = {
        idUsuario: idUsuarioLogeado,
        nombre: formEdit.usuario.value.trim(),
        email: formEdit.email.value.trim() + "-" + $("#email").html(),
        pais: window.selectPicker.itemSelected.dataset.value, //$("#form-edit #cmbPais > option:selected").val(),
        fotoPerfil: foto,
        mensaje: formEdit.msg.value,
        moneda: window.selectPicker.itemSelected.dataset.moneda, //$("#cmbMoneda option:selected").text(),
        preferencias: userSession.preferencias
    }

    try {
        $("body").css("opacity", "0.5")
        let res = await usuarioModelo.actualizarDatos(usuario)
        tratarRespuestaDeEdicion(res)
    } catch(e) { console.log(e) }
    $("#edit-profile").modal("hide");
    $("body").css("opacity", "1")
}

const mostrarVistaPrevia = (e) => {
    let origen = e.target
    if (origen.value == "") return
    if ((origen.files[0].size / 1e+6) <= 5e+6) { // solo imagenes de 5Mb o menos..
        $("#field-photo").attr("src", URL.createObjectURL(origen.files[0]))
        return
    }
    $("#foto-error").html("Solo se admiten imágenes de hasta 5Mb.")
}

const showComentariosCalificacion = (comments) => {
    if (comments.length === 0) return;
    let ul = $("#comentarios")
    ul.html("")
    let promedio = comments[0]
    for (var i = 0; i < promedio.calificacion; i++) {
        $("#rating i[index="+i+"]").css("color", "gold")
        if (i == 4) {
            break;
        }
    }
    comments.forEach((c, i) => {
        if (i > 0) {
            let comentario = `<li>
                <div class="timeline-panel">
                    <div class="media mr-2">
                        <img alt="imagen" width="50" 
                            src="${rutaFotoPerfil}${c.fotoPerfil}">
                    </div>
                    <div class="media-body">
                        <h5 class="mb-1 h6">${c.comentario}</h5>
                        <p id="comment-">${c.nombre} - ${new Date(c.fechaComentario).toLocaleString()}</p>
                    </div>
                    <div class="dropdown align-self-center mt-0">
                        <div class="bg-info light rounded p-3 text-white">
                            <i class="fa fa-star"></i>
                            <span id="resumen">${c.calificacionComentario}</span>
                        </div>
                    </div>
                </div>
            </li>`
        $(ul).append(comentario)
        }
    })
}

const formatearTiempoEntrega = (tiempo) => {
    if (tiempo == 0) return "No hay info disponible por el momento."
    if (tiempo < 60)
        return tiempo + " Min."
    tiempo = tiempo / 60 // tiempo en horas
    let resto = tiempo % 1 // resto en minutos

    if (resto < 1 && resto > 0) {
        resto = resto * 60
        let horaEntero = Math.trunc(tiempo)
        let msg = horaEntero > 1 ? " Hrs. " : " H. "
        let msg2 = resto > 1 ? " Mins." : " Min."
        return  horaEntero + msg + " y " + Math.trunc(resto) + msg2
    } else if(resto == 0) {
        let horaEntero = Math.trunc(tiempo)
        let msg = horaEntero > 1 ? " Hrs. " : " Hr. "        
        return  horaEntero + msg
    }
}

const obtenerBancos = async (tipo, idElem) => {
    let res = await medioPago.obtenerMediosPago(tipo)
    let combobox = $(idElem)
    if (res.length) {
        let optionsSelect = {
            "noneSelectedText": 'Seleccione al menos uno',
            'showSubtext' : true,
            'showContent': false,
            //'width': "120px",
            'size': 10
        }
        $(combobox).selectpicker(optionsSelect)
        var myDefaultWhiteList = $.fn.selectpicker.Constructor.DEFAULTS.whiteList;
        //To allow data-custom for span elements
        myDefaultWhiteList.span = ['data-custom'];
        console.log(res)
        res.forEach(elem => {
            let red = Math.trunc(Math.random() * 255)
            let green = Math.trunc(Math.random() * 255)
            let blue = Math.trunc(Math.random() * 255)
            let option = $('<option/>', {
                'value': elem.idBanco,
                'html': `${elem.nombreBanco}`,
                'data-content': `<span style="vertical-align: middle;display:inline-block;background-color: rgb(${red},${green}, ${blue});width:5px; height:14px"></span>&nbsp;<span>${elem.nombreBanco}</span>` 
            })
            if (!elem.nombreBanco.includes("Todos /")) $(combobox).append(option)
        })
        $(combobox).selectpicker("refresh")
    }
}

const obtenerBilleteras = async () => {
    try {
        let response = await medioPago.obtenerBilleteras()
        let cmbRed = $("#cmbRed")
        if (response.length) {
            let optionsSelect = {
                "noneSelectedText": 'Seleccione al menos uno',
                'showSubtext' : true,
                'showContent': false,
                //'width': "120px",
                'size': 10
            }
            $(cmbRed).selectpicker(optionsSelect)
            var myDefaultWhiteList = $.fn.selectpicker.Constructor.DEFAULTS.whiteList;
            //To allow data-custom for span elements
            myDefaultWhiteList.span = ['data-custom'];
            response.forEach(elem => {
                let red = Math.trunc(Math.random() * 255)
                let green = Math.trunc(Math.random() * 255)
                let blue = Math.trunc(Math.random() * 255)
                let option = $('<option/>', {
                    'value': elem.idBilletera,
                    'html': `${elem.nombre}`,
                    'data-content': `<span style="display:inline-block;background-color: rgb(${red},${green}, ${blue});width:5px; height:14px"></span>&nbsp;<span>${elem.nombre}</span>` 
                })
                $(cmbRed).append(option)
            })
            $(cmbRed).selectpicker("refresh")
        }
    } catch(e) { console.log(e) }
}

const showResumenComercial = (res) => {
    if (res==undefined || res==null) return 
    $("#total-ventas").html("$"+res.totalVenta.toFixed(2))
    $("#total-compras").html("$"+res.totalCompra.toFixed(2))
    Grafico.destroyCharts("graficoVentas")
    if(res.ventas.length > 0) {
        let ventas = res.ventas
        $("#tbody-ventas").html("")
        ventas.forEach(elem => {
            let totalVentas = elem.historial.reduce((acu, val) => acu += val)
            if (totalVentas != 0.00) {
                let row = `<tr>`
                row += `<th>${elem.nombreActivo}</th>`
                row += `<td>${totalVentas.toFixed(2)}</td>`
                row += `</tr>`
                $("#tbody-ventas").append(row)
            }
        })
        // preparar datos para gráfico ventas
        prepararYDibujarGrafico(ventas, document.getElementById("graficoVentas"))
        $("#detalle-ventas").removeClass("d-none")
    } else $("#tbody-ventas").html("")

    Grafico.destroyCharts("graficoCompras")
    if(res.compras.length > 0) {
        let compras = res.compras
        $("#tbody-compras").html("")
        compras.forEach(elem => {
            let totalCompras = elem.historial.reduce((acu, val) => acu += val)
            if (totalCompras != 0.0) {
                let row = `<tr>`
                row += `<th>${elem.nombreActivo}</th>`
                row += `<td>${totalCompras.toFixed(2)}</td>`
                row += `</tr>`
                $("#tbody-compras").append(row)
            }
        })
        // preparar datos para gráfico compras
        prepararYDibujarGrafico(compras, document.getElementById("graficoCompras"))
        $("#detalle-compras").removeClass("d-none")
    } else $("#tbody-compras").empty()
}
/**
 * 
 * @param {Array} datos 
 */
const prepararYDibujarGrafico = (datos, canvas) => { 
    let activos = datos.map((d) => d.nombreActivo) // array
    let valores = datos.map(d => d.historial)   // array
    
    datos = {
        data: valores, 
        tags: activos
    }
    Grafico.crearGraficoLineal(canvas, null, datos)
}

const btnConsultarResumen = async (e) => {
    try {
        let periodo = ""
        if (e.target.id != "todos") periodo = e.target.id
        if (e.target.classList.contains("active")) return
        $("body").css("opacity", "0.5")
        showResumenComercial(await tran.obtenerResumenComercial(idUsuarioLogeado, periodo))
    } catch(e) {console.log(e)}
    $("body").css("opacity", "1")
}

const showActivosEnPreferencias = (activos) => {
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

const agregarActivosSeleccionados = (atributo, valor, tagHtml) => {
    let seleccionActual = $("#row").attr(atributo)
    $("#row").attr(atributo, seleccionActual + "" + tagHtml.getAttribute(valor)+",")
}

const eliminarActivosSeleccionados = (atributo, atributo2, tagHtml) => {
    let valActual = tagHtml.getAttribute(atributo2) + ","
    let seleccionActual = $("#row").attr(atributo)
    let nuevaSeleccion = seleccionActual.replace(valActual, "")
    $("#row").attr(atributo, nuevaSeleccion)
}

const onLoad = async () => {
    $("#nameUser").html(nameUser)
    $("#idUser").html(idUsuarioLogeado)
    $("#name").html(nameUser)
    $("#email").html(userSession.email)
    $("#pais").html(`<img style='width:20px;height:20px;' src='${ICON_COUNTRY_URI}${userSession.country}.png' alt='País' /><span id='span-pais'>${userSession.country}</span>`)
    $("#mensaje").html(userSession.msg)
    $("#pref-moneda").html(userSession.money)
    $(".foto-perfil").attr("src", rutaFotoPerfil + userSession.photoProfile + "?" + Math.random())
    let formCuenta = document.getElementById("form-cuenta-banco")
    formCuenta.addEventListener("submit",enviarFormulario)
    let formWallet = document.getElementById("form-cuenta-wallet")
    formWallet.addEventListener("submit", enviarFormulario)
    $("#box-cuenta").on("hidden.bs.modal", _ => {
        formCuenta.reset()
        formWallet.reset()
        $("#title").html("Nuevo elemento")
    })
    $("#btn-logout").click(_ => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("auth");
        window.location.href = "./page-login.html"
    })
    selectPicker.iniciar("select", "item")
    // form de editar datos usuario
    $("#abre-edicion").on('click', abrirFormYCargarDatos)
    $("#edit-profile").on("hidden.bs.modal", $("#form-edit")[0].reset())
    $("#form-edit").submit(guardarDatosEditados)
    $("#cambiarFoto").change(mostrarVistaPrevia)
    $("ul[role='tablist'] > li a").each((i, elem) => elem.addEventListener('click', btnConsultarResumen))
    try {
        let res = await banco.obtenerCuentasBancoDeUsuario(idUsuarioLogeado)
        showCuentas(res)
        let datosPerfil = await new Comentario().getComentatiosYcalificacion(idUsuarioLogeado)
        showComentariosCalificacion(datosPerfil.comentarios)
        showResumenComercial(await tran.obtenerResumenComercial(idUsuarioLogeado,""))
        showActivosEnPreferencias(await roomsActivos.obtenerRoomsActivos())

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
        
        if (userSession.preferences !== "") {
            let pref = userSession.preferencias.split(",")
            pref.forEach(p => {
                let check = $(`input[data-id=${p}]`)
                $(check).prop("checked", true)
                $(check).change()
            })
            $("#cBusqueda").val($("#row").attr("data-names").substring(0, 
                $("#row").attr("data-names").length - 1))
        }

        $("#btnGuardarPreferencia").on('click', onGuardarPreferencias)
        $("#tPromedio").html(formatearTiempoEntrega(datosPerfil.opciones.tiempoEntregaPromedio))
        $("#opCancel").html(datosPerfil.opciones.opCancel)
        $("#opConcret").html(datosPerfil.opciones.opConcret)
        $("#opDenuncie").html(datosPerfil.opciones.opDenuncie)
        await obtenerBancos("1", "#cmbPais") // trayendo los bancos disponibles.
        await obtenerBancos("2", "#cmbRed") // trayendo las walltes disponibles..
    } catch(e) { console.log(e); }

    // activar cualquier tab al cargar la página.
    if (params.get('tab') == 'panel_cuentas') {
        $(`a[href='#${params.get('tab')}']`).click()
        $(`#btnNewCuenta`).click()
    }
}

const cargarDatosEnFormulario = (form, c) => {
    console.debug(c)
    $("#title").html("Editar cuenta")
    $("#cta_id").val(c.idCuenta)
    if (form.id == "form-cuenta-wallet") {
        $("a[href='#cta-wallet']").click()
        form.direccionWallet.value = c.numeroCuenta
        form.aliasWallet.value = c.descripcionCuenta
        $(form.cmbRed).selectpicker('val', $(`#cmbRed > option:contains(${c.nombreBanco})`).val())
        return
    }
    $("a[href='#cta-banco']").click()
    form.cedula.value = c.cedula
    //form.nombreBanco.value = c.nombreBanco
    form.titular.value = c.nombrePropietario
    form.numeroCuenta.value = c.numeroCuenta
    form.alias.value = c.descripcionCuenta
    $(form.cmbPais).selectpicker('val', $(`#cmbPais > option:contains(${c.nombreBanco})`).val())
    form.cmbMoneda.value = c.tipoMoneda
}

const showCuentas = (ctas) => {
    ctas.forEach(c => {
        let cta = $('<div/>', {
            'class': 'col-xl-3 col-xxl-4 col-lg-4 col-md-6 col-sm-6 items',
            'id': `cta_${c.idCuenta}`
        })
        let info = ''
        if (c.tipoCuenta == 1) {
            info = `<div class="card contact-bx item-content">`
            info += `<div class="card-body user-profile">`
            info += `<div class="media-body user-meta-info">`
            info += `<h6 class="fs-20 font-w500 my-1"><a href="javascript:void(0);" class="text-black user-name">${c.nombreBanco}</a></h6>`
            info += `<p class="fs-14 mb-3 user-work">Alias: <span>${c.descripcionCuenta}</span></p>`
            info += `<p class="fs-14 mb-3 user-work">Dir Wallet: <span>${c.numeroCuenta}</span></p>`
            info += `<ul>`
            info += `<li id='edit-${c.idCuenta}'><a href="javascript:void(0);"><i class="fa fa-edit"></i></a></li>`
            info += `<li id='del-${c.idCuenta}'><a href="javascript:void(0);"><i class="las la-trash"></i></a></li>`
            info += `</ul>` 
            info += `</div>` 
            info += `</div>` 
            info += `</div>`
        } else {
            info = `<div class="card contact-bx item-content">
            <div class="card-body user-profile">
                <div class="media-body user-meta-info">
                    <h6 class="fs-20 font-w500 my-1"><a href="javascript:void(0);" class="text-black user-name">${c.nombreBanco}</a></h6>
                    <p class="fs-14 mb-3 user-work">Alias: <span>${c.descripcionCuenta}</span></p>
                    <p class="fs-14 mb-3 user-work">Prop: <span>${c.nombrePropietario}</span></p>
                    <p class="fs-14 mb-3 user-work">C.I: <span>${c.cedula}</span></p>
                    <!--p class="fs-14 mb-3 user-work">País: <span>${c.pais}</span></p-->
                    <p class="fs-14 mb-3 user-work">Moneda: <span>${c.tipoMoneda}</span></p>
                    <ul>
                        <li id='edit-${c.idCuenta}'><a href="javascript:void(0);"><i class="fa fa-edit"></i></a></li>
                        <li id='del-${c.idCuenta}'><a href="javascript:void(0);"><i class="las la-trash"></i></a></li>
                    </ul>
                </div>
            </div>
            </div>`
        }
        cta.html(info)
        $("#todasLasCuentas").prepend(cta)
        // evento delete y edit
        $(`#edit-${c.idCuenta}`).click(() => {
            //cuentaActual = c
            $("#box-cuenta").modal("show")
            cargarDatosEnFormulario((c.tipoCuenta == 0) ? document.getElementById("form-cuenta-banco") 
            : document.getElementById("form-cuenta-wallet"), c)

        })
        $(`#del-${c.idCuenta}`).click(() => {
            $("#elem").html(c.idCuenta)
            $("#del-modal").modal("show")
            $("#btn-del").click(async () => {
                try {
                    let r = await banco.eliminarCuenta(c.idCuenta)
                    if (r) {
                        $("#cta_"+c.idCuenta).remove()
                        $("#del-modal").modal("hide")
                    }
                } catch(e) { cerrarSession(e) }
            })
        })
    })
}

async function enviarFormulario(e) {
    e.preventDefault()
    let result = validarFormulario(this)
    let valido = false
    if (result == -1) valido = true
    else {
        this.elements[result].focus()
        return;
    }
    let cta = {}
    if (valido) {
        $(".btnGuardar").hide()
        try {
            let isEdit = $("#title").html().includes("Editar") ? true : false
            if (this.id === "form-cuenta-banco") {
                cta.idUsuario = idUsuarioLogeado
                cta.tipoCuenta = 0
                cta.cedula = this.cedula.value
                cta.nombreBanco = $(`#${this.cmbPais.id} > option:selected`).text() // this.nombreBanco.value
                cta.nombrePropietario = this.titular.value
                cta.numeroCuenta = this.numeroCuenta.value
                cta.descripcionCuenta = this.alias.value
                cta.tipoMoneda = this.cmbMoneda.value
                if (isEdit) {
                    cta.idCuenta = $("#cta_id").val()
                    let res = await banco.editarCuenta(cta)
                    $("#cta_"+cta.idCuenta).remove()
                    showCuentas([res])
                    this.reset()
                    $(".btnGuardar").show()
                    $("#box-cuenta").modal("hide")
                    return
                }
                let res = await banco.crearNuevaCuenta(cta)
                showCuentas([res])
                this.reset()
                $(".btnGuardar").show()
                $("#box-cuenta").modal("hide")
                return
            }
            cta.idUsuario = idUsuarioLogeado
            cta.tipoCuenta = 1
            cta.nombreBanco = $(`#${this.cmbRed.id}>option:selected`).text()
            cta.descripcionCuenta = this.aliasWallet.value
            cta.numeroCuenta = this.direccionWallet.value
            if (isEdit) {
                cta.idCuenta = $("#cta_id").val()
                let res = await banco.editarCuenta(cta)
                $("#cta_"+cta.idCuenta).remove()
                showCuentas([res])
                this.reset()
                $(".btnGuardar").show()
                $("#box-cuenta").modal("hide")
                return
            }
            let res = await banco.crearNuevaCuenta(cta)
            showCuentas([res])
            this.reset()
            $(".btnGuardar").show()
            $("#box-cuenta").modal("hide")
        } catch(e) {
            console.log(e)
            $(".btnGuardar").show()
            cerrarSession(e)
        }
    }
}

async function onGuardarPreferencias() {
    let selectIds = $("#row").attr("data-selected")
    let selectNombres = $("#row").attr("data-names")
    selectIds = selectIds.substring(0, selectIds.length - 1)
    selectNombres = selectNombres.substring(0, selectNombres.length - 1)
    $("#cBusqueda").val(selectNombres)
    let res = await usuarioModelo.guardarPreferenciaDeActivos(selectIds, idUsuarioLogeado)
    userSession.preferencias=selectIds
    sessionStorage.setItem("auth",JSON.stringify(userSession))
    $("#modal-preferencias").modal('hide')
}

const validarFormulario = (form) => {
    for (let i = 0; i < form.elements.length - 1; i++) {
        if ((i == 1 || i == 2 || i == 5 || i == 7) 
            && form.id === "form-cuenta-banco") continue
        if (form.elements[i].type=="button" || form.elements[i].getAttribute("aria-label")=="Search") continue
        if(form.elements[i].value === "") { // esta es solo validación para que no vaya vacio..
            console.log(form.elements[i])
            return i    // el indice del elemento que debe validarse
        }
    }
    return -1
}

$(document).ready(onLoad)