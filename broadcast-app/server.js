const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const mysql = require('mysql');
const axios = require('axios');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3001;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Database configuration
const db_config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

const connection = mysql.createConnection(db_config);

connection.connect(function (err) {
    if (!err) {
        console.log("Database is connected ...");
    } else {
        console.log("Error connecting database ...", err);
    }
});

// API helper functions (from old server.js)
const getConfEvent = async ({ idEvent, idConfEvent }) => {
    try {
        return await axios.get(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getConfEvent&id_event=${idEvent}&filter= AND type NOT IN(5, 65, 69, 84, 92, 95) AND publier!='n' AND id_conf_event IN(${idConfEvent}) `);
    } catch (error) {
        console.error(error);
    }
};

const getEvents = async ({ idEvent, idConfEvent }) => {
    try {
        return await axios.get(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getEvents&id_event=${idEvent}'`);
    } catch (error) {
        console.error(error);
    }
};

const getConfEventContribution = async ({ idEvent, idConfEvent }) => {
    try {
        return await axios.get(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getConfEventContribution&filter= WHERE id_conf_event IN(SELECT id_conf_event FROM conf_event WHERE id_event ="${idEvent}") AND id_conf_event IN(${idConfEvent}) ORDER BY conf_event_contribution_order ASC`);
    } catch (error) {
        console.error(error);
    }
};

const getPrestaList = async ({ idEvent, idConfEvent }) => {
    const params = `WHERE (id_contact IN(SELECT id_contact FROM conferenciers WHERE id_event=${idEvent} AND id_contact NOT IN("",0) AND id_conf_event IN(${idConfEvent}))) OR (id_contact IN (SELECT id_contact FROM conf_event_contribution WHERE id_conf_event IN (SELECT id_conf_event FROM conf_event WHERE id_event=${idEvent} AND id_conf_event IN(${idConfEvent})) AND id_contact NOT IN("",0)))`;
    try {
        return await axios.get(`https://www.mlg-consulting.com/smart_territory/form/api.php?action=getPrestaList&params=${params}`);
    } catch (error) {
        console.error(error);
    }
};

const getEventContactTypeList = async () => {
    return await axios.get('https://www.mlg-consulting.com/smart_territory/form/api.php?action=getEventContactTypeList&filter=WHERE event_contact_type_state="active"');
};

const getContactStatutList = async ({ idEvent, idConfEvent }) => {
    const filter = `WHERE id_contact IN(SELECT id_contact FROM conferenciers WHERE id_event=${idEvent} AND id_contact NOT IN(0, '') AND id_conf_event IN(${idConfEvent}) ) OR (id_contact IN (SELECT id_contact FROM conf_event_contribution WHERE id_contact NOT IN(0, '') AND  id_conf_event IN (SELECT id_conf_event FROM conf_event WHERE id_event=${idEvent} AND id_conf_event IN(${idConfEvent}))))`;
    const url = `https://www.mlg-consulting.com/smart_territory/form/api.php?action=getContactStatutList&filter=${filter}`;
    try {
        const res = await axios.get(url);
        return res;
    } catch (error) {
        console.error(error);
    }
};

const getPartenaires = async ({ idEvent, idConfEvent }) => {
    try {
        let req;
        if (idConfEvent == "0") {
            req = `https://www.mlg-consulting.com/smart_territory/form/api.php?action=getPartenaires&params= AND id_event=${idEvent} and afficher !='0'`;
        } else {
            req = `https://www.mlg-consulting.com/smart_territory/form/api.php?action=getPartenaires&params= AND id_event=${idEvent} AND id_conf_event IN(${idConfEvent}) and afficher !='0'`;
        }
        console.log(req);
        return await axios.get(req);
    } catch (error) {
        console.error(error);
    }
};

// Export helpers for use in API routes
module.exports.dbHelpers = {
    connection,
    getConfEvent,
    getEvents,
    getConfEventContribution,
    getPrestaList,
    getEventContactTypeList,
    getContactStatutList,
    getPartenaires
};

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Socket.IO setup
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', function (socket) {
        console.log('a user is connected');

        socket.broadcast.emit('check_connexion', (data) => data);

        socket.on('check_connexion', function (data) {
            io.emit('check_connexion', data);
            console.log('message recu' + data);
        });

        socket.on('updateMediaContainer', function (data) {
            const room = `room${data.screenId}`;
            io.sockets.in(room).emit('updateMediaContainer', data);
            console.log(room + "\t" + ' MediaContainer : ' + data.iframeSrc);
        });

        socket.on('dire_bonjour', function (data) {
            console.log(data);
        });

        socket.on("message", function (data) {
            console.log("received: %s", data);
            io.emit('message', data);
        });

        socket.on('room', function (room) {
            socket.join(room);
            console.log("room", room);
            io.emit('message', room);
            io.sockets.in(room).emit('message', 'Direct messenger' + room);
        });

        socket.on('privateMessage', function (data) {
            console.log('Admin demande update de ' + data.screenId);
            const room = "room" + data.screenId + "\n";
            socket.broadcast.emit('check_connexion', { screenId: data.screenId });
            io.sockets.in(room).emit('message', `Private messenger ${data.screenId} ${data.message} WTF!!!`);
            socket.broadcast.emit('message', 'weshalors les gens');
        });
    });

    // Make io accessible to API routes
    server.io = io;

    server
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
