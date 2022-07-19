import { onSuccess, showData } from './project_list.js';
import { validarFormulario } from './validador.js';

const cliente = io();
var ofertaCompra;

/*cliente.on('newed', (obj) => {
    if (cliente.id !== obj.IDEmisor) {
        let alerta = crearAlerta(obj.count)
        $("#alerta").html(alerta)
        return;
    }

    if (!ofertaCompra) alert('No es posible actualizar porque la oferta no ha sido enviada correctamente.');
    else {
        $("form[name='form_crear']")[0].reset();
        $("#in_auto").html("")
        $("input[name='submit']").val("Enviar")
        $(".modal").modal('hide');
        showData([ofertaCompra]);
    }
});*/

cliente.on('update', () => {
    const request = $.ajax({
        url: `http://localhost:4838/api/Exchange/solicitud/`, // url de API
        type: `GET`,
        data: `id=${ $("#lastID").val() }&idUsuario=2`,
        crossDomain: true
    })
    $.when(request).done(onSuccess).fail(() => alert("Ocurrió un error al procesar la solicitud"))
    .always(() => { 
        $(".alert").alert('close');
    })
})

function notificar(e) {
    if (validarFormulario(e)) {
        enviarFormulario();
    }
}

function crearAlerta(count) {
    return `<div id='alert' class="alert alert-success solid alert-dismissible fade show" role='alert'>
        <strong>Hay ${count} solicitudes nuevas</strong>.
        <button class="close h-100" data-dismiss='alert' aria-label="Close">
            <span><i class="mdi mdi-close"></i></span>
        </button>
    </div>`;
}

// función auto invocable, se ejecuta automaticamente luego de que el intérprete
// termine de leerla
(() => {
    $('#alerta').on('click', () => {
        $("#alerta strong").html(`Actualizando...`)
        //cliente.emit('closedAlert')
    })
})();

function enviarFormulario() {
    let fechaFin = new Date()
    fechaFin.setMinutes(fechaFin.getMinutes() + $("#in_tiempo").val())
    ofertaCompra = {
        "calificacionUsuario": 10,
        "idUsuario": 3,
        "propuestas": 0,
        "requerimientoDescripcion": $("#select_valor > option:selected").text(),
        "valorEntregaDescipcion": $("#select_de > option:selected").text(),
        "origenReq": "AppCoin",
        "receptores": $("button[data-id=sel2]").attr('title'),
        "requerimientoCantidad": $("#valor").val(),
        "valorOfertadoXRequerimiento": $("#in_valor_a").val(),
        "valorComisionDescripcion": "nada",
        "valorComision": 0.0,
        "emisorHash": "512 bits",
        "tiempoDeseado": $("#in_tiempo").val(),
        "estado": "Pendiente",
        "tipoOperacion": "Solicitud compra",
        "fechaInicio": new Date(),
        "fechaFin": fechaFin,
        "valorEntregaCantidad": $("#in_auto").html()
    }

    $("input[name='submit']").val("Enviando...")

    const req = $.ajax({
        url: 'http://localhost:4838/api/Exchange/crearSolicitud',
        type: 'post',
        data: JSON.stringify(ofertaCompra),
        contentType: 'application/json',
    })
    $.when(req).done(funcDone).fail(() => alert("Ocurrió un error al procesar la solicitud"));
}
function funcDone(response, textStatus, xhr) {
    cliente.emit('new', {name: 'nombre'})
}