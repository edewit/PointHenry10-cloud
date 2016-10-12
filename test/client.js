var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();
client.connect('ws://localhost:8001/ws');
//var client = new WebSocket('wss://pointingpoker-edewit.rhcloud.com:8443/ws');

client.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function (connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function (error) {
        console.log("Connection Error: ", error);
    });
    connection.on('close', function () {
        console.log('Connection Closed');
    });
    connection.on('message', function (message) {
        console.log("Received: ", message.utf8Data);
    });
});