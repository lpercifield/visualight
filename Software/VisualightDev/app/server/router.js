var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var WS = require('./modules/handle-sockets');
var API = require('./modules/api');
var AUTH = require('./modules/auth');

var colors = require('colors');

colors.setTheme({

	data: 	'grey',
	info: 	'green',
	warn: 	'yellow',
	debug: 	'blue',
	help:  	'cyan',
	error: 	'red'
});


module.exports = function(app, io, sStore) { // this gets called from the main app

	//this function sets up the DB connections
	AM.connectServer(function(e){
		if(e == null){ // if there is no error in creating the db connections
			WS.createSockets(app, io, AM); // then setup the sockets
		}
	});
	
	app.get('/test',AUTH.sessionCheck,function(req,res){
		res.send('you\'ve made it');
	})
	
/**
* main login page 
* This route is called from the idex of the URL where the app is running
*
* @method get /
* @param {String} req.cookies.user from the cookie get the user
* @param {String} req.cookies.pass from the cookie get the pass
*/
	app.get('/',AUTH.sessionCheck, function(req, res){

		res.redirect('/myvisualight'); // this is where the auth'd user is redirected
		
	});
	
	app.get('/login',function(req,res){
		res.render('login', { locals: { title: 'Visualight - Please Login To Your Account' }}); // this renders the login view

	})
	
/**
 * post login route 
 * This route is used to manually login
 *
 *  @method post /
 *  @param {String} user user-id
 *  @param {String} pass password
 *
 */
	app.post('/', function(req, res){
	console.log('Logging User IN'.error);
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
				//log in our user with a session
			    req.session.user = o.user;
			    res.cookie('sessionID',req.sessionID);
			    console.log('User Authenticated: '.info+o.user+' Session: '.info+JSON.stringify(req.session).data)
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					//res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.send(o, 200);
			}
		});
	});
	app.post('/login', function(req, res){
	console.log('Logging User IN'.error);
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
				//log in our user with a session
			    req.session.user = o.user;
			    res.cookie('sessionID',req.sessionID);
			    console.log('User Authenticated: '.info+o.user+' Session: '.info+JSON.stringify(req.session).data)
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					//res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.send(o, 200);
			}
		});
	});
	
// logged-in user homepage //

/**
* main home page 
* This route is called to show the control panel for a user
*
* @method get /home
*/

	app.get('/home',AUTH.sessionCheck, function(req, res) {

			res.render('home', {
				locals: {
					title : 'Control Panel',
					countries : CT,
					udata : req.session.user
				}
			});
	    
	});
	
/**
* main visualight page 
* This route is called to show the visualight panel for a user
*
* @method get /myvisualight
*/
	app.get('/myvisualight',AUTH.sessionCheck, function(req, res) {

			res.render('myvisualight', {
				locals: {
					title : 'My Visualights',
					udata : req.session.user
				}
			});
	    
	});
/**
* updates a user in the DB 
* This route is called when you change your user data
*
* @method post /home
* @param {String} user user-id
* @param {String} name the users name
* @param {String} email users email
* @param {String} country the users country
* @param {String} pass password
*/	
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
	

/**
* creating new accounts 
* This route is called to show the signup page
*
* @method get /signup
*/	
	app.get('/signup', function(req, res) {
		res.render('signup', {  locals: { title: 'Signup', countries : CT } });
	});
/**
* adds a user to the DB 
* This route is called when you signup
*
* @method post /signup
* @param {String} name the users name
* @param {String} email users email
* @param {String} user user-id
* @param {String} pass password
* @param {String} country the users country
*/		
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
/**
* get the registered bulbs for a user
* This route is called to get the bulbs for a user
* ---THIS NEEDS AN UPDATE
* should take either the session or an API key
*
* @method get /get-bulbs
*/	
	app.get('/get-bulbs',AUTH.authCheck, function(req,res){
		//console.log;

		    AM.getBulbsByUser(req.session.user, function(o){
			    if(o){
				    res.send(o,200);
			    }else{
				    res.send('bulbs-not-found', 400);
			    }
		    });
	    
		
	});
	app.get('/get-bulbs/:key', AUTH.authCheck, function(req,res){
		var key = req.params.key;
		AM.getBulbsByKey(key,function(o){
			if(o){
				    res.send(o,200);
			    }else{
				    res.send('bulbs-not-found', 400);
			   }
		})
		
	})

/**
* get the registered  groups for a user
* This route is called to get the groups for a user
* ---THIS NEEDS AN UPDATE
* should take either the session or an API key
*
* @method get /get-groups
*/	
	app.get('/get-groups', AUTH.authCheck, function(req,res){

		    AM.getGroupsByUser(req.session.user, function(o){
			    //console.log('AM.getGroups');console.log(o);
			    if(o){
				    res.send(o,200);
			    }else{
				    res.send('bulbs-not-found', 400);
			    }
		    });
	    
		
	});
	
	app.get('/get-groups/:key', AUTH.authCheck, function(req,res){
		var key = req.params.key;
		AM.getGroupsByKey(key,function(o){
			if(o){
				    res.send(o,200);
			    }else{
				    res.send('bulbs-not-found', 400);
			   }
		})
		
	})
	
/***
 *
 * adds a bulb to DB
 * This route is called to add a bulb
 * ---THIS NEEDS AN UPDATE
 * should take either the session or an API key??
 *
 * @method post /add-bulbs
 * @param {Object} bulb this is a new bulb object {bulb : bulbMac}
 *
***/	
	app.post('/add-bulb', AUTH.authCheck, function(req,res){

		    AM.addNewBulb(req.cookies['user'],req.param('bulb'), function(e){ // this should be setup to use something other than the cookies. pass user in from check auth?
		    	console.log("add bulb request".help);
			    if(e){
				    res.send(e,400);
				    console.log('denied'.error);
			    }else{
				    res.send('ok', 200);
				    console.log('accepted'.data);
			    }
		    });
	    
		
	});
	
	
/**
 *
 *	Routes for bulb actions - update delete 	
 *	
 *	TODO: AUTHENTICATE ALL OF THIS
 *
 */
 
 app.post('/bulb/:key/update',AUTH.authCheck,function(req,res){
 

		var key = req.params.key;
		var post = req.body;
		console.log('BULB UPDATE REQUEST'.info)
		console.log(key.help);
		console.log(JSON.stringify(post).data);
	
		AM.updateBulbData(key,post,function(result){
			//res.send(result);
			res.writeHead(200, {'content-type':'text/json'})
			res.end(JSON.stringify(result))
		})
	
 })
 
 app.delete('/bulb/:key',AUTH.authCheck,function(req,res){

		 var key = req.params.key;
		 
		 AM.deleteBulb(key,function(result){
		 	res.writeHead(200,{'content-type':'text/json'})
		 	res.end(JSON.stringify(result));	
		 }); 
		 //delete the bulb 
	 
 })
 
 app.post('/group/:key/update',AUTH.authCheck,function(req,res){

 		var key = req.params.key;
		var post = req.body;
		console.log('GROUP UPDATE REQUEST'.info) 
		console.log(key.help);
		console.log(JSON.stringify(post).data);
		AM.updateGroupData(key,post,function(result){
			res.writeHead(200,{'content-type':'text/json'})
			res.end(JSON.stringify(result))
		})

 })
 /* TO DO: RETEST THIS
 */
 app.delete('/group/:key',AUTH.authCheck,function(req,res){

		 var key = req.params.key;
		 
		 AM.deleteGroup(key,function(result){
		 	res.writeHead(200,{'content-type':'text/json'})
		 	res.end(JSON.stringify(result));	
		 }); 
		 //delete the bulb 
	 
 })
 /* TO DO: Test This shit.
 */
 app.delete('/bulb/:key',AUTH.authCheck,function(req,res){

		 var key = req.params.key;
		 AM.deleteBulb(key,function(result){
			res.writeHead(200,{'content-type':'text/json'});
			res.end(JSON.stringify(result)); 
		 })
	 
	 
 })


/**
 *   trigger bulb
 *
 *
 *	@method post /trigger/:key
 * 	@param {JSON OBJECT} bulbObj 
 */ 
 
app.post('/trigger/:key',AUTH.authCheck,function(req,res){
	
	console.log('Got Trigger');
	console.log(req.body)
	

		var key = req.params.key;
		var post = req.body;
		
		API.parseMessage(JSON.stringify(post), WS.returnBulbs,function(o,e){ 
			
			if(o != null){ // the json was valid and we have a bulb object that is valid
              WS.sendTrigger(o);  // send this data to the visualight

            }else{
              console.log(e.error); // we got an error from the api call -- NEED TO SEND THIS BACK TO THE CLIENT??

            }
			
		})

})
 
/** 
 *
 *  add bulbs to groups
 *	This route is called to add bulbs into new group
 *
 *	@method post /bind-group
 *  @param {Object} 
 *
 */	

  app.post('/bind-group', AUTH.authCheck,function(req,res){

  			AM.addNewGroup(req.session.user.user,req.body,function(e){
  				console.log('add group request'.help);
  				if(e){
  					res.send(e,400);
  					console.log('denied: '.error+e.data);
  				}else{
  					//res.send('ok',200);
  					res.redirect('/myvisualight');
  					console.log('accepted'.data);
  				}
  			});
  		
  });

// password reset //
/**
* sends the reset password url to the registered email
*
* @method post /lost-password
* @param {String} email
*/	
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
/**
* sends the reset password view if the link is valid
*
* @method get /reset-password
* @param {String} e email
* @param {String} p password
*/	
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
/**
* handles saving the new password for a user
*
* @method post /reset-password
* @param {String} pass
*/	
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
/**
* Shows all the registered users -- DELETE FROM PROD BUILD OR PASSWORD PROTECT!!!!
*
* @method get /print
*/	// only allow this route if running debug or on local
/*
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { locals: { title : 'Account List', accts : accounts } });
		})
	});
*/
/**
* delete a registered user using session data
*
* @method post /delete
*/		
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
// view & delete accounts //
/**
* deletes all users -- DELETE FROM PROD BUILD OR PASSWORD PROTECT!!!!
*
* @method get /reset
*/		// only allow this route if running debug or in local...
/*
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
*/
	
/**
* send 404
*
* @method get *
*/		
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });
	
};