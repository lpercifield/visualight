//middleware to check if user is authenticated into page
var AM = require('./account-manager');

exports.sessionCheck = function(req, res, next){
	//console.log(req.session);
	AM.sessionAuth(req.cookies['connect.sid'],req.session, function(valid){
		if(valid === true) next();
		else res.redirect('/login');
	})

}

//returns 400
exports.authCheck = function(req, res, next){ // This should be able to handle both a session/cookie auth or an api key auth
	console.log('Checking Auth');
	AM.sessionAuth(req.cookies['connect.sid'],req.session, function(valid){
		if(valid === true) next();
		else res.send('not-authorized',400);
	})

}