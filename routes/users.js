var _ = require('lodash');
var db = require('../lib/db');

var publicAttributes = ['username', 'email', 'name'];
var basicAuth = require('basic-auth-connect');

exports.authenticate = function(req, res, next) {
	basicAuth(function(user, pass, fn) {
	
		req.User.authenticate()(user, pass, function(err, userData) {
			fn(err, _.pick(userData, ['_id', 'username', 'email', 'name']));
			//console.log(req.user);
		});

	})(req, res, next);
};


exports.show = function(req, res, next) {
	req.User.findOne({ username: req.params.username },
		function(err, userData) {
			if (!userData) {
				return res.status(404).cachable({ errors: ['user not found'] });
			}

			res.cachable(_.pick(userData, publicAttributes ));
		});
};

exports.create = function(req, res, next) {
	var newUser = new req.User(_.pick(req.body, publicAttributes));

	req.User.register(newUser, req.body.password, function(err, userData) {
		if (err) {
			if (db.isValidationError(err)) {
				res.status(422).send({ errors: ['invalid data'] });
			} else if (db.isDuplicateKeyError(err)) {
				res.status(422).send({ errors: ['username/email already exists'] });
			} else {
				next(err);
			}
		} else {
			res
				.status(201)
				.set('Location', '/users/' + userData.username)
				.send(_.pick(userData, publicAttributes));
		}
	});
};


exports.update = function(req, res, next) {
	function saveAndRespond(user) {
		user.save(function(err, userData) {
			if (err) {
				if (db.isValidationError(err)) {
					res.status(422).send({ errors: ['invalid data'] });
				} else if (db.isDuplicateKeyError(err)) {
					res.status(422).send({ errors: ['username/email already exists'] });
				} else {
					next(err);
				}
			} else {
				res.status(204).send();
			}	
		});
	};

	if (req.params.username !== req.user.username) {
		return res.status(403).send({ errors: ['cannot update other users'] });
	} else {
		if (!Array.isArray(req.body)) {
			return res.status(400).send({ errors: ['use JSON Patch'] });
		} else {
			if (req.body.some(function(item) { return item.op !== 'replace'; })) {
				return res.status(422).send({ errors: ['only replace is suported atm'] });
			} else {
				req.User.findOne({ username: req.user.username }, function(err, user) {
					if (err) { return next(err); }
					if (!user) {
						return res.status(404).send({ errors: ['no such user']});
					}

					req.body.forEach(function(item) {
						if (item.path !== '/username') {
							user[item.path.replace(/^\//, '')] = item.value;
						}
					});

					if (user.password) {
						var password = user.password;
						delete user.password;

						user.setPassword(password, function(err) {
							if (err) { return nex(err); }
							saveAndRespond(user);
						});
					} else {
						saveAndRespond(user);
					}
				});
			}
		}
	}
};