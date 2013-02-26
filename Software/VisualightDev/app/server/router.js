
var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var net = require('net');

var lights=[];
var bulbAuth=[];
var bulbs=["00:06:66:71:19:2b","00:06:66:71:ca:df","00:06:66:71:cb:cd","00:06:66:71:e3:aa"];

module.exports = function(app, io, sStore) {


var netserver = net.createServer(function(socket) { //'connection' listener
	console.log('Visualight connected from: ' +socket.remoteAddress);
	//socket.write('hello from server');
	//lights.push(socket);
	lights[0] = socket;
	bulbAuth.push(false);
	//bulb = socket;
	socket.setEncoding('utf8');
	socket.setKeepAlive(true,5000)

	socket.on('close', function() {
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
		console.log(data.trim());
		var i = lights.indexOf(socket);
		if(!bulbAuth[i]){
			if(bulbs.indexOf(data.trim())!=-1){
				bulbAuth[i] = true;
				console.log("AUTHORIZED bulb: " + data);
				
			}else{
				console.log("NOT AUTHORIZED bulb: " + data);
				//socket.destroy();
			}
		}else{
			console.log("already auth");
		}
		
	});	
});
netserver.listen(5001, function() { //'listening' listener
	console.log('tcp server bound');
});

function sendToVisualight(data){
	lastArduinoData = data;
	if(lights[0] != null){
		if(bulbAuth[0]){
		//for(var i = 0; i < lights.length; i++){
			lights[0].write("a");
			lights[0].write(data);
			lights[0].write("x");
			//bulb.write(data);
			//bulb.write("x");
		}
	}else{
		console.log("NO ARDUINO CONNECTED");
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
  socket.on('message', function(message) {
  	//console.log(message);
  	sendToVisualight(message);
  });
  socket.on('current-bulb', function(bulbID){
	  AM.getBulbInfo(bulbID, function(e,o){
		  if(!o){
			  socket.emit('lookup-failed');
		  }else{
			  //current bulb mac = o.mac;
		  }
	  })
  });
  //socket.emit('news', { hello: 'world' });
});
// main login page //

	app.get('/', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { locals: { title: 'Visualight - Please Login To Your Account' }});
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
				    res.cookie('sessionID',req.sessionID, {maxAge: null});
					res.redirect('/myvisualight');
				}	else{
					res.render('login', { locals: { title: 'Visualight - Please Login To Your Account' }});
				}
			});
		}
	});
	
	app.post('/', function(req, res){
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
			    req.session.user = o;
			    res.cookie('sessionID',req.sessionID);
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.send(o, 200);
			}
		});
	});
	
// logged-in user homepage //
	
	app.get('/home', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
			res.render('home', {
				locals: {
					title : 'Control Panel',
					countries : CT,
					udata : req.session.user
				}
			});
	    }
	});
	app.get('/myvisualight', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
			res.render('myvisualight', {
				locals: {
					title : 'My Visualights',
					udata : req.session.user
				}
			});
	    }
	});
	
	app.post('/home', function(req, res){
		if (req.param('user') != undefined) {
			AM.updateAccount({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(e, o){
				if (e){
					res.send('error-updating-account', 400);
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}
			});
		}	else if (req.param('logout') == 'true'){
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		res.render('signup', {  locals: { title: 'Signup', countries : CT } });
	});
	
	app.post('/signup', function(req, res){
		AM.addNewAccount({
			name 	: req.param('name'),
			email 	: req.param('email'),
			user 	: req.param('user'),
			pass	: req.param('pass'),
			country : req.param('country')
		}, function(e){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});


// get bulb info

	app.get('/get-bulbs', function(req,res){
		//console.log("user: "+ req.session.user.user);
		if(req.session.user == null){
	    		res.send('not-authorized',400);
	    }else{
		    AM.getBulbs(req.session.user.user, function(o){
			    if(o){
				    res.send(o,200);
			    }else{
				    res.send('bulbs-not-found', 400);
			    }
		    });
	    }
		
	});
	
	// add bulb to user

	app.post('/add-bulb', function(req,res){
		if(req.session.user == null){
	    		res.send('not-authorized',400);
	    }else{
		    AM.addNewBulb(req.session.user.user,req.param('bulb'), function(e){
		    	console.log("add bulb request ");
			    if(e){
				    res.send(e,400);
			    }else{
				    res.send('ok', 200);
			    }
		    });
	    }
		
	});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
		console.log(req.session.reset.email);
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e){
			console.log(e);
			if (e){
				res.send('unable to update password', 400);
			}	else{
				res.send('ok', 200);
			}
		})
	});
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { locals: { title : 'Account List', accts : accounts } });
		})
	});
	
	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
	            req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
	    });
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });
	
};