// Web server (Express)
var express = require('express');
var app = express();    
var server = app.listen(process.env.PORT || 3000);
app.use(express.static(__dirname));

console.log('My socket server is running');

// Sockets (socket.io), attached to the same server
var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', newConnection);

function newConnection(socket) {
  console.log('new connection: ' + socket.id);

  socket.on('mouse', mouseMsg);

  function mouseMsg(data) {
    // send to everyone EXCEPT the sender
    socket.broadcast.emit('mouse', data);

    // alternative: send to everyone INCLUDING the sender
    // io.sockets.emit('mouse', data);

    console.log(data);
  }
}