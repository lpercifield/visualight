var colors = require('colors');

colors.setTheme({

	data: 	'grey',
	info: 	'green',
	warn: 	'yellow',
	debug: 	'blue',
	help:  	'cyan',
	error: 	'red'
});

module.exports = function(app, exp, MongoStore) {

	app.configure(function(){
		app.set('views', app.root + '/app/server/views'); // setup the location of the views
		app.set('view engine', 'jade'); // set the view engine to jade
		app.set('view options', { doctype : 'html', pretty : true }); // set the view options

		app.use(exp.bodyParser()); // enable express body parser
		app.use(exp.cookieParser()); // enable express cookie parser
		app.use(exp.session({ secret: 'super-duper-secret-secret', maxAge: new Date(Date.now() + 3600000), store: new MongoStore({db:'visualight'},function(){console.log('MongoStore Connected'.debug)}) }));
		app.use(exp.methodOverride()); // no idea what this does...
		app.use(require('stylus').middleware({ src: app.root + '/app/public' })); // this does some styling stuff
		app.use(exp.static(app.root + '/app/public')); // this sets up the location for the public html views
		app.use(exp.favicon(app.root + '/app/public/img/favicon.ico'));

	});
	
}
