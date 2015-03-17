var should = require('should');
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var helpers = require('../utils/helpers');
var mongoose = helpers.getMongooseStub();

var shouldDefineSchemaProperty = helpers.shouldDefineSchemaProperty.bind(null, mongoose.Schema);
var shouldRegisterSchema = helpers.shouldRegisterSchema.bind(null, mongoose.model, mongoose.Schema);
var shouldBeRequired = helpers.shouldBeRequired.bind(null, mongoose.Schema);
var shouldBeA = helpers.shouldBeA.bind(null, mongoose.Schema);
var shouldDefaultTo = helpers.shouldDefaultTo.bind(null, mongoose.Schema);
var shouldBeBetween = helpers.shouldBeBetween.bind(null, mongoose.Schema);
var shouldValidateThat = helpers.shouldValidateThat.bind(null, mongoose.Schema);
var shouldValidateMany = helpers.shouldValidateMany.bind(null, mongoose.Schema);
var shouldLoadPlugin = helpers.shouldLoadPlugin.bind(null, mongoose.Schema);
var shouldBeUnique = helpers.shouldBeUnique.bind(null, mongoose.Schema);
var shouldBeUnique = helpers.shouldBeUnique.bind(null, mongoose.Schema);


describe('User', function() {
	var User, mongooseTimestamp;

	before(function() {
		mongooseTimestamp = sinon.stub();
		User = proxyquire('../../models/user', {
			'mongoose-timestamp': mongooseTimestamp,
			'mongoose': mongoose
		});
	});
	// the tests will be included here

	it('Should register the Mongoose model', function() {
		shouldRegisterSchema('User');
	});

	describe('username', function() {
		it('should be unique', function() {
			shouldBeUnique('username');
		});

		it('should be a string', function() {
			shouldBeA('username', String);
		});

		it('should be alphanumeric and have 4-255 chars', function() {
			shouldValidateMany('username', {
				args: ['isAlphanumeric'],
				msg: 'username must be alphanumeric'
			}, {
				args: ['isLength', 4, 255],
				msg: 'username must have 4-255 chars'
			});
		});

	});

	describe('email', function() {
		it('should be required', function() {
			shouldBeRequired('email');
		});

		it('should be Unique', function() {
			shouldBeUnique('email');
		});

		it('should be a string', function() {
			shouldBeA('email', String);
		});

		it('Should be an Email', function() {
			shouldValidateThat('email', 'isEmail');
		});

	});

	describe('name', function() {
		it('should be a string', function() {
			shouldBeA('name', String);
		});		
	});

});