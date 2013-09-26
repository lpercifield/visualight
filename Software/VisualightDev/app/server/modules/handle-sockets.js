var net = require('net');
var sanitize	= require('validator').sanitize;
var API = require('./api');
var lights=[];
var bulbAuth=[];
//var bulbs=["00:06:66:71:19:2b","00:06:66:71:ca:df","00:06:66:71:cb:cd","00:06:66:71:e3:aa"];
var bulbs = [];
var clients = [];

exports.createSockets = function(app, io, AM){
var netserver = net.createServer(function(socket) { //'connection' listener
	console.log('Visualight connected from: ' +socket.remoteAddress);
	socket.setEncoding('utf8');
	socket.setKeepAlive(true,5000)

	socket.on('close', function() {
		//bulbs.splice(arrayObjectIndexOf(bulbs,socket,'netsocket'),1);
		//var i = lights.indexOf(socket);
		//lights.splice(i,1);
		//bulbAuth.splice(i,1);
		console.log('visualight closed');
	});
	socket.on('end',function(){
		console.log('visualight ended');
	});
	socket.on('error',function(){
		console.log('visualight error' + socket);
	});

	socket.on('data', function(data){
		var mac = sanitize(data).trim();
		var bulbIndex = arrayObjectIndexOf(bulbs,mac,'macadd');
		console.log("INCOMING: " + mac + " INDEX: " +bulbIndex);
		if(bulbIndex < 0){
			
			//console.log(mac);
			AM.checkBulbAuth(mac,function(o){
				console.log('check bulb' + o);
				if(!o){
				  //socket.emit('lookup-failed');
				  console.log("NOT AUTHORIZED bulb: " + data);
				  socket.destroy();
				}else{
				  //current bulb mac = o.mac;
				  //current bulb id = o._id;
				  
				  var cleanbulbID = sanitize(o._id).trim();
				  console.log("returned id " + cleanbulbID);
				  var checkId = arrayObjectIndexOf(bulbs,cleanbulbID,'id');
				  if(checkId != -1){
				  	  console.log("REMOVED BULB FROM ARRAY");
					  bulbs.splice(checkId, 1);
				  }
				  var connectedBulb = {id:cleanbulbID,netsocket:socket,macadd:mac};
				  bulbs.push(connectedBulb);
				  console.log("AUTHORIZED bulb: " + data);
			  }
			});
		}else{
			console.log("HEARTBEAT");
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
		}
		/*
var i = lights.indexOf(socket);
		if(!bulbAuth[i]){
			if(bulbs.indexOf(data.trim())!=-1){
				bulbAuth[i] = true;
				console.log("AUTHORIZED bulb: " + data);
				
			}else{
				console.log("NOT AUTHORIZED bulb: " + data);
				socket.destroy();
			}
		}else{
			console.log("already auth");
		}
*/
		
	});	
});
netserver.listen(5001, function() { //'listening' listener
	console.log('tcp server bound');
});

function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
    	//console.log(myArray[i][property]);
        if (myArray[i][property] === searchTerm) return i;
        else if (myArray[i][property] == searchTerm) return i;
    }
    return -1;
}

function sendToVisualight(bulbObject,heartbeat){
	//lastArduinoData = data;
	console.log("bulbID "+bulbObject._id);
	var data = bulbObject.r+","+bulbObject.g+","+bulbObject.b+","+"0";
	var currBulbIndex = arrayObjectIndexOf(bulbs,bulbObject._id,'id');
	heartbeat = typeof heartbeat !== 'undefined' ? heartbeat : false;
	//console.log("currBulbIndex " + currBulbIndex);
	if(bulbs[currBulbIndex] != null && !heartbeat){
		//if(bulbAuth[0]){
		//for(var i = 0; i < lights.length; i++){
			//console.log(data);
			bulbs[currBulbIndex].netsocket.write("a");
			bulbs[currBulbIndex].netsocket.write(data);
			bulbs[currBulbIndex].netsocket.write("x");
			//bulb.write(data);
			//bulb.write("x");
		//}
	}else if(bulbs[currBulbIndex] != null && heartbeat){
		bulbs[currBulbIndex].netsocket.write("h");
	}else{
		console.log("Visulight NOT CONNECTED: " + bulbObject._id);
		//sendToWeb("That Visualight is OFFLINE");
	}
}






// Socket.io stuff for realtime communication
io.configure(function (){
	io.set('authorization', function(data, accept) {
		//console.log(qs.parse(data));
	    if(data.query.session) {
	    	    AM.validateSession(data.query.session, function(o){
		    	    if(o==null){
		    	    	//console.log(data.query.session);
			    	    //console.log("stay connected");
			    	    return accept(null, true);
			    	}else{
				    	return accept('Invalid session transmitted', false);
				    }
				});
	    	
	        //data.cookie = cookie.parse(data.headers.cookie);
	        //data.sessionID = parseSignedCookie(data.cookie['connect.sid'], secret);
	    } else {
	        return accept('No session transmitted', false);
	    }
	});
});
io.sockets.on('connection', function (socket) {
	//console.log(socket.handshake.headers.cookie);
	var newClient = {iosocket:socket};
	clients.push(newClient);
  socket.on('message', function(message) {	
  	//console.log(JSON.parse(message));
  	API.parseMessage(message,function(o,e){
	  	if(o != null){
	  		//console.log(o);
		  	//console.log("SEND IT TO VISUALIGHT");
		  	sendToVisualight(o);
	  	}else{
		  	console.log(e);
	  	}
  	});
  	//sendToVisualight(clients[arrayObjectIndexOf(clients,socket,'iosocket')].currentBulb,message);
  });
  socket.on('disconnect', function(){
	  clients.splice(arrayObjectIndexOf(clients,socket,'iosocket'),1);
  });
  socket.on('current-bulb', function(bulbID){
  	var cleanbulbID = sanitize(bulbID).trim();
	  AM.getBulbInfo(cleanbulbID, function(o){
		  if(!o){
			  socket.emit('lookup-failed');
		  }else{
			  //current bulb mac = o.mac;
			  console.log("socket current-bulb");
			  var checkId = arrayObjectIndexOf(clients,o._id,'currentBulb');
				  if(checkId != -1){
					  clients.splice(checkId, 1);
				  }
			  clients[arrayObjectIndexOf(clients,socket,'iosocket')].currentBulb = o._id;
			  if(arrayObjectIndexOf(bulbs,o._id,'id') == -1){
				  socket.emit('bulb-offline');
			  }
		  }
	  })
  });
  //socket.emit('news', { hello: 'world' });
});
}