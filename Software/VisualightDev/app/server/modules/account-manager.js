
var crypto 		= require('crypto')
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');
var Mongo 		= require('mongodb').MongoClient;


var dbPort 		= 27017;
var dbHost 		= global.host;
var dbName 		= 'node-login';
var accounts;
var bulbs;
var sessions;
var groups;



/*
exports.connectServer = function(callback){
	Mongo.connect("mongodb://nodejitsu:ab124187f3e14972d1502824506e7123@linus.mongohq.com:10052/nodejitsudb6620458662", {auto_reconnect: true}, function(err, db) {
				console.log("connecting to DB...");
			if (err) {
				console.log(err);
				callback(err);
			}	else{
				console.log('connected to database :: ' + dbName);
				accounts = db.collection('accounts');
				bulbs = db.collection('bulbs');
				sessions = db.collection('sessions');
				callback(null);
			}
		}); 
	}
*/
	exports.connectServer = function(callback){
	Mongo.connect("mongodb://localhost:27017/visualightdev", {auto_reconnect: true}, function(err, db) {
				console.log("connecting to DB...");
			if (err) {
				console.log(err);
				callback(err);
			}	else{
				console.log('connected to database :: ' + dbName);
				accounts = db.collection('accounts');
				bulbs = db.collection('bulbs');
				sessions = db.collection('sessions');
				groups = db.collection('groups');
				callback(null);
			}
		}); 
	}

/* socket validation methods */

exports.validateSession = function(session, callback)
{	
	console.log(session);
	sessions.findOne({_id:session}, function(e, o) {
		if (o == null){
			callback('session-not-found');
		}	else{
			callback(null);
		}
	});
}

/* get current bulb information*/

exports.getBulbInfo = function(id, callback)
{	
	//console.log("bulbId" + id);
	bulbs.findOne({_id: getBulbId(id)}, function(e, o) {
		if (o == null){
			callback(null);
		}	else{
			callback(o);
		}
	});
}

/* sets current bulb status*/
exports.updateBulbStatus = function(id, online, callback)
{	
	//console.log("bulbId" + id);

	// convert this to an update and modify the object... this currently overwrites the bulb object -- oops...
	bulbs.save({_id: getBulbId(id),status:online,lastOnline:moment()},{safe:true}, function(e, o) {
		if (o == null){
			callback(null);
		}
	});
}

/* get current bulb information*/

exports.checkBulbAuth = function(macAdd, callback)
{
	bulbs.findOne({mac:macAdd}, function(e, o) {
		console.log("found" + macAdd);
		if (o == null){
			//console.log("error "+e);
			callback(null);
			
		}else{
			//console.log(o);
			callback(o);
		}
	});
}

/* login validation methods */

exports.autoLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o){
			o.pass == pass ? callback(o) : callback(null);
		}	else{
			callback(null);
		}
	});
}

exports.manualLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	else{
			validatePassword(pass, o.pass, function(err, res) {
				if (res){
					callback(null, o);
				}	else{
					callback('invalid-password');
				}
			});
		}
	});
}

/* record insertion, update & deletion methods */

exports.addNewAccount = function(newData, callback)
{
	accounts.findOne({user:newData.user}, function(e, o) {
		if (o){
			callback('username-taken');
		}	else{
			accounts.findOne({email:newData.email}, function(e, o) {
				if (o){
					callback('email-taken');
				}	else{
					saltAndHash(newData.pass, function(hash){
						newData.pass = hash;
					// append date stamp when record was created //
						newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						accounts.insert(newData, {safe: true}, callback);
					});
				}
			});
		}
	});
}

exports.addNewGroup = function(user, post, callback){

	//collect post data 
	//process post data
	console.log(post);

	//check group name 

	callback();
}

exports.addNewBulb = function(user, bulbMac, callback)
{
	//TODO - Verify that the bulb is not already added
	//TODO - Setup default bulb object status including all available params including params not yet available in API
	//mongod --dbpath /var/lib/mongodb
	//Boolean bulbExists = false;
	bulbs.findOne({mac:bulbMac.mac}, function(err, item){
		console.log("err: "+err+" item: "+item);
		if(item ==null ){
			console.log("new bulb");
			accounts.findOne({user:user}, function(e, o) {
				if (o == null){
					callback('user-not-found');
				}else{
					if(o.bulbs == null){
						o.bulbs = new Array();
					}
					var bulb = new Object();
					bulb.mac = bulbMac.mac;
					bulb.user = o._id;
					bulbs.insert(bulb, {safe: true}, function(err,item){
						bulbs.findOne({mac:bulb.mac}, function(err,item){
							console.log(item);
							var myBulb = new Object();
							myBulb.name = "Visualight "+(o.bulbs.length+1);
							myBulb.id = item._id;
							o.bulbs.push(myBulb);
							//o.bulbs = bulbArray;
							console.log(o.bulbs);
							//callback(o.bulbs);
							accounts.save(o, {safe: true}, callback);
						});
					});
				}
			});
		}else{
			console.log("bulb already exists");
			callback("bulb-already-registered");
			//bulbExists = true;
		}
	});

}
exports.getBulbs = function(user, callback)
{	
	//console.log(user);
	accounts.findOne({user:user}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	else{
			callback(o.bulbs);
		}
	});
}

exports.updateAccount = function(newData, callback)
{
	accounts.findOne({user:newData.user}, function(e, o){
		o.name 		= newData.name;
		o.email 	= newData.email;
		o.country 	= newData.country;
		if (newData.pass == ''){
			accounts.save(o, {safe: true}, callback);
		}	else{
			saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				accounts.save(o, {safe: true}, callback);
			});
		}
	});
}

exports.updatePassword = function(email, newPass, callback)
{
	accounts.findOne({email:email}, function(e, o){
		console.log(o);
		saltAndHash(newPass, function(hash){
			o.pass = hash;
			accounts.save(o, {safe: true}, callback);
		});
	});
}

/* account lookup methods */

exports.deleteAccount = function(id, callback)
{
	accounts.remove({_id: getObjectId(id)}, callback);
}

exports.getAccountByEmail = function(email, callback)
{
	accounts.findOne({email:email}, function(e, o){ callback(o); });
}

exports.validateResetLink = function(email, passHash, callback)
{
	accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
	});
}

exports.getAllRecords = function(callback)
{
	accounts.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

exports.delAllRecords = function(callback)
{
	accounts.remove({}, callback); // reset accounts collection for testing //
}

/* private encryption & validation methods */

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

/* auxiliary methods */

var getObjectId = function(id)
{
	return accounts.db.bson_serializer.ObjectID.createFromHexString(id)
}
var getBulbId = function(id)
{
	return bulbs.db.bson_serializer.ObjectID.createFromHexString(id)
}
var findById = function(id, callback)
{
	accounts.findOne({_id: getObjectId(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};


var findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	accounts.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}
