var redis = require('redis');
var db = redis.createClient();
var limiter = require("./lib/rate-limiter")(db, 5000, 60 * 60 * 24);
var caching = require("./lib/ETag");
var express = require("express");

var app = express();
var db = require('./lib/db');
var config = require('./config')[app.get('env')];

var mongoose = require('mongoose');
var User = require('./models/user');
var Note = require('./models/note');
var routes = require('./routes');

var methodOverride = require('method-override');
var bodyParser = require('body-parser');
db.connect(config.mongoUrl);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(methodOverride(function(req, res) {
	if(req.body && typeof req.body === "object" && "_method" in req.body) {
		var method = req.body._method;
		delete req.body._method;
		return method;
	}
}));

app.use(function(req, res, next) {
	req.User = User;
	req.Note = Note;
	next();
});

app.get('/users/:username', caching, routes.users.show);
app.post('/users', routes.users.create);
app.get('/users/:username/notes', caching, routes.notes.showPublic);
app.patch('/users/:username', routes.users.authenticate, routes.users.update);
app.get('/notes', routes.users.authenticate, caching, routes.notes.index);
app.post('/notes', routes.users.authenticate, routes.notes.create);
app.get('/notes/:id', routes.users.authenticate, caching, routes.notes.show);

module.exports = app;

if(!module.parent) {
	var masterApp = express();
	masterApp.use('/api/v1/', app);
	masterApp.listen(config.port);
	console.log('(%s) app listening on port %s', app.get('env'), config.port);
}