// Use the http module: http://nodejs.org/api/http.html
var http = require('http');
var url = require('url');
var formidable = require('formidable');
var sys = require('sys');
var querystring = require('querystring');
var fs = require('fs');

function requestHandler(req, res){
	/*if(req.url == '/upload' && req.method.toLowerCase() == 'post') {
		console.log("Request handler 'upload' was called");

		var form = new formidable.IncomingForm();
		console.log("about to parse");

		form.parse(req, function(error, fields, files){
			console.log("parsing done");

			fs.rename(files.upload.path, "/tmp/video.mp4", function(error){
				if (error) {
					fs.unlink("/tmp/video.mp4");
					fs.rename(files.upload.path, "/tmp/video.mp4");
				}
				
			});

		//display uploaded mobile video
		//res.writeHead(200, {"Content-Type": "video/mp4"});
		//res.write("received image:<br/>");
		//res.write("<video controls autoplay><source src='/show' /></video>");
		//res.end();
		});
	}
		// show everyone's video if route is /show
	 else if (req.url == '/show') {
		console.log("Request handler 'show' was called");
		res.writeHead(200, {"Content-Type": "video/mp4"});
		fs.createReadStream("/tmp/video.mp4").pipe(res);

	} else {

	// show a file upload form
	res.writeHead(200, {'content-type': 'videp/mp4'});
	res.end(
		'<form action="/upload" enctype="multipart/form-data" '+ 'method="post">' +
		'<input type="text" name="title"><br>' +
		'<input type="file" name="upload" multiple="multiple"><br>' +
		'<input type="submit" value="Upload!!!">' +
		'</form>'
		);
	}*/


		fs.readFile(__dirname + '/index-image.html', 
			// Callback function for reading
			function (err, data) {
			// if there is an error
			if (err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
			}
		);

}

var httpServer = http.createServer(requestHandler);

httpServer.listen(7171);

console.log('server listening on 7171');


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);
var clients = new Array();
var activeuser = 0;
var pacg_ = new Array();
var allnicks = new Array();
var lengt = 0;
io.sockets.on('connection', 
	
	function (socket) {
	
		console.log("We have a new client: " + socket.id);
		
        var usernumber = null;
        usernumber = clients.length;
		clients[usernumber] = socket.id;
		socket.emit('set_id', usernumber);
		
		socket.on('addnick', function(nick){
			socket.nick = nick;
			allnicks.push(nick);
			socket.broadcast.emit('addnewuser', nick);
			socket.emit('fulluserlist', {users: allnicks, turn: activeuser});
		})

        socket.on('message', 
			// Run this function when a message is sent by users
			function (messagetxt) {
				console.log("Received message");
				
				pacg_.push(messagetxt);
				lengt = pacg_.length;

				activeuser++;
				io.sockets.emit('updatemessage', {themessage: messagetxt, thelength: lengt, thenicknames: allnicks, turn: activeuser});
				console.log("sent updatemessage");
				io.sockets.emit('fulluserlist', {users: allnicks, turn: activeuser});
				console.log("sent fulluserlist");
			}
		);
    
       socket.on('seeall', function(data){
	      socket.emit('seeall',pacg_);
       });

		
		socket.on('disconnect', function() {
			console.log(socket.nick + " has disconnected");
			for (var i = 0; i < allnicks.length; i++){
				if (socket.nick == allnicks[i]){
					allnicks.splice(i,1);
				}
			} 
			io.sockets.emit('fulluserlist', {users: allnicks, turn: activeuser});
				
		});

	});


