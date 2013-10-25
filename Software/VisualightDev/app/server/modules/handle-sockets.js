var net = require('net');
var sanitize	= require('validator').sanitize;
var API = require('./api');

var Bulbs = {}; //temp object of bulbs to start cross referenceing
			   //each object will contain mac address, socket.io client, netsocket client

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

	  	var connection_id; //make connection id 

		console.log('Visualight connected from: ' +socket.remoteAddress);
		socket.setEncoding('utf8');
		socket.setKeepAlive(true); // heartbeat timer... This doesnt really work...
		socket.setTimeout(60000,function(){ //if we don't hear anything from the server for a minute then we kill the connection
			console.log('connection_id: '+connection_id+" TIMEOUT");
			//socket.write('H');
			Bulbs[connection_id].netsocket.destroy(); //destroy socket 
			delete Bulbs[connection_id]; //delete obj
		})
	 	//this is called when the bulb socket closes


		socket.on('close', function() {
			//inform clients that bulbs are lost
			console.log('visualight closed id: '+connection_id);
		});
		// this is called when the bulb socket ends
		socket.on('end',function(){
			//inform clients that bulb is gone
			console.log('visualight ended id: '+connection_id);
		});
		// this is called when there is an error on the bulb socket
		socket.on('error',function(err){

			console.log('visualight error id: '+connection_id);
			console.log(err);

		});

	  // this is the function that gets called when the bulb sends data
		socket.on('data', function(data){
			try { 
				data = JSON.parse(data) 
				console.log(data)
				var mac = sanitize(data.mac).trim(); // we hope that we are getting a mac address
				console.log("INCOMING: " + mac );
					
					//**NOTE** MAC ADDRESS VALIDATOR

					AM.checkBulbAuth(mac,function(o){ // check and see if this mac address is part of the DB
						console.log('check bulb' + o);
						
						if(!o){ // we didn't find a bulb matching the sent mac address, kill the socket
						  console.log("NOT AUTHORIZED bulb: " + data);
						  socket.destroy();
						}else{
						  var cleanbulbID = sanitize(o._id).trim(); // we got a bulb object that matches the sent mac address
						  console.log("returned id " + cleanbulbID);
						  
						  //create Bulbs obj
						  if( Bulbs.hasOwnProperty(cleanbulbID) == false ){ //check if Bulbs[] exists
						  	console.log('Bulbs['+cleanbulbID+'] not defined');
						  	
						  	Bulbs[cleanbulbID] = {mac: mac, netsocket: socket };
						  	connection_id = cleanbulbID; //providing access to the objectID to the rest of the socket functions

						  }else{

						  	if(!data.hasOwnProperty('h')){ //check if we get heartbeat from device
						  		console.log('Bulbs['+cleanbulbID+'] is defined');
						  		Bulbs[cleanbulbID].netsocket.destroy(); //close our net socket
						  		delete Bulbs[cleanbulbID];

						  		Bulbs[cleanbulbID] = {mac: mac, netsocket: socket };
						  		connection_id = cleanbulbID;
						  	}else{

						  		socket.write('H'); //writing to the socket

						  	}

						  }
						  console.log("AUTHORIZED bulb: " + data);
					  }// o is valid
					 }catch(e){
					 	console.error("Bad Data")
					 	console.error(e)
					 }
				});

		});	
	});
	// end of net socket setup

	// listen for the bulb connections on port number
	netserver.listen(5001, function() { //'listening' listener
		console.log('tcp server bound');
	});


	/**
	* Send data to a visualight 
	* 
	* @method sendToVisualight
	* @type {Object} bulbObject this bulbobject json is defined in the API doc
	* @type {Boolean} heartbeet OPTIONAL
	*/

	function sendToVisualight(bulbObject,heartbeat){

		var data = bulbObject.r+","+bulbObject.g+","+bulbObject.b+","+bulbObject.w; // this creates the r,g,b,blink array
		
		heartbeat = typeof heartbeat !== 'undefined' ? heartbeat : false; // if we didnt define heartbeat then set it to false
		
		var cleanbulbID = sanitize(bulbObject._id).trim();

		if(Bulbs.hasOwnProperty(cleanbulbID) && !heartbeat){ // if we have a bulb and the message is not a heartbeat

			Bulbs[cleanbulbID].netsocket.write("a"); // start character
			Bulbs[cleanbulbID].netsocket.write(data); // data
			Bulbs[cleanbulbID].netsocket.write("x"); // stop character
			
		}else if(Bulbs.hasOwnProperty(cleanbulbID) && heartbeat){ // we are sending a heartbeat
			Bulbs[cleanbulbID].netsocket.write("h");
		}else{
			console.log("Visulight NOT CONNECTED: " + bulbObject._id); // the visualight is not connected
		}
	} //end sendToVisualight

	/*
	 *
	 *  Socket.io Functions to connect with client
	 *	configure then standard on operations - connection followed by data communications
	 */

	io.configure(function (){
		io.set('authorization', function(data, accept) { // this adds authorization to the socket IO handshake procedure
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
	});//end configure

	//handle a connection from a IO socket -- this is after the handshack is validated
	io.sockets.on('connection', function (socket) {

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
		  //clients.splice(arrayObjectIndexOf(clients,socket,'iosocket'),1);
	  });
	});//end io.sockets.on

}