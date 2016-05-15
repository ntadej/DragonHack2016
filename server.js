var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var fs = require('fs');

/********** Init **********/

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

/**
 * All possible directions
 * l = left, r = right, f = forward
 * b = backwards, s = stop
 */
var directions = ["l", "r", "f", "b", "s"];
/**
 * Current direction. This is displayed
 * on /api/direction at all times
 */
var currentDirection = "r";

var listOfBroadcasts = {};
var initCars = {
    "cars": [{
        "id": 1,
        "name": "Maggie"
    }]
};
var allCars = {
    "cars": [{
        "id": 2,
        "name": "Abraham"
    }, {
        "id": 3,
        "name": "Oliver"
    }]
};

/********** Routes **********/

/**
 * Serves index.html on route '/'
 */
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

/**
 * Get request for current direction
 */
app.get('/api/direction', function(req, res){
    res.send('0123456789' + currentDirection);
});

/**
 * List of initiated cars
 */
app.get('/api/cars', function(req, res) {
    res.json(initCars);
});

/**
 * Cars by id
 */
app.get('/api/cars/1', function(req, res) {
    res.json({
        "car": initCars.cars[0]
    });
});

app.get('/api/cars/2', function(req, res) {
    res.json({
        "car": initCars.cars[1]
    });
});

app.get('/api/cars/3', function(req, res) {
    res.json({
        "car": initCars.cars[2]
    });
});

app.get('/test', function(req, res){
    res.sendFile(__dirname + '/public/test.html');
});

app.get('/testgyro', function(req, res){
    res.sendFile(__dirname + '/public/testgyro.html');
});

/**
 * Serves static files from public folder
 */
app.use(express.static('public'));

/**
 * In case no url is matched, return same as '/'
 */
app.use(function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

/********** Sockets **********/

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
     * Takes name of the car as msg
     * If a car by that name exists
     * in allCars and that same car
     * is not yet in initCars, add it
     */
    socket.on('initcar', function(msg){
        var newCar;

        allCars.cars.forEach(function(car){
            if(car.name == msg){
                if(!initCars.cars.inArray(car))
                    initCars.cars.push(car);
            }
        });
    });

    /**
     * Logs changes in device movement
     * Turn right = negative alpha
     * Turn left = positive alpha (no shit sherlock)
     */
    socket.on('directionChange', function(msg){
        /**
         * If direction changes, change it on /api/direction
         */
        if(directions.inArray(msg))
            changeDirection(msg);
        console.log(JSON.stringify(msg));
    });

    /**
     * Sends test directions to client
     * over event called 'action'
     *
     * l = left; r = right; f = forward; b = back; s = stop
     */

    setInterval(function() {
        var dir = getRandomDirection();

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


/********** Helpers **********/

function getRandomDirection(){
    return directions[Math.floor(Math.random() * directions.length)];
}

function changeDirection(direction){
    if(directions.inArray(direction))
        currentDirection = direction;
}

// check if an element exists in array using a comparer function
// comparer : function(currentElement)
Array.prototype.inArray = function(comparer) { 
    for(var i=0; i < this.length; i++) { 
        if(this[i] == comparer) return true; 
    }
    return false; 
};