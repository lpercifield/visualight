
/**
 * Node.js Login Boilerplate
 * Author : Stephen Braitsch
 * More Info : http://bit.ly/LsODY8
 
 * MODIFIED BY Leif Percifield 
 * visualight.org
 */

var exp = require('express');
var app = exp.createServer();

var colors = require('colors');

colors.setTheme({

	data: 	'grey',
	info: 	'green',
	warm: 	'yellow',
	debug: 	'blue',
	help:  	'cyan',
	error: 	'red'
});

var io = require('socket.io').listen(app); // Setup socket IO

io.set('log level', 1);

var MongoStore = require('connect-mongo')(exp);// Setup mongo store to store user sessions in the db

app.root = __dirname; // setup the app directory
global.host = 'localhost'; // setup the app url

require('./app/config')(app, exp, MongoStore); // run the config.js
require('./app/server/router')(app, io, MongoStore);// run the server/router.js

//Start the express app on the port listed and console log
app.listen(8080, function(){
	console.log("Express server listening on port".data+" %d ".info+"in".data+" %s ".help+"mode".data, app.address().port, app.settings.env);
});
