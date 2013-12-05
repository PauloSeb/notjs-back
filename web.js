// Requisites
var program = require('commander');
var dbAddress;
var WebSocketServer = require('ws').Server
, http = require('http')
, express = require('express')
, app = express()
, port = process.env.PORT || 5000;

// Define version/args
program
.version('0.5')
.option('-d, --db [value]', 'couchDB url')
.parse(process.argv);

// DB initialization
if(program.db) {
	dbAddress = program.db;
} else {
	dbAddress = "http://localhost:5984";
}
console.log("Connecting DB:" + dbAddress);
var nano = require('nano')(dbAddress);
var notjs = nano.use('notjs');

// Server listening
app.use(express.static(__dirname + '/'));
var server = http.createServer(app);
server.listen(port);
console.log('http server listening on %d', port);

// Websocket
var wss = new WebSocketServer({server: server});
console.log('websocket server created');
wss.on('connection', function(ws) {
	console.log((new Date()) + " Connection accepted.");

	ws.on('message', function(message) {
		console.log("Received Message: " + message);
		var received = JSON.parse(message);
		switch(received.type)
		{
			case 'test':
			ws.send("helloworld");
			break;
			case 'getUserByFb':
			notjs.view('users', 'getUserByFBID', { key : received.payload.fbid }, function(err, body) {
				if (!err) {
					body.rows.forEach(function(doc) {
						console.log((new Date()).toUTCString() + " :: user " + doc.value._id + " found!");
						ws.send(JSON.stringify(doc.value));
					});
				} else { console.log(err);}
			});
			break;
			default:
			console.log("Unknown message type");
			ws.send(message);
		}
	});

	ws.on('close', function(connection) {
		console.log((new Date()) + " Disconnected");
	});
});