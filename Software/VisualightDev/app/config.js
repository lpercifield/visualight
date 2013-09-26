
module.exports = function(app, exp, MongoStore) {

	app.configure(function(){
		app.set('views', app.root + '/app/server/views');
		app.set('view engine', 'jade');
		app.set('view options', { doctype : 'html', pretty : true });
		app.use(exp.bodyParser());
		app.use(exp.cookieParser());
		app.use(exp.session({ secret: 'super-duper-secret-secret', store: new MongoStore({url:'mongodb://nodejitsu:ab124187f3e14972d1502824506e7123@linus.mongohq.com:10052/nodejitsudb6620458662'},function(){console.log('MongoStore')}) }));
		//app.use(exp.session({ secret: 'super-duper-secret-secret', store: new MongoStore({db:'node-login'},function(){console.log('MongoStore')}) }));
		app.use(exp.methodOverride());
		app.use(require('stylus').middleware({ src: app.root + '/app/public' }));
		app.use(exp.static(app.root + '/app/public'));
	});
	
}
/*
		app.use(exp.session({ 
		secret: 'super-duper-secret-secret', 
		store: new MongoStore({url:'mongodb://nodejitsu:ab124187f3e14972d1502824506e7123@linus.mongohq.com:10052/nodejitsudb6620458662'},
		function(){console.log('MongoStore')}) }));
*/