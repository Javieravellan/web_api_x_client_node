/**
 * Created by Javier
 */
'use strict'

const io = require('socket.io');

var serverSocket;
var clients = [];

/**
 * Inicia el canal de comunicación dado un servidor http
 * @param {*} httpServer 
 */
exports.StartSocket = (httpServer) => {
    if (!httpServer) {
        throw Error('El servidor http no está definido')
    }
    serverSocket = new io(httpServer, {wsEngine: 'ws'});
    serverSocket.on('connection', onConnection)
}

function onConnection(socket) {
    //console.log(`Se ha conectado un nuevo cliente: ${socket.id}`)
    let idUser = parseInt(socket.handshake.query.idUser)
    // buscar si ya tenemos registrado un socket con ese id de usuario
    let encontrado = _buscarClienteRegistrado(idUser)

    if (encontrado !== undefined) clients[encontrado].socketID = socket.id;
    else clients.push({socketID: socket.id, counter: 0, idUser: idUser})

    socket.on("connect_error", onConnectError)
    socket.on('disconnect', () => onDisconnect(socket))
    socket.on('new', (data) => onNew(socket, data));
    socket.on('haOfertado', (data) => haOfertado(socket, data));
    socket.on('visto', (data) => onVisto(socket, data))
    socket.on('cerrarAlerta', () => onCerrarAlerta(socket))
    socket.on('cambioEstadoOferta', onCambioEstadoOferta)
    socket.on('ofertaIgnorada', onOfertaIgnorada)
    socket.on('pagado', onTransaccionPagada)
    socket.on('tran-cancel', onTransaccionCancelada)
    socket.on("chat-message", onNewChatMessage)
    socket.on('tran-finalizada', onTransaccionFinalizada)
}

function onConnectError(err) {
    console.log("[ERROR]", err.message)
}

function onDisconnect(socket) {
    console.log(`Se ha desconectado el cliente: ${socket.id}`)
    clients = clients.filter(c => c.socketID !== socket.id)
    //console.log(clients)
}

function onNew(socket, data) {
    clients.forEach(element => {
        if (element.socketID !== socket.id) {
            element.counter++
            serverSocket.to(element.socketID)
            .emit('nuevaSolicitud', {
                count: element.counter, 
                IDEmisor: socket.id, 
                idOrden: data.idOrden,
                idRoomActivo: data.idRoomActivo
            })
        }
    })
}

function haOfertado(socket, data) {
    console.log("[EVENTO OFERTA]", "Ofertante",data.idUsuario)
    let client = clients.find((elem) => elem.idUser == data.receptor)
    if (client === undefined) return;
    client.counter = 0
    serverSocket.to(client.socketID).emit('update', {
        propuesta: data.propuesta, 
        idOrden: data.idOrden,
        idOferta: data.idOferta,
        idUsuario: data.idUsuario,
        nombreUsuario: data.nombreUsuario,
        valorOferta: data.valorOferta,
        descripcionValorOferta: data.descripcionValorOferta,
        requerimientoDescripcion: data.descripcionValorOferta,
        cantidadRequerimiento: data.cantidadRequerimiento,
        estado: data.estado,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        fotoPerfil: data.fotoPerfil
    })
}

function onVisto(socket, data) {
    console.log("[EVENTO VISTO]", data)
    let receptor = clients.find(elem => elem.idUser == data.idUser)
    serverSocket.to(receptor.socketID).emit('visto', {idOrden: data.idOrden, incremento: data.count})
}

function onCerrarAlerta(socket) {
    clients.forEach(elem => {
        if (socket.id == elem.socketID) elem.counter = 0
    })
}

function onCambioEstadoOferta(data) {
    console.log("[EVENTO ESTADO-OFERTA]", "Emisor",data.idSolicitante)
    let receptor = clients.find(elem => elem.idUser == data.idReceptor)

    if (receptor === undefined) return;
    console.log(receptor)
    serverSocket.to(receptor.socketID).emit("cambioEstadoOferta", data)
}

function onOfertaIgnorada(data) {
    console.log(data)
    let receptor = clients.find(elem => elem.idUser == data.idReceptor)
    if (receptor == undefined) return;
    serverSocket.to(receptor.socketID).emit('ofertaIgnorada', data)
}

function onTransaccionPagada(data) {
    console.log("[EVENTO DE PAGO]", "Emisor",data.idEmisor)
    let receptor = clients.find(elem => data.idReceptor == elem.idUser)
    if (receptor == undefined) return;
    serverSocket.to(receptor.socketID).emit('pagado', data)
}

function onNewChatMessage(data) {
    console.log("[EVENTO CHAT]","Emisor",data.yo);
    let receptor = clients.find(elem => data.other == elem.idUser)
    if (receptor == undefined) return; console.log(receptor.socketID)
    serverSocket.to(receptor.socketID).emit('chat-message', data)
}

function onTransaccionCancelada(data) {
    console.log("[EVENTO CANCELAR]","Cancelador",data.idEmisor,"- Receptor",data.idReceptor)
    let receptor = clients.find(elem => data.idReceptor == elem.idUser)
    if (receptor == undefined) return;
    serverSocket.to(receptor.socketID).emit('tran-cancel', data);
}

function onTransaccionFinalizada(data) {
    console.log("[TRAN-FINALIZADA]",data)
    let receptor = clients.find(elem => data.idOfertante == elem.idUser)
    if (receptor == undefined) return;
    serverSocket.to(receptor.socketID).emit('tran-finalizada', data);
}

function _buscarClienteRegistrado(idUser) {
    for (var e in clients) {
        if (clients[e].idUser === idUser) 
            return e;
    }
}