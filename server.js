var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var dirs = ["l", "r", "f", "b", "s"];

/**
 * Serves index.html on route '/'
 */
app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});


/**
 * Listens to user connect event
 */
io.on('connection', function(socket){
    console.log('a user connected');

    /**
     * Listens to user disconnect 
     * event (default event)
     */
    socket.on('disconnect', function(){
        console.log('user dcd');
    });

    /**
     * Listens to event called 'test'
     */
    socket.on('test', function(msg){
        console.log(msg);
        io.sockets.emit('action', msg);
    });

    /**
     * Sends test directions to client
     * over event called 'action'
     *
     * l = left; r = right; f = forward; b = back; s = stop
     */
    setInterval(function(){
        var dir = dirs[Math.floor(Math.random()*dirs.length)];

        io.sockets.emit('action', dir);
    }, 7000);
});

http.listen(3000, function(){
    console.log('*3000');
});