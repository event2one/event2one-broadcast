const express = require("express");
require('dotenv').config();
const lib = require("./lib.js");
const https = require("https");
const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");
const PORT = process.env.PORT || 3000;
const app = express();
const path = require('path');
const axios = require('axios');
const { Server } = require("socket.io");

let server;
try {
	let cert = fs.readFileSync("/etc/ssl/www.event2one.com/autres-formats/www.event2one.com.pem");
	let key = fs.readFileSync("/etc/ssl/www.event2one.com/www.event2one.com.key");
	const options = {
		key,
		cert,
	};
	server = https.createServer(options, app);
	console.log("SSL certificates found. Starting HTTPS server.");
} catch (e) {
	console.log("SSL certificates not found. Starting HTTP server.");
	server = http.createServer(app);
}

const io = new Server(server, {
	cors: {
		origin: "http://localhost:3001",
		methods: ["GET", "POST"]
	}
});

const API_URL = 'https://www.mlg-consulting.com/smart_territory/form/api.php';

const mysql = require('mysql');

var db_config = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
}
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.use(express.json());
app.set('view engine', 'ejs');

const connection = mysql.createConnection(db_config);

connection.connect(function (err) {
	if (!err) {
		console.log("Database is connected ...");

	} else {
		console.log("Error connecting database ...");
	}
});

const getConfEvent = async ({ idEvent, idConfEvent }) => {

	try {
		return await axios.get(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getConfEvent&id_event=${idEvent}&filter= AND type NOT IN(5, 65, 69, 84, 92, 95) AND publier!='n' AND id_conf_event IN(${idConfEvent}) `)
	} catch (error) {
		console.error(error)
	}
}

const getEvents = async ({ idEvent, idConfEvent }) => {
	try {
		return await axios.get(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getEvents&id_event=${idEvent}'`)

	} catch (error) {
		console.error(error)
	}
}

const getConfEventContribution = async ({ idEvent, idConfEvent }) => {

	try {
		return await axios.get(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getConfEventContribution&filter= WHERE id_conf_event IN(SELECT id_conf_event FROM conf_event WHERE id_event ="${idEvent}") AND id_conf_event IN(${idConfEvent}) ORDER BY conf_event_contribution_order ASC`)
	} catch (error) {
		console.error(error)
	}
}
const getPrestaList = async ({ idEvent, idConfEvent }) => {

	//const params = `WHERE id_contact IN(SELECT id_contact FROM conferenciers WHERE id_event=${idEvent})`;
	const params = `WHERE (id_contact IN(SELECT id_contact FROM conferenciers WHERE id_event=${idEvent} AND id_contact NOT IN("",0) AND id_conf_event IN(${idConfEvent}))) OR (id_contact IN (SELECT id_contact FROM conf_event_contribution WHERE id_conf_event IN (SELECT id_conf_event FROM conf_event WHERE id_event=${idEvent} AND id_conf_event IN(${idConfEvent})) AND id_contact NOT IN("",0)))`;

	try {
		return await axios.get(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getPrestaList&params=${params}`)
	} catch (error) {
		console.error(error)
	}
}

const getEventContactTypeList = async () => {

	return await axios.get('https://www.mlg-consulting.com/smart_territory/form/api.php?action=getEventContactTypeList&filter=WHERE event_contact_type_state="active"')
}

const getContactStatutList = async ({ idEvent, idConfEvent }) => {

	const filter = `WHERE id_contact IN(SELECT id_contact FROM conferenciers WHERE id_event=${idEvent} AND id_contact NOT IN(0, '') AND id_conf_event IN(${idConfEvent}) ) OR (id_contact IN (SELECT id_contact FROM conf_event_contribution WHERE id_contact NOT IN(0, '') AND  id_conf_event IN (SELECT id_conf_event FROM conf_event WHERE id_event=${idEvent} AND id_conf_event IN(${idConfEvent}))))`;

	const url = `https://www.mlg-consulting.com/smart_territory/form/api.php?action=getContactStatutList&filter=${filter}`

	try {
		const res = await axios.get(url)

		//console.log(url);
		return res;
	} catch (error) {
		console.error(error)
	}
}


const getPartenaires = async ({ idEvent, idConfEvent }) => {

	try {

		let req;

		if (idConfEvent == "0") {
			req = `https://www.mlg-consulting.com/smart_territory/form/api.php?action=getPartenaires&params= AND id_event=${idEvent} and afficher !='0'`;
		} else {
			req = `https://www.mlg-consulting.com/smart_territory/form/api.php?action=getPartenaires&params= AND id_event=${idEvent} AND id_conf_event IN(${idConfEvent}) and afficher !='0'`;
		}

		console.log(req)
		return await axios.get(req)
	} catch (error) {
		console.error(error)
	}
}

const getPartenaires2 = async ({ idEvent, idConfEvent }) => {

	// Requête SQL corrigée avec des placeholders (?) pour la sécurité
	const sql = `
        SELECT 
		id_conferencier,
		cf.id_conf_event,
		c.id_contact, c.prenom, c.nom, c.societe ,
		libelle, ect.id_event_contact_type, ect.event_contact_type_color
        FROM contacts c 
        JOIN conferenciers cf ON c.id_contact = cf.id_contact 
		JOIN conf_event ce ON cf.id_conf_event = ce.id_conf_event
		JOIN event_contact_type ect ON cf.statut = ect.id_event_contact_type
        WHERE cf.id_event = ? AND cf.id_conf_event = ? 
        GROUP BY c.id_contact
    `;

	return new Promise((resolve, reject) => {
		connection.query(sql, [idEvent, idConfEvent], (error, results) => {
			if (error) {
				console.error("Erreur lors de l'exécution de la requête SQL:", error);
				return reject(error);
			}

			const formatedResults = results.map(row => ({
				id_conferencier: row.id_conferencier,
				contact: { id_contact: row.id_contact, prenom: row.prenom, nom: row.nom, societe: row.societe },
				event: {},
				id_conf_event: { id_conf_event: row.id_conf_event },
				conf_event: { id_conf_event: row.id_conf_event },
				conferencier_statut: { libelle: row.libelle, id_event_contact_type: row.id_event_contact_type, event_contact_type_color: row.event_contact_type_color }
			}));

			console.log("Résultats de getPartenaires2:", formatedResults);
			// Retourner directement le tableau d'objets
			resolve(formatedResults);
		});
	});
};


app.get('/', (req, res) => {
	res.render('index');
});

app.get('/screen/:id', (req, res) => {
	const screenId = req.params.id;
	res.render('screen', { screenId });
});

app.get('/event/:idEvent/admin/:idConfEvent', async (req, res) => {
	const { idEvent, idConfEvent } = req.params;

	try {
		const [
			confEventList,
			events,
			confEventContributionList,
			prestaList,
			eventContactTypeList,
			contactStatutList,
			partenaireList
		] = await Promise.all([
			getConfEvent({ idEvent, idConfEvent }),
			getEvents({ idEvent, idConfEvent }),
			getConfEventContribution({ idEvent, idConfEvent }),
			getPrestaList({ idEvent, idConfEvent }),
			getEventContactTypeList(),
			getContactStatutList({ idEvent, idConfEvent }),
			getPartenaires({ idEvent, idConfEvent })
		]);

		res.render('admin2/index', {
			idEvent,
			idConfEvent,
			confEventList: confEventList.data,
			confEventContributionList: confEventContributionList.data,
			partenaireList: partenaireList.data,
			prestaList: prestaList.data,
			contactStatutList: contactStatutList.data,
			eventContactTypeList: eventContactTypeList.data
		});
	} catch (error) {
		console.error(error);
		res.status(500).send('Internal Server Error');
	}
});

app.get('/api/partenaires/:idEvent/:idConfEvent', async (req, res) => {
	const { idEvent, idConfEvent } = req.params;
	try {
		const partenaires = await getPartenaires2({ idEvent, idConfEvent });
		res.json(partenaires);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

app.post('/api/update-order', async (req, res) => {
	const { order } = req.body; // Array of { id_conferencier, order }

	if (!order || !Array.isArray(order)) {
		return res.status(400).json({ success: false, message: "Invalid data format." });
	}

	try {
		// Use a transaction or Promise.all to update multiple rows
		const updatePromises = order.map(item => {
			return new Promise((resolve, reject) => {
				const sql = "UPDATE conferenciers SET ordre = ? WHERE id_conferencier = ?";
				connection.query(sql, [item.order, item.id_conferencier], (err, result) => {
					if (err) reject(err);
					else resolve(result);
				});
			});
		});

		await Promise.all(updatePromises);

		res.json({ success: true, message: "Order updated successfully." });

	} catch (error) {
		console.error("Failed to update conferencier order:", error.message);
		res.status(500).json({ success: false, message: "Error updating order." });
	}
});

app.post("/api/update-conferencier-order", async (req, res) => {
	const updates = req.body.order; // Ex: [{id: '123', order: 1}, {id: '456', order: 2}]

	if (!updates || !Array.isArray(updates)) {
		return res.status(400).json({ success: false, message: "Invalid data format." });
	}
	try {
		// Créer un seul objet de paramètres
		const params = new URLSearchParams();
		// Stringifier le tableau complet et l'assigner à la clé 'order'
		params.append('order', JSON.stringify(updates));

		// Revenir à axios.post qui fonctionnait de manière fiable
		const response = await axios.post('https://www.mlg-consulting.com/smart_territory/form/api.php?action=updateConferencierOrder', params);

		// Vérifier si la réponse d'axios contient bien des données
		if (!response.data) {
			throw new Error(`PHP API responded with empty data.`);
		}

		res.json({ success: true, message: "Order updated successfully." });

	} catch (error) {
		console.error("Failed to update conferencier order:", error.message);
		res.status(500).json({ success: false, message: "Error updating order." });
	}
});

server.listen(PORT, () => {
	console.log("Server is Running on PORT " + PORT);
});


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

		console.log(room + "\t" + ' MediaContainer : ' + data.iframeSrc);
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
		room = "room" + data.screenId + "\n";

		socket.broadcast.emit('check_connexion', { screenId: data.screenId });

		io.sockets.in(room).emit('message', `Private messenger ${data.screenId} ${data.message} WTF!!!`);

		socket.broadcast.emit('message', 'weshalors les gens');
	});

})


console.log("Server is Running on PORT " + PORT + publicPath
);
