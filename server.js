const express = require("express")
//const open = require('open')
const app = express()
const sk = require('./server_socket/serverSocket')
 
// config server
app.set('port', process.env.PORT || 3000)

app.use(express.static(__dirname)) // directorio principal

const server = app.listen(app.get('port'), () => {
    console.log(`Escuchando en el puerto ${app.get('port')}`)
})

sk.StartSocket(server);