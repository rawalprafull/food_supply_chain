//SPDX-License-Identifier: Apache-2.0

// nodejs server setup 

// call the packages we need
var express       = require('express');        // call express
var app           = express();                 // define our app using express
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser    = require('body-parser');
var fs            = require('fs');
var Fabric_Client = require('fabric-client');
var path          = require('path');
var util          = require('util');
var os            = require('os');
const { Pool, Client } = require('pg')




app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// instantiate the app
//var app = express();


// this line requires and runs the code from our routes.js file and passes it app
require('./routes.js')(app);


// set up a static file server that points to the "client" directory
app.use(express.static(path.join(__dirname, './client/')));

app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/client/index.html');
});


// Save our port
var port = process.env.PORT || 8000;


// Start the server and listen on port 
http.listen(port,function(){
  console.log("Live on port: " + port);
});

io.on('connection', function(socket) {
    
    console.log("connected");
	


	pg = new Pool({
                  user: 'postgres',
                  host: 'localhost',
                  database: 'postgres',
                  password: 'postgres',
                  port: 5432,
                })

	
	pg.connect(function(err, client) {
  		if(err) {
			    console.log(err);
  		}
		
		 client.query("LISTEN watchers");

		client.on('notification',async (msg)=> {
            	var msg = msg.payload.split(',');
            	var state = msg[4]
           	var shipmentid = msg[6]
            	var temp = msg[8]
	
		socket.emit('chat_message', shipmentid, state, temp);
		        socket.on('chat_message', function(shipmentid, state, temp){
                        console.log( shipmentid+state+temp);
        });


	});
	});

});

