var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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
    })

    /**
     * Sends test message to client
     * over event called 'servertest'
     */
    setInterval(function(){
        console.log('y');
        io.sockets.emit('servertest', {msg: 'server sent this'});
    }, 1000);
});

http.listen(3000, function(){
    console.log('*3000');
});