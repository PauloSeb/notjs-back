var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/'));

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var wss = new WebSocketServer({server: server});
console.log('websocket server created');
wss.on('connection', function(ws) {
	console.log((new Date()) + " Connection accepted.");
 
	ws.on('message', function(message) {
    	console.log("Received Message: " + message);
    	ws.send(message);
	});
 
	ws.on('close', function(connection) {
    	console.log((new Date()) + " Disconnected");
  	});
});