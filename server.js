var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var fs = require('fs');

// Add headers
app.use(function(req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

var dirs = ["l", "r", "f", "b", "s"];
var listOfBroadcasts = {};
var cars = {
        "cars": [{
            "id": 1,
            "name": "Abraham"
        }, {
            "id": 2,
            "name": "Oliver"
        }]
    }
    /**
     * Serves index.html on route '/'
     */
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/direction', function(req, res){
    res.send(getRandomDir());
});

app.get('/api/cars', function(req, res) {
    res.json(cars);
});

app.get('/api/cars/1', function(req, res) {
    res.json({
        "car": cars.cars[0]
    });
});

app.get('/api/cars/2', function(req, res) {
    res.json({
        "car": cars.cars[1]
    });
});

app.use(express.static('public'));

app.use(function(req, res) {
    res.redirect('/');
});

/**
 * Listens to user connect event
 */
io.on('connection', function(socket) {
    console.log('a user connected');

    /**-
     * Listens to user disconnect
     * event (default event)
     */
    socket.on('disconnect', function() {
        console.log('user dcd');
    });

    /**
     * Listens to event called 'test'
     */
    socket.on('test', function(msg) {
        console.log(msg);
        io.sockets.emit('action', msg);
    });

    /**
     * Sends test directions to client
     * over event called 'action'
     *
     * l = left; r = right; f = forward; b = back; s = stop
     */
    setInterval(function() {
        var dir = getRandomDir();

        io.sockets.emit('action', dir);
    }, 7000);

});

http.listen(3000, function() {
    console.log('*3000');
});

/**
 * WebRTC scalable server
 */
require('./WebRTC-Scalable-Broadcast.js')(io);

function getRandomDir(){
    return dirs[Math.floor(Math.random() * dirs.length)];
}