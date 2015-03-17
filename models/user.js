var validator = require('../lib/validator');
var passportLocalMongoose = require('passport-local-mongoose');
var mongoose = require('mongoose');
var sanitize = require('./utils');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = new Schema({

	username: {
		type: String,
		required: true,
		unique: true,
		validate: [{
			validator: validator.validate('isAlphanumeric'),
			msg: 'username must be alphanumeric'
		}, {
			validator: validator.validate('isLength', 4, 255),
			msg: 'username must have 4-255 chars'
		}]
	},
	email: {
		type: String,
		required: true,
		unique: true,
		validate: validator.validate('isEmail')
	},
	name: {
		type: String
	},
	grade: { 
		type: String,
		validate: validator.validate('isAlphanumeric')
	},
	dateAdmin: { 
		type: Date 
	},
	dateGrade: { 
		type: Date 
	},
	residence: { 
		type: String 
	},
	service: { 
		type: String 
	},
	description: { 
		type: String 
	},
	destination: { 
		choix1: { type: String },
		choix2: { type: String },
		choix3: { type: String }
	},
	dateConnexion: { 
		type: Date 
	},
	lastSearch: { 
		type: Date 
	},
	status: { 
		type: Number, 
		default: 1 
	},
	tokken: { 
		type: Schema.Types.Mixed 
	},
	checked: { 
		type: Boolean, 
		default: false 
	},
	ready: { 
		type: Boolean, 
		default: false},
	match: []
});

User.plugin(passportLocalMongoose);

User.pre('save', function (next) {
	var self = this;
  	var fields = Object.keys(this._doc);
  	sanitize(self, fields, function(err) {
  		console.log(err, 'erreur pre');
  		if (err) next(err);
  		next();
  	});
});

module.exports = mongoose.model('User', User);