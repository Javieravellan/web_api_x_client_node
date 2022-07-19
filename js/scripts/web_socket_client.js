/**
 * Clase encargada de emitir y receptar eventos con el protocolo websocket
 */
export class WebSocketClient {
    constructor(idUser) {
        this.io = io(/*`http://181.39.12.146:3000/`,*/ {query: `idUser=${idUser}`});
    }

    emitirEvento(eventName, data) {
        if (!data) {
            this.io.emit(eventName)
            return;
        }
        this.io.emit(eventName, data)
    }

    escucharEvento(eventName) {
        return new Promise((resolve, reject) => {
            this.io.on(eventName, (data) => {
                resolve(data)
            });
        })
    }
    
    get socket() {
        return this.io;
    }
}