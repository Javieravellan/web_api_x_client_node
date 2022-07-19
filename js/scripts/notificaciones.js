import { cerrarSession } from "./helper/validarCuenta.js";
import { URI_API_EXCHANGE } from "./vars.js";

const rutas = {
    comprador: /*window.location.origin+*/"./comprador.html",
    compradorOrden: /*window.location.origin+*/"./comprador_orden.html",
    projectList: /*window.location.origin+*/"./index.html"
};
const apiUrl = URI_API_EXCHANGE

function obtenerNotificacionesPorIdUsuario(idUsuario) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${apiUrl}notificaciones?idUsuario=${idUsuario}`,
            type: 'GET',
            headers: {
                "Authorization": "Bearer "+sessionStorage.getItem("token")
            },
            success: res => resolve(res),
            error: err => {
                cerrarSession(err)
                reject(err)
            }
        })
    })
}

function showIcon(type) {
    switch(type) {
        case 1:
            return "images/messages.png"
        case 2:
            return "images/new-offer.png";
        case 3:
            return "images/new-order.png";        
    }
}

function mostrarNotificaciones(res) {
    if (res.length > 0) {
        $("#ul-notification").html("") // quita el tag por defecto
        res.forEach(value => {
            let bg = ((value.estado != 1) ? 'rgba(87, 189, 223, 0.18)':'initial')
            let i = $("<li/>", {
                'data-item-id': value.idItemOperacion,
                'style': `cursor: pointer;background:${bg}`
            }).append(
                $('<div/>', {
                    'class': 'timeline-panel'
                }).append(
                    $('<div/>', {
                        'class': 'media mr-2',
                        'html': `<img alt="image" width="50" src="${showIcon(value.trigger)}">`
                    })
                ).append(
                    $('<div/>', {
                        'class': 'media-body',
                    }).append(
                        $('<strong/>', {
                            'class': 'mb-1 body-text',
                            'html': value.mensajeGUI
                        })
                    ).append(
                        $('<small>', {
                            'class': 'd-block',
                            'html': formatearFecha(value.fechaHora) 
                        })
                    )
                )
            )
            $(i).click(() => {
                // cambie el estado de la notificación en el servidor.
                console.log("Ejecutando...")
                cambiarEstadoNotificacion(value.idItemOperacion,value.trigger,value.idUsuarioReceptor)
                .then(res => {
                    console.log(res)
                    verNotificacion(value)
                }).catch(e=>console.log(e))
            })
            $("#ul-notification").append(i);
        })
    }
}
/**
 * Da formato a la fecha para presentar el tiempo transcurrido desde que llegó 
 * la notificación.
 * @param {String} fechaString 
 * @returns Cadena con el formato de fecha correspondiente.
 */
function formatearFecha(fechaString) {
    const fechaOrg = new Date(fechaString)
    const fechaAct = new Date()
    const diff = Math.abs(fechaAct - fechaOrg) // miliseconds
    const segs = Math.abs((diff / 1000)) // diferencia en segundos
    let mensajeSalida = "Hace un momento.";

    if(segs > 1 && segs < 60) {   // pasó 1 seg pero no un min
        mensajeSalida = `Hace ${segs.toFixed(0)} `
        mensajeSalida += (segs > 1) ? `segundos.` : `segundo.`
    } else if (segs > 60 && segs < 3600) { // si pasó 1 min pero no 1 h
        let diffM =Math.floor(segs/60)   // minutos
        mensajeSalida = `Hace ${diffM} `
        mensajeSalida += (diffM > 1) ? `minutos.` : "minuto."
    } else if (segs > 3600 && segs < 172800) {  // pasó 1 o más horas pero no 2 dias
        let diffH = Math.ceil((segs/60)/60)
        mensajeSalida = `Hace ${diffH} `
        mensajeSalida += (diffH > 1) ? `horas.` : `hora.`
    } else if (segs > 172800) { // si ya pasaron más de dos días.
        mensajeSalida = `${fechaOrg.toLocaleDateString()} ${fechaOrg.toLocaleTimeString()}.`
    }

    return mensajeSalida
}

// este método debe ir en un archivo independiente de notificaciones
function verNotificacion(value) {
    let modo_comprador=$("#profile").attr("data-modo");//esta en modo vendedor
    let nivel_pag=$("#profile").attr("data-nivel-pagina");// nivel es cero cuando se ven todas 
                                                          //las ordenes y 1 cuando es detalle 
                                                          //de una orden
    let quien_escribe = value.operacion.split(":")[0]
    
    //0.- no redirecciona solo conecta con metodo
    //1.- redireccion a pagina comprador con url de parameto
    //vendedor
    //2.- redireccion a pagina vendedor con url de parameto
    switch(value.trigger) {
        case 3:
        case 1: // chat.
            if (quien_escribe=='vendedor') {
                if (modo_comprador=='1') {
                    if (nivel_pag=='1') { // 1 significa que está en la página requerida.
                        $(`#ver_${value.idUsuarioEmisor}`).click()
                        break;
                    }
                }
                window.location.href = `${rutas.compradorOrden}?idOrden=${value.idItemOperacion}&notify=${value.idUsuarioEmisor}`   
                break;
            }
            if (modo_comprador=='0') {
                $(`#sol_bolt_${value.idItemOperacion}`).click()
                break;
            } 
            window.location.href = `${rutas.projectList}?notify=${value.idItemOperacion}`   
            break;
        case 2: // oferta en una solicitud..
            if (quien_escribe=='vendedor') {
                if (modo_comprador=='1') {
                    if (nivel_pag=='1') { // 1 significa que está en la página requerida.
                        $(`#item_${value.idUsuarioEmisor}`).css("background", "rgba(87, 189, 223, 0.18)")
                        window.location.href = `#item_${value.idUsuarioEmisor}`
                        setTimeout(() => {
                            $(`#item_${value.idUsuarioEmisor}`).css("background","initial")
                        },1500)                 
                        break;
                    }
                }
                window.location.href = `${rutas.compradorOrden}?idOrden=${value.idItemOperacion}#item_${value.idUsuarioEmisor}`   
                break;
            }
    }
}

function cambiarEstadoNotificacion(idItemOperacion, trigger, idUserReceptor) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            headers: {
                "Authorization": "Bearer "+sessionStorage.getItem("token")
            },
            url: `${apiUrl}notificacion?id=${idItemOperacion}&trigger=${trigger}&idUserReceptor=${idUserReceptor}`,
            success: res => resolve(res),
            error: err => { 
                cerrarSession(err)
                reject(err)
            }
        })
    })
}

function guardarNotificaciones(noti) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            headers: {
                "Authorization": "Bearer "+sessionStorage.getItem("token"),
                "Content-type": 'application/json'
            },
            url: `${apiUrl}notificaciones`,
            data: JSON.stringify(noti),
            success: res => resolve(res),
            error: err => { 
                cerrarSession(err)
                reject(err)
            }
        })
    });
}

export const notificador = {
    mostrarNotificaciones,
    obtenerNotificacionesPorIdUsuario,
    guardarNotificaciones,
    formatearFecha
}