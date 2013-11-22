var net = require('net');
var sanitize = require('validator').sanitize;
var API	= require('./api');

var colors = require('colors');

colors.setTheme({

	data: 	'grey',
	info: 	'green',
	warn: 	'yellow',
	debug: 	'blue',
	help:  	'cyan',
	error: 	'red'
});

var Bulbs = {}; //temp object of bulbs to start cross referenceing
                //each object will contain mac address, socket.io client, netsocket client


exports.returnBulbs =  Bulbs;




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
                
                		var message = 'connection_id: '+connection_id+' TIMEOUT';
                        console.log(message.error);
                        //socket.write('H');
                        removeBulb(connection_id);
                })
                 //this is called when the bulb socket closes


                socket.on('close', function() {
                        //inform clients that bulbs are lost
                        var message = 'visualight closed id: '+connection_id;
                        console.log(message.error);
                        removeBulb(connection_id);        
                });
                // this is called when the bulb socket ends
                socket.on('end',function(){
                        //inform clients that bulb is gone
                        var message = 'visualight ended id: '+connection_id;
                        console.log(message.error);
                        //probably not needed but well see.
                        //removeBulb(connection_id);

                });
                // this is called when there is an error on the bulb socket
                socket.on('error',function(err){
						var message = 'visualight error id: '+connection_id;
                        console.log(message.error);
                        console.log(JSON.stringify(err).error);

                });

          // this is the function that gets called when the bulb sends data
                socket.on('data', function(data){
                        //console.log(data); // debug only see exactly what is sent from netsocket
						
                        try { 			console.log()
                        				console.log(data.data)
                                        data = JSON.parse(data) 
                                        if(!data.mac) {
	                                        console.error("Bad Data".error);
											console.error(data.error)
                                        }
                                        var mac = sanitize(data.mac).trim(); // we hope that we are getting a mac address
                                        console.log("INCOMING: ".info + mac.data );
                                        console.log();
                                }catch(e){
                                         console.error("Bad Data".error);
                                         console.error(data.error)
                                         console.error(JSON.stringify(e));
                                         socket.destroy();
                                }
                                                
                                //**NOTE** MAC ADDRESS VALIDATOR
                                if(mac){                
                                        AM.checkBulbAuth(mac,function(o){ // check and see if this mac address is part of the DB
                                                //console.log('check bulb' + o);
                                                
                                                if(!o){ // we didn't find a bulb matching the sent mac address, kill the socket
                                                  console.log("NOT AUTHORIZED bulb: ".error + JSON.stringify(data).data);
                                                  socket.destroy();
                                                }else{

                                                          console.log("AUTHORIZED bulb: ".info + JSON.stringify(data).data);
                                                          var cleanbulbID = sanitize(o._id).trim(); // we got a bulb object that matches the sent mac address
                                                          console.log("returned id ".help + cleanbulbID.data);
                                                          
                                                          //create Bulbs obj
                                                        if( Bulbs.hasOwnProperty(cleanbulbID) == false ){ //check if Bulbs[] exists
                                                                  console.log('Bulbs['.help+cleanbulbID.data+'] not defined'.help+' CREATING Bulbs['.help+cleanbulbID.data+']'.help);
                                                                  
                                                                  Bulbs[cleanbulbID] = { _id: cleanbulbID, mac: mac, netsocket: socket };
                                                                  if(o.hasOwnProperty('color')){
                                                                  	//check if bulb group is different than last stored if so update color
                                                                  	//check bulb setting options
                                                                  	Bulbs[cleanbulbID].color = o.color;
                                                                  	//update bulb with color
                                                                  	//sendToVisualight(Bulbs[cleanbulbID]) // for RC blue we are not going to send back the last color when the bulb connects
                                                                  	AM.updateBulbStatus(cleanbulbID,1,Bulbs[cleanbulbID].color,function(){})
                                                                  	//log to db that bulb is on.
                                                                  	
                                                                  }
                                                                  //console.log(Bulbs[cleanbulbID]);
                                                                  connection_id = cleanbulbID; //providing access to the objectID to the rest of the socket functions

                                                        }else{

                                                                  if(!data.hasOwnProperty('h')){ //check if we get heartbeat from device
                                                                          
                                                                          console.log('Bulbs['.warn+cleanbulbID.warn+'] is already defined'.warn);
                                                                          Bulbs[cleanbulbID].netsocket.destroy(); //close our net socket
                                                                          delete Bulbs[cleanbulbID];

                                                                          Bulbs[cleanbulbID] = {_id: cleanbulbID, mac: mac, netsocket: socket };
                                                                          connection_id = cleanbulbID;
                                                                  }else{
																																					AM.updateBulbStatus(cleanbulbID,1,Bulbs[cleanbulbID].color,function(){}); // see if this is too many READ/WRITES
                                                                          sendToVisualight(o,true); // this should be where we send back a heartbeat acknowledge...
                                                                          //socket.write('H'); //writing to the socket

                                                                  }
                                                        }
                                                  }// o is valid
                                        
                                        });
                                }else{
	                              console.error("Bad Data".error);
                                  console.error(data.error)
                                  socket.destroy();  
                                }

                });        
        });
        // end of net socket setup

        // listen for the bulb connections on port number
        netserver.listen(5001, function() { //'listening' listener
                console.log('tcp server bound'.data);
        });
        /**
        *        Remove A Bulb From Handle-sockets Bulbs{}
        *
        *        @method removeBulb
        *        @type {String} string ID of bulb object we are connecting to used as Bulb[key]
        *
        **/

        function removeBulb(bulbID){
        				var message = 'Attempting to clear bulb: '+ bulbID;
                        console.log(message.warn);
                        if( Bulbs.hasOwnProperty(bulbID) ){
                        		message = 'Bulb Found Attempting to remove: '+bulbID;
                                console.log(message.warn);
                                //console.log(Bulbs);
                                
                                //setting bulb
                                if(Bulbs[bulbID].hasOwnProperty('color')){
                                	AM.updateBulbStatus(bulbID,0,Bulbs[bulbID].color,function(e){
                                		    Bulbs[bulbID].netsocket.destroy(); //destroy socket 
                                			try{
                                				delete Bulbs[bulbID]; //delete obj
                                				//console.log(Bulbs);
                                				message = 'Bulb '+bulbID+' Removed Successfully!';
                                				console.log(message.info);
                                			}catch(e){
                                				message = 'DELETE ERROR: '.error+e;
                                				console.log(message.error)
                                			}
                                	})
                                }else{

                                	Bulbs[bulbID].netsocket.destroy(); //destroy socket 
                                	try{
                                		delete Bulbs[bulbID]; //delete obj
                                		//console.log(Bulbs);
                                		message = 'Bulb '+bulbID+' Removed Successfully!';
                                		console.log(message.info);
                                		
                                		}catch(e){
                                			message = 'DELETE ERROR: '.error+e;
                                			console.log(message.error)
                                		}
                                }
                                //update bulb color in db
        
                        }else{
                        		message = 'Bulb '+bulbID+' no longer exists';
                                console.log(message.error);
                        }
        }
        /**
        * Send data to a visualight 
        * 
        * @method sendToVisualight
        * @type {Object} bulbObject this bulbobject json is defined in the API doc
        * @type {Boolean} heartbeat OPTIONAL
        */

        function sendToVisualight(bulbObject,heartbeat){
        		//console.log('Bulb Object'.error);
        		//console.log(bulbObject);
                if(!bulbObject.hasOwnProperty('alert')){
        			//in case there is no alert data
            		bulbObject.alert = {};
					bulbObject.alert.duration = 0;
					bulbObject.alert.frequency = 0;
					bulbObject.alert.type = 0;
                }
                
                heartbeat = typeof heartbeat !== 'undefined' ? heartbeat : false; // if we didnt define heartbeat then set it to false
                
                var cleanbulbID = sanitize(bulbObject._id).trim();

                if(Bulbs.hasOwnProperty(cleanbulbID) && !heartbeat){ // if we have a bulb and the message is not a heartbeat

                		if(Bulbs[cleanbulbID].hasOwnProperty('color')){
                			//var data = bulbObject.color.r+","+bulbObject.color.g+","+bulbObject.color.b+","+bulbObject.color.w; // this creates the r,g,b,blink array
							var data  = bulbObject.color.r+",";
								data += bulbObject.color.g+",";
								data += bulbObject.color.b+",";
								data += bulbObject.color.w+",";
								data += bulbObject.alert.duration+",";
								data += bulbObject.alert.frequency+",";
								data += bulbObject.alert.type;
								
	                        console.log("WRITING DATA: ".help+data.data+" ID: ".help+cleanbulbID.data);

	                        Bulbs[cleanbulbID].netsocket.write("a");  // start character
	                        Bulbs[cleanbulbID].netsocket.write(data); // data string 
	                        Bulbs[cleanbulbID].netsocket.write("x");  // stop character

	                        Bulbs[cleanbulbID].color = bulbObject.color;

                    	}else{
                    		//send heartbeat
                    		Bulbs[cleanbulbID].netsocket.write("H");

                    	}
                        
                }else if(Bulbs.hasOwnProperty(cleanbulbID) && heartbeat){ // we are sending a heartbeat
                        Bulbs[cleanbulbID].netsocket.write("H");
                }else{
                        console.log("Visulight NOT CONNECTED: ".error + bulbObject._id.data); // the visualight is not connected
                }
        } //end sendToVisualight

        /*
         *
         *  Socket.io Functions to connect with client
         *        configure then standard on operations - connection followed by data communications
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

          socket.on('message', function(message) {        // handle a message from the client
                  //console.log(JSON.parse(message));
                  API.parseMessage(message,Bulbs,function(o,e){ // this parses the json from the web socket
                  
                          if(o != null){ // the json was valid and we have a bulb object that is valid
                                  sendToVisualight(o);  // send this data to the visualight
                          }else{
                                  console.log(e.error); // we got an error from the api call -- NEED TO SEND THIS BACK TO THE CLIENT??
                          }
                  });
          });
          // handle client disconnect
          socket.on('disconnect', function(){
                  //clients.splice(arrayObjectIndexOf(clients,socket,'iosocket'),1);
          });
        });//end io.sockets.on
}


/*
exports.resetBulb = function(key){
	if(Bulbs.hasOwnProperty(key){
		var data = "0,0,0,0,0,0,3";
		Bulbs[key].netsocket.write("a");  // start character
		Bulbs[key].netsocket.write(data); // data string 
		Bulbs[key].netsocket.write("x");  // stop character
		var message = "RESETTING BULBID: " + key;
		console.log(message.warn);
  }
	
}
*/

/*	Support for restful connection of COLOR data to bulb 
 *  
 *
 *
 *
*/

exports.sendTrigger = function(bulbObject,heartbeat){
		//console.log('Bulb Object'.error);
		//console.log(bulbObject);
        if(!bulbObject.hasOwnProperty('alert')){
			//in case there is no alert data
    		bulbObject.alert = {};
			bulbObject.alert.duration = 0;
			bulbObject.alert.frequency = 0;
			bulbObject.alert.type = 0;
        }
        
        heartbeat = typeof heartbeat !== 'undefined' ? heartbeat : false; // if we didnt define heartbeat then set it to false
        
        var cleanbulbID = sanitize(bulbObject._id).trim();

        if(Bulbs.hasOwnProperty(cleanbulbID) && !heartbeat){ // if we have a bulb and the message is not a heartbeat

        		if(Bulbs[cleanbulbID].hasOwnProperty('color')){
        			//var data = bulbObject.color.r+","+bulbObject.color.g+","+bulbObject.color.b+","+bulbObject.color.w; // this creates the r,g,b,blink array
					var data  = bulbObject.color.r+",";
						data += bulbObject.color.g+",";
						data += bulbObject.color.b+",";
						data += bulbObject.color.w+",";
						data += bulbObject.alert.duration+",";
						data += bulbObject.alert.frequency+",";
						data += bulbObject.alert.type;
						
                    console.log("WRITING DATA: ".help+data.data+" ID: ".help+cleanbulbID.data);

                    Bulbs[cleanbulbID].netsocket.write("a");  // start character
                    Bulbs[cleanbulbID].netsocket.write(data); // data string 
                    Bulbs[cleanbulbID].netsocket.write("x");  // stop character

                    Bulbs[cleanbulbID].color = bulbObject.color;

            	}else{
            		//send heartbeat
            		Bulbs[cleanbulbID].netsocket.write("H"); // why is this else here??

            	}
                
        }else if(Bulbs.hasOwnProperty(cleanbulbID) && heartbeat){ // we are sending a heartbeat
                Bulbs[cleanbulbID].netsocket.write("H");
        }else{
                console.log("Visulight NOT CONNECTED: ".error + bulbObject._id.data); // the visualight is not connected
        }
} //end sendToVisualight


