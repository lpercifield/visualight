var net = require('net');
var sanitize        = require('validator').sanitize;
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
                        removeBulb(connection_id);
                })
                 //this is called when the bulb socket closes


                socket.on('close', function() {
                        //inform clients that bulbs are lost
                        console.log('visualight closed id: '+connection_id);
                        removeBulb(connection_id);        
                });
                // this is called when the bulb socket ends
                socket.on('end',function(){
                        //inform clients that bulb is gone
                        console.log('visualight ended id: '+connection_id);
                        //probably not needed but well see.
                        //removeBulb(connection_id);

                });
                // this is called when there is an error on the bulb socket
                socket.on('error',function(err){

                        console.log('visualight error id: '+connection_id);
                        console.log(err);

                });

          // this is the function that gets called when the bulb sends data
                socket.on('data', function(data){
                        //console.log(data); // debug only see exactly what is sent from netsocket

                        try { 
                                        data = JSON.parse(data) 
                                        console.log(data)
                                        var mac = sanitize(data.mac).trim(); // we hope that we are getting a mac address
                                        console.log("INCOMING: " + mac );
                                }catch(e){
                                         console.error("Bad Data");
                                         console.error(e);
                                         socket.destroy();
                                }
                                                
                                //**NOTE** MAC ADDRESS VALIDATOR
                                if(mac){                
                                        AM.checkBulbAuth(mac,function(o){ // check and see if this mac address is part of the DB
                                                console.log('check bulb' + o);
                                                
                                                if(!o){ // we didn't find a bulb matching the sent mac address, kill the socket
                                                  console.log("NOT AUTHORIZED bulb: " + data);
                                                  socket.destroy();
                                                }else{

                                                          console.log("AUTHORIZED bulb: " + data);
                                                          var cleanbulbID = sanitize(o._id).trim(); // we got a bulb object that matches the sent mac address
                                                          console.log("returned id " + cleanbulbID);
                                                          
                                                          //create Bulbs obj
                                                        if( Bulbs.hasOwnProperty(cleanbulbID) == false ){ //check if Bulbs[] exists
                                                                  console.log('Bulbs['+cleanbulbID+'] not defined - CREATING Bulbs['+cleanbulbID+']');
                                                                  
                                                                  Bulbs[cleanbulbID] = {_id: cleanbulbID, mac: mac, netsocket: socket };
                                                                  //console.log(Bulbs[cleanbulbID]);
                                                                  connection_id = cleanbulbID; //providing access to the objectID to the rest of the socket functions

                                                        }else{

                                                                  if(!data.hasOwnProperty('h')){ //check if we get heartbeat from device
                                                                          
                                                                          console.log('Bulbs['+cleanbulbID+'] is defined');
                                                                          Bulbs[cleanbulbID].netsocket.destroy(); //close our net socket
                                                                          delete Bulbs[cleanbulbID];

                                                                          Bulbs[cleanbulbID] = {mac: mac, netsocket: socket };
                                                                          connection_id = cleanbulbID;
                                                                  }else{

                                                                          sendToVisualight(o,true);
                                                                          //socket.write('H'); //writing to the socket

                                                                  }
                                                        }
                                                  }// o is valid
                                        
                                        });
                                }

                });        
        });
        // end of net socket setup

        // listen for the bulb connections on port number
        netserver.listen(5001, function() { //'listening' listener
                console.log('tcp server bound');
        });
        /**
        *        Remove A Bulb From Handle-sockets Bulbs{}
        *
        *        @method removeBulb
        *        @type {String} string ID of bulb object we are connecting to used as Bulb[key]
        *
        **/

        function removeBulb(bulbID){
                        console.log('Attempting to clear bulb: '+ bulbID);
                        if( Bulbs.hasOwnProperty(bulbID) ){
                                console.log('Attempting to remove Bulb: '+bulbID);
                                //console.log(Bulbs);
                                
                                //setting bulb
                                if(Bulbs[bulbID].hasOwnProperty('color')){
                                	AM.updateBulbLogoff(bulbID,Bulbs[bulbID].color,function(e){
                                		    Bulbs[bulbID].netsocket.destroy(); //destroy socket 
                                			try{
                                				delete Bulbs[bulbID]; //delete obj
                                				//console.log(Bulbs);
                                				console.log('Bulb '+bulbID+' Removed Successfully!');
                                			}catch(e){
                                				console.log('DELETE ERROR: '+e)
                                			}
                                	})
                                }else{

                                	Bulbs[bulbID].netsocket.destroy(); //destroy socket 
                                	try{
                                		delete Bulbs[bulbID]; //delete obj
                                		//console.log(Bulbs);
                                		console.log('Bulb '+bulbID+' Removed Successfully!');
                                		
                                		}catch(e){
                                				console.log('DELETE ERROR: '+e)
                                		}
                                }
                                //update bulb color in db
        
                        }else{
                                console.log('Bulb '+bulbID+' no longer exists');
                        }
        }
        /**
        * Send data to a visualight 
        * 
        * @method sendToVisualight
        * @type {Object} bulbObject this bulbobject json is defined in the API doc
        * @type {Boolean} heartbeet OPTIONAL
        */

        function sendToVisualight(bulbObject,heartbeat){
        		//console.log('Bulb Object'.error);
        		//console.log(bulbObject);
                
                heartbeat = typeof heartbeat !== 'undefined' ? heartbeat : false; // if we didnt define heartbeat then set it to false
                
                var cleanbulbID = sanitize(bulbObject._id).trim();

                if(Bulbs.hasOwnProperty(cleanbulbID) && !heartbeat){ // if we have a bulb and the message is not a heartbeat

                		if(Bulbs[cleanbulbID].hasOwnProperty('color')){
                			var data = bulbObject.color.r+","+bulbObject.color.g+","+bulbObject.color.b+","+bulbObject.color.w; // this creates the r,g,b,blink array

	                        console.log("WRITING DATA: "+data+" id: "+cleanbulbID);
	                        //console.log(Bulbs);
	                        Bulbs[cleanbulbID].netsocket.write("a"); // start character
	                        Bulbs[cleanbulbID].netsocket.write(data); // data
	                        Bulbs[cleanbulbID].netsocket.write("x"); // stop character

	                        Bulbs[cleanbulbID].color = bulbObject.color;

                    	}else{
                    		//send heartbeat
                    		Bulbs[cleanbulbID].netsocket.write("H");

                    	}
                        
                }else if(Bulbs.hasOwnProperty(cleanbulbID) && heartbeat){ // we are sending a heartbeat
                        Bulbs[cleanbulbID].netsocket.write("H");
                }else{
                        console.log("Visulight NOT CONNECTED: " + bulbObject._id); // the visualight is not connected
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