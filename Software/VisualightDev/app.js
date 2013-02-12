
/**
 * Node.js Login Boilerplate
 * Author : Stephen Braitsch
 * More Info : http://bit.ly/LsODY8
 
 * MODIFIED BY Leif Percifield 
 * visualight.org
 */

var exp = require('express');
var app = exp.createServer();
var net = require('net');
var netserver = net.createServer();
var io = require('socket.io').listen(app);
var MongoStore = require('connect-mongo')(exp);
var connect = require('express/node_modules/connect');
var parseCookie = connect.utils.parseCookie;

app.root = __dirname;
global.host = 'localhost';

require('./app/config')(app, exp, MongoStore);
require('./app/server/router')(app, io, netserver, MongoStore, parseCookie);

app.listen(8080, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

netserver.listen(5001, function() { //'listening' listener
	console.log('tcp server bound');
});