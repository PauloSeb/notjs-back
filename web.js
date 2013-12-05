var program = require('commander');
var dbAddress;
var WebSocketServer = require('ws').Server
, http = require('http')
, express = require('express')
, app = express()
, port = process.env.PORT || 5000;

// Define version/args
program
.version('0.4')
.option('-d, --db [value]', 'couchDB url')
.parse(process.argv);

if(program.db) {
	dbAddress = program.db;
} else {
	dbAddress = "http://localhost:5984";
}
console.log("Connecting DB:" + dbAddress);
var nano = require('nano')(dbAddress);

var notjs = nano.use('notjs');
notjs.insert({ helloworld: "ok" }, "hello", function(err, body, header) {
	if (err) {
		console.log('Helloworld failed: ', err.message);
		return;
	}
	console.log('Helloworld!')
	console.log(body);
});

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