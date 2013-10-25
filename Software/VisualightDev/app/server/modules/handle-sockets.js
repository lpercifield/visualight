var net = require('net');
var sanitize	= require('validator').sanitize;
var API = require('./api');

var bulbs = []; // array for bulb sockets
var clients = []; // array for brower sockets

/**
* creates all socket connections
* both net and IO
*
* @method createSockets
* @param {object} app
* @param {object} io
* @param {object} AM I don't think that this needs to be here
*/

exports.createSockets = function(app, io, AM){

// this is called everytime a bulb connects to the server
var netserver = net.createServer(function(socket) {
	console.log('Visualight connected from: ' +socket.remoteAddress);
	socket.setEncoding('utf8');
	socket.setKeepAlive(true,5000); // heartbeat timer... This doesnt really work...

  // this is called when the bulb socket closes
	socket.on('close', function() {
		//bulbs.splice(arrayObjectIndexOf(bulbs,socket,'netsocket'),1); // is this working??
		console.log('visualight closed');
	});
	// this is called when the bulb socket ends
	socket.on('end',function(){
		console.log('visualight ended');
	});
	// this is called when there is an error on the bulb socket
	socket.on('error',function(err){

		console.log('visualight error');
		console.log(err);
		console.log('Socket: ');
		//console.log(JSON.stringify(socket))
	});

  // this is the function that gets called when the bulb sends data
	socket.on('data', function(data){
		var mac = sanitize(data).trim(); // we hope that we are getting a mac address
		var bulbIndex = arrayObjectIndexOf(bulbs,mac,'macadd'); // we check to see if the mac address is already in the bulbs array
		console.log("INCOMING: " + mac + " INDEX: " +bulbIndex);
		
		//if(bulbIndex < 0){ // if the bulb is not in the array...
			
			//console.log(mac);
			AM.checkBulbAuth(mac,function(o){ // check and see if this mac address is part of the DB
				console.log('check bulb' + o);
				
				if(!o){ // we didn't find a bulb matching the sent mac address, kill the socket
				  console.log("NOT AUTHORIZED bulb: " + data);
				  socket.destroy();
				}else{
				  var cleanbulbID = sanitize(o._id).trim(); // we got a bulb object that matches the sent mac address
				  console.log("returned id " + cleanbulbID);
				  
				  var checkId = arrayObjectIndexOf(bulbs,cleanbulbID,'id'); // check and see if this bulb id is in the array
				  
				  if(checkId != -1){// if there is a bulb matching the id remove the socket, it must be an old socket from the same bulb
				  	  console.log("REMOVED BULB FROM ARRAY");
					  bulbs.splice(checkId, 1); // actually remove the socket
				  }
				  var connectedBulb = {id:cleanbulbID,netsocket:socket,macadd:mac}; // create the new bulb object for the bulb array
				  bulbs.push(connectedBulb); // add the new bulb object to the array
				  console.log("AUTHORIZED bulb: " + data);
			  }
			});
		//}else{
			//This is where we should handle the heartbeat from the bulb
			
			/*
AM.updateBulbStatus(bulbs[bulbIndex].id,1, function(o){
				if(o==null){
					console.log("error saving bulb status");
				}else{
					console.log("Sending Heartbeat response");
					sendToVisualight(bulbs[bulbIndex].id,"OK",true);
				}
			});
*/
		//}
	});	
});
// end of net socket setup

// listen for the bulb connections on port number
netserver.listen(5001, function() { //'listening' listener
	console.log('tcp server bound');
});

// this parses an array for a property - this pretty much sucks
function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
    	//console.log(myArray[i][property]);
        if (myArray[i][property] === searchTerm) return i;
        else if (myArray[i][property] == searchTerm) return i;
    }
    return -1;
}

/**
* Send data to a visualight 
* 
* @method sendToVisualight
* @type {Object} bulbObject this bulbobject json is defined in the API doc
* @type {Boolean} heartbeet OPTIONAL
*/

function sendToVisualight(bulbObject,heartbeat){

  //console.log(bulbObject);

	var data = bulbObject.r+","+bulbObject.g+","+bulbObject.b+","+bulbObject.w; // this creates the r,g,b,blink array
	
	var currBulbIndex = arrayObjectIndexOf(bulbs,bulbObject._id,'id'); // get the index of the bulb
	//console.log(currBulbIndex);
	
	heartbeat = typeof heartbeat !== 'undefined' ? heartbeat : false; // if we didnt define heartbeat then set it to false
	
	if(bulbs[currBulbIndex] != null && !heartbeat){ // if we have a bulb and the message is not a heartbeat

		bulbs[currBulbIndex].netsocket.write("a"); // start character
		bulbs[currBulbIndex].netsocket.write(data); // data
		bulbs[currBulbIndex].netsocket.write("x"); // stop character
		
	}else if(bulbs[currBulbIndex] != null && heartbeat){ // we are sending a heartbeat
		bulbs[currBulbIndex].netsocket.write("h");
	}else{
		console.log("Visulight NOT CONNECTED: " + bulbObject._id); // the visualight is not connected
		//sendToWeb("That Visualight is OFFLINE");
	}
}






// Socket.io stuff for realtime communication


io.configure(function (){
	io.set('authorization', function(data, accept) { // this adds authorization to the socket IO handshake procedure
		//console.log(qs.parse(data));
	    if(data.query.session) { // did we get session data?
	    	    AM.validateSession(data.query.session, function(o){ // check and see if this session is valid
		    	    if(o==null){ // we got a valid session!
		    	    	//console.log(data.query.session);
			    	    //console.log("stay connected");
			    	    return accept(null, true);
			    	}else{ // session is not valid
				    	return accept('Invalid session transmitted', false);
				    }
				});

	    } else { // no session
	        return accept('No session transmitted', false);
	    }
	});
});

//handle a connection from a IO socket -- this is after the handshack is validated
io.sockets.on('connection', function (socket) {
	var newClient = {iosocket:socket}; // create a new "client" object
	clients.push(newClient); // add this client object to the array
  socket.on('message', function(message) {	// handle a message from the client
  	//console.log(JSON.parse(message));
  	API.parseMessage(message,function(o,e){ // this parses the json from the web socket
  	
	  	if(o != null){ // the json was valid and we have a bulb object that is valid
		  	sendToVisualight(o);  // send this data to the visualight
	  	}else{
		  	console.log(e); // we got an error from the api call -- NEED TO SEND THIS BACK TO THE CLIENT??
	  	}
  	});
  });
  // handle client disconnect
  socket.on('disconnect', function(){
	  clients.splice(arrayObjectIndexOf(clients,socket,'iosocket'),1);
  });
  // handle the socket selecting the current bulb
  socket.on('current-bulb', function(bulbID){
  	var cleanbulbID = sanitize(bulbID).trim();
	  AM.getBulbInfo(cleanbulbID, function(o){
		  if(!o){
			  socket.emit('lookup-failed');
		  }else{
			  //current bulb mac = o.mac;
			  
			  var checkId = arrayObjectIndexOf(clients,o._id,'currentBulb');
				  if(checkId != -1){
            console.log("client already setup");
					  clients.splice(checkId, 1);
				  }
				//console.log(clients);
				//console.log(bulbs);
			  clients[arrayObjectIndexOf(clients,socket,'iosocket')].currentBulb = o._id;
			  if(arrayObjectIndexOf(bulbs,o._id,'id') == -1){
				  socket.emit('bulb-offline');
			  }
		  }
	  })
  });
});
}