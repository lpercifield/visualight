
/**
 * Node.js Login Boilerplate
 * Author : Stephen Braitsch
 * More Info : http://bit.ly/LsODY8
 
 * MODIFIED BY Leif Percifield 
 * visualight.org
 */

var exp = require('express');
var app = exp.createServer();


var io = require('socket.io').listen(app,'log level': 1);
var MongoStore = require('connect-mongo')(exp);

app.root = __dirname;
global.host = 'localhost';

require('./app/config')(app, exp, MongoStore);
require('./app/server/router')(app, io, MongoStore);

app.listen(8080, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
