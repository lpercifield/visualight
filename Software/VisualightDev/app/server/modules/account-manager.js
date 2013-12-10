var crypto 		= require('crypto')
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');
var Mongo 		= require('mongodb').MongoClient;
var colors 		= require('colors');

colors.setTheme({

	data: 	'grey',
	info: 	'green',
	warn: 	'yellow',
	debug: 	'blue',
	help:  	'cyan',
	error: 	'red'
});


var dbPort 		= 27017;
var dbHost 		= global.host;
var dbName 		= 'node-login';
var accounts;
var bulbs;
var sessions;
var groups;


exports.connectServer = function(callback){
	Mongo.connect("mongodb://localhost:27017/visualight", {auto_reconnect: true}, function(err, db) {
				console.log("connecting to DB...");
			if (err) {
				console.log(err);
				callback(err);
			}	else{
				console.log('connected to database :: '.debug + dbName.debug);
				accounts = db.collection('accounts');
				bulbs = db.collection('bulbs');
				sessions = db.collection('sessions');
				groups = db.collection('groups');
				callback(null);
			}
	}); 
}
exports.sessionAuth = function(session_id, session, callback)
{
	//check the database for the session_id
	//verify that the username has been added to the session
	//return true or false

	//console.log(session_id);
	
	sessions.findOne({_id: session_id },function(e,o){
		//console.log(o);
		if(!o){
			console.log("NO SESSION FOUND");
			callback(false);
		}else{
			
			try{
				var dbSess = JSON.parse(o.session)
			}catch(e){
				console.error('PARSE ERROR');
				console.error(e);
			}
			
			if(!dbSess.hasOwnProperty('user')){
				console.log("NO USER FOUND");
				callback(false)
			}else{
				if(dbSess.user == session.user){ 
					callback(true);
				}else{
				 console.log("USERS DONT MATCH");
				 console.log('DB:'+dbSess);
				 console.log('session: '+session.user);
				 callback(false)
				}
			}
		}
	})
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

/* bulb logoff */

exports.updateBulbLogoff=function(id,color,callback){
	//set last color state on logoff
	//set status to 0 aka offline 
	var obj = { $set: {color: color, lastOnline: new Date(), status:0 }}
	bulbs.update({_id: getBulbId(id)},obj,true,function(e,o){

		callback(null);
	})

}


/* sets current bulb status*/
exports.updateBulbStatus = function(id, online, color, callback)
{	
	//var online = 0or1
	//offline = 0
	//online = 1
	
	var obj = {$set: {color: color, lastOnline: new Date(), status:online }};
	bulbs.update({_id:getBulbId(id)},obj,true,function(e,o){
		callback(null)
	})
/*
	bulbs.save({_id: getBulbId(id),status:online,lastOnline:moment()},{safe:true}, function(e, o) {
		if (o == null){
			callback(null);
		}
	});
*/
}
exports.deleteGroup = function(key,callback)
{
	groups.remove({_id: getBulbId(key)},function(e){
		var result = new Object();
		
		if(e){ result.status = 'error';
			   result.details = e;
		}else{ result.status = 'deleted';
			   result.details = {key: key};
		}
		callback(result)
	})	
	
}

exports.deleteBulb = function(key,callback)
{
	bulbs.remove({_id: getBulbId(key)},function(e){
		var result = new Object();
		
		if(e){ result.status = 'error';
			   result.details = e;
		}else{ result.status = 'deleted';
			   result.details = {key: key};
		}
		callback(result)
	})	
	
}
exports.updateBulbData = function(key,post,callback)
{	
	if(post.options) var obj = {$set:{name:post.name,options:post.options}};
	else var obj = {$set:{name:post.name}};
	
	bulbs.update({_id:getBulbId(key)},obj, true, function(e,o){
		var result = new Object();
		
		if(e){ result.status = 'error';
			   result.details = e;
		}else{ result.status = 'success';
		}
		callback(result)
	})
}

exports.updateGroupData =function(key,post,callback)
{

	var obj = {$set: {name: post.name, bulbs: post.bulbs }}
	
	groups.update({_id: getGroupId(key)},obj,true,function(e,o){
		var result = new Object();
		if(e){ result.status = 'error';
			   result.details = e;
		}else{ result.status= 'success';
		}
		callback(result)
		
	})
	
}

/* get current bulb information*/

exports.checkBulbAuth = function(macAdd, callback)
{
	bulbs.findOne({mac:macAdd}, function(e, o) {
		console.log("FOUND MAC: ".help + macAdd.data);
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
{	//exposed hashed password?
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
	console.log("Incoming Data: ".help+JSON.stringify(post).data);

	//find user 
	accounts.findOne({user:user},function(e,o){
		if(e){ 
			callback('Accounts Database Error: '+e);
		}else if(o == null){
			callback('user-not-found');
		}else if(post.name === ''){
			callback('no group name');
		}else if(post.bulbs == null){
			callback('no bulbs selected');
		}else{

			//have all our data to make a group
			console.log(JSON.stringify(o).info);
			var obj = {name:post.name, bulbs:post.bulbs, user: o._id, created: new Date()}

			//console.log(obj)
			groups.insert(obj,function(e,g){
				if(e){
					callback('Groups Database Insert Error: '+e);
				}else{
					callback(); 
				}
			});

			
		}
	})


	//check group name 
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
					console.log('Creating BULB'.info);
					bulbs.count({user:o._id},function(err,count){
						if(err){ bulb.name = "Newest Visualight" 
						}else{ 
						console.log('User:'.help+o._id+' Bulb Count: '.help+count);
							bulb.name = "Visualight "+(count+1);
						}
						console.log('Inserting Bulb'.info);
						console.log(JSON.stringify(bulb).data);
						bulbs.insert(bulb, {safe: true}, function(err,item){
							/*
							bulbs.findOne({mac:bulb.mac}, function(err,item){
								console.log(item);
								var myBulb = new Object();
								myBulb.name = "Visualight "+(o.bulbs.length+1);
								myBulb.id = item._id;
								
								//no longer storing bulbs into the account information 
								
								//o.bulbs.push(myBulb);
								//o.bulbs = bulbArray;
								//console.log(o.bulbs);
								//callback(o.bulbs);
								accounts.save(o, {safe: true}, callback);
							});
							*/
							callback();
						});
					})
				}
			});
		}else{
			console.log("bulb already exists".warn);
			callback("bulb-already-registered");
			//bulbExists = true;
		}
	});

}
exports.getGroupBulbs = function(id,callback)
{	
//console.log("INCOMING Group ID: "+id )
	groups.findOne({_id: getGroupId(id)}, function(e,g){
		if(g ==null){
			callback(null)
		}else{
			callback(g)
		}
	})

}
exports.getGroupsByKey = function(key,callback)
{

	groups.find({user:getUserId(key)}).toArray(function(e,g){
		if(g==null){
			callback('group-not-found')
		}else if(e){
			callback('DB ERROR: '+e);
		}else{
			//TO DO:
			//delete the fields we want to hide from g and send it back
			callback(g);
		}
	})
		
}
exports.getBulbsByKey = function(key, callback)
{	

	bulbs.find({user:getUserId(key)}).toArray(function(e,b){
		if(e){
			console.error(e)
			callback('DB ERROR: '+e)
		}else if(b==null){
			callback('bulbs-not-found')
				
		}else{
			//TO DO:
			//delete the fields we want to hide from b and send it back
			callback(b);
		}
	})
			

}
exports.getGroupsByUser = function(user,callback)
{

	accounts.findOne({user:user},function(e,o){
		if(o==null){
			callback('user-not-found');
		}else{

			groups.find({user:o._id}).toArray(function(e,g){
				if(g==null){
					callback('group-not-found')
				}else if(e){
					callback('DB ERROR: '+e);
				}else{
					//TO DO:
					//delete the fields we want to hide from g and send it back
					callback(g);
				}
			})
		}
	})
}

exports.getBulbsByUser = function(user, callback)
{	
	//console.log(user);
	accounts.findOne({user:user}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	else{
			bulbs.find({user:o._id}).toArray(function(e,b){
				if(e){
					console.error(e)
					callback('DB ERROR: '+e)
				}else if(b==null){
					callback('bulbs-not-found')
						
				}else{
					//TO DO:
					//delete the fields we want to hide from b and send it back
					callback(b);
				}
			})
			
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
var getGroupId =function(id){
	return groups.db.bson_serializer.ObjectID.createFromHexString(id)
}

var getObjectId = function(id)
{
	return accounts.db.bson_serializer.ObjectID.createFromHexString(id)
}
var getBulbId = function(id)
{
	return bulbs.db.bson_serializer.ObjectID.createFromHexString(id)
}
var getUserId = function(id)
{
	return accounts.db.bson_serializer.ObjectID.createFromHexString(id)
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
