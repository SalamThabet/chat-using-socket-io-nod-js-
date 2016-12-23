//socket io means : enables real-time event-based communication. 


var express = require('express'); // requiring Express
var app = express();
var server = require('http').createServer(app); //creating a new server. 
var io = require('socket.io').listen(server); // requiring Socket.IO that means use lib socket io and connect with server
users =[];
var mySocket = ''; 

server.listen(2000);  //open port 2000 and listen for requests coming in.
	console.log('server running');

//routing
app.get('/', function(req,res){ 
	res.sendFile(__dirname + '/index.html');
	//app.get routes http requests to the specified path with a specific call  function
	//The 'res' object represents the HTTP response that an Express app sends when it gets a request
	//'sendFile' just sends the file at the specific path
});

var numUsers = 0; //count of users 
io.sockets.on('connection',function(socket){  // io.sockets is listening for connections
	var addeduser = false;
	//new user 
	//socket.on : for listen from client 
	//The 'socket.on('add user') will wait for a data(username) from the client for 'add user'
	socket.on('add user',function(data,callback){  
		//if (addedUser) return;
		if (data in users) {
			callback(false); 
		}else{			 
			callback(true);
	//store  username  socket session for this client
			socket.usernameInput = data;
			//add new user for users online 
			//	users.push(socket.usernameInput);
			users[socket.usernameInput] = socket;
			//add 1 for number of users connected 
			++numUsers;
			//addedUser = true;
			//socket.emit will send a message back to the client that just connected with a message using 'signed in'.
	socket.emit('signed in',{num6Users:numUsers}); //ارسل الاوبجكت هادا للكلينت 
		// print all clients that user has connected
	socket.broadcast.emit('user join',{username:data,numUsers:numUsers});
//??
	io.sockets.emit('get users',Object.keys(users)); //returns an array of users 
		
		}
		
		
		
	});

	

	//Send Message
	socket.on('new message', function(data){
		var msg = data.trim(); //delete whitespace from both side 
			if(msg.substr(0,3) ==='/w '){ //substr(start, length)
				msg = msg.substr(3);  //Begin the extraction at position 3
				var ind = msg.indexOf(' '); //first occurrence of ' ' 
				if(ind !== -1){ // يعني موجودة القييمة هاي 
					var name = msg.substring(0,ind); //extracts characters in a string between "start" and "end", not including "end" itself.
					var msg = msg.substring(ind + 1);
					mySocket = socket.usernameInput; 
					console.log(mySocket);
					if(name == mySocket ){ 
						socket.emit('errorZft');
					}else if(name in users){
						users[name].emit('whisper',{msg: msg,user:socket.usernameInput});
						console.log('Whisper!');
					}
					else{
						socket.emit('errorvalid');
					}
					
				}else{
					socket.emit('errormsg');
					
				}
			}else{
				socket.broadcast.emit('new message', {username:socket.usernameInput,message:msg});
			}
	});

	//Disconnect
	
	socket.on('disconnect',function(data){
	
			--numUsers;
			

		// print all client that user has disconnected
		socket.broadcast.emit('user left',{username:socket.usernameInput,numUsers:numUsers});
		if(!socket.usernameInput) return;
		delete users[socket.usernameInput];
		//users.splice(users.indexOf(socket.usernameInput),1);
		io.sockets.emit('get users',Object.keys(users));
	
		
		    // delete users[socket.username];
		// updateUsernames();
		// console.log('DisConnected: %s sockets disConnected',connections.length);
	

	});

	// when the client emits 'typing', we broadcast it to others
	  socket.on('typing', function () {
	    socket.broadcast.emit('typing', {
	      username: socket.usernameInput
	    });
	  });

	  // when the client emits 'stop typing', we broadcast it to others
	  socket.on('stop typing', function () {
	    socket.broadcast.emit('stop typing', {
	      username: socket.usernameInput
	    });
	  });

	});