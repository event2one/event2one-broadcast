const express = require("express");
const https = require("https");
const fs = require("fs");
const WebSocket = require("ws");
const PORT = 3000;
const app = express();
const path = require('path');
const { Server } = require("socket.io");
let cert = fs.readFileSync("/etc/ssl/www.event2one.com/autres-formats/www.event2one.com.pem");
let key = fs.readFileSync("/etc/ssl/www.event2one.com/www.event2one.com.key");
const options = {
	key,
	cert,
};

const mysql = require('mysql');

var db_config = {
	host: '94.124.81.190',
	user: 'event2one_com_www',
	password: 'KkgqP6rDABPfCqSp0UETNuTWc',
	database: 'event2one_com_www'
}
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));


const connection = mysql.createConnection(db_config);

connection.connect(function (err) {
	if (!err) {
		console.log("Database is connected ...");

	} else {
		console.log("Error connecting database ...");
	}
});

//set the view engine to ejs
app.set('view engine', 'ejs');



app.get("/", (req, res) => {
	res.send("Server is Running on HTTPs and ___xxxxWSSxxxx__");
});

app.get("/home/", async (req, res) => {
	res.send("Hello World !!!");
});

app.get("/event/:idEvent/admin/", async (req, res) => {

	var idEvent = req.params.idEvent

	//res.sendFile(__dirname + '/admin.html', {idEvent});
 
	res.render('admin2/index.ejs', {idEvent});
});

app.get("/client/", async (req, res) => {
	res.sendFile(__dirname + '/client.html');
});

app.get('/screen/:screenId', function (req, res) {

	var screenId = req.params.screenId;

	res.render('screen', { screenId: req.params.screenId });
});

var server = https.createServer(options, app);

const io = new Server(server, { /* options */ });

server.listen(PORT, () => {
	console.log("Server is Running on PORT " + PORT);
});

//const io  = new WebSocket.Server({ server });


io.on('connection', function (socket) {

	console.log('a user is connected');

	socket.broadcast.emit('check_connexion', (data) => data);

	socket.on('check_connexion', function (data) {

		io.emit('check_connexion', data)

		console.log('message recu' + data);
	});


	socket.on('updateMediaContainer', function (data) {

		room = `room${data.screenId}`;

		io.sockets.in(room).emit('updateMediaContainer', data)

		console.log('MediaContainer:' + data.iframeSrc + room);
	});

	socket.on('dire_bonjour', function (data) {

		console.log(data);
	});

	socket.on("message", function (data) {
		console.log("received: %s", data);
		io.emit('message', data)
	});

	// once a client has connected, we expect to get a ping from them saying what room they want to join
	socket.on('room', function (room) {

		socket.join(room);
		console.log("room", room);
		io.emit('message', room);
		io.sockets.in(room).emit('message', 'Direct messenger' + room);
	});


	socket.on('privateMessage', function (data) {

		console.log('Admin demande update de ' + data.screenId);

		// now, it's easy to send a message to just the clients in a given room
		room = "room" + data.screenId;

		socket.broadcast.emit('check_connexion', { screenId: data.screenId });

		io.sockets.in(room).emit('message', `Private messenger ${data.screenId} ${data.message} WTF!!!`);

		socket.broadcast.emit('message', 'weshalors les gens');
	});

})


console.log("Server is Running on PORT " + PORT);
