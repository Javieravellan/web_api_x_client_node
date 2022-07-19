export class Cronometro {
    constructor(){
        this.cronomometro = null
    }

    // CRONÓMETRO
    iniciarCronometro(fechaInicio) {
        let fechaFuturo = new Date(fechaInicio) 
        fechaFuturo.setMinutes(fechaFuturo.getMinutes() + 10) // momento en el debe finalizar.
        let fechaActual =  new Date()
        if (fechaFuturo < fechaActual) { // fecha futuro anterior a fecha actual...
            clearInterval(this.cronometro)
            return
        }
        let diff = fechaFuturo - fechaActual
        let diffM = parseFloat(((diff/1000)/60).toFixed(2)) // obtiene minutos
        let diffS = Math.round((diffM % 1) * 60) // obtiene segundos

        let tiempo = new Date()
        tiempo.setMinutes(diffM)
        tiempo.setSeconds(diffS)
        let format = this.formatearTiempoCrono(diffM, diffS)
        $("#crono").html(format)
        $("#crono2").html(format)
        this.cronometro = setInterval(() => this.crearCronometro(tiempo), 1000)
    }

    // EJECUTA EL TEMPORIZADOR CADA SEGUNDO.
    crearCronometro(tiempo) {
        let min = tiempo.getMinutes(),
        sec = tiempo.getSeconds();

        if ($("#crono").html() !== "00:00") {
            tiempo.setSeconds(sec - 1)
            let tiempoActual = this.formatearTiempoCrono(min, sec)
            $("#crono").html(tiempoActual)
            $("#crono2").html(tiempoActual)
            return
        }
        $("#crono").html("00:00")
        $("#crono2").html("00:00")
        clearInterval(this.cronometro)
    }

    // Utils
    formatearTiempoCrono(min, sec) {
        let minutoActual = (min < 10) ? "0" + min
            : min;
        let segundoActual = (sec < 10) ? "0" + sec 
            : sec;
        return minutoActual +":"+ segundoActual
    }

    get temporizador() {
        return this.cronometro
    }
}