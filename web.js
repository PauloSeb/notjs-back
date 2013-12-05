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
					if(body.rows.length==0) {
						notjs.insert({ type: "user", fbid: received.payload.fbid, name: received.payload.name }, function(err, body) {
							if (!err) {
								console.log((new Date()).toUTCString() + " :: user " + JSON.stringify(body.id) + " created!");
								var answer = {"type":"userId","payload":{"id":body.id}};
								console.log(JSON.stringify(answer));
								ws.send(JSON.stringify(answer));
							}
						});
					} else {
						body.rows.forEach(function(doc) {
							console.log((new Date()).toUTCString() + " :: user " + doc.value._id + " found!");
							var answer = {"type":"userId","payload":{"id":doc.value._id}};
							console.log(JSON.stringify(answer));
							ws.send(JSON.stringify(answer));
						});
					}
				} else { console.log(err);}
			});
			break;
			case 'createSale':
			notjs.insert({ type: "product", name: received.payload.name, description: received.payload.description }, function(err, body) {
				if (!err) {
					console.log((new Date()).toUTCString() + " :: product " + body.id + " created!");
					notjs.insert({ type: "sale", date: (new Date()).toUTCString(), price: received.payload.price, product: body.id, seller: received.payload.seller }, function(err, body) {
						if (!err) {
							console.log((new Date()).toUTCString() + " :: sale " + body.id + " created!");
							var answer = {"type":"saleId","payload":{"id":body.id}};
							console.log(JSON.stringify(answer));
							ws.send(JSON.stringify(answer));
						}
					});
				}
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