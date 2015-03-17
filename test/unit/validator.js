var should = require('should');
var validator = require('../../lib/validator');
var sinon = require('sinon');
var proxyquire = require('proxyquire');

describe('validator', function() {

	describe('validate', function() {
		
		it("Should throw an error if the delegated method doesn't exist",
			function() {
				delete validator.unknowMethod;
				(function() {
					validator.validate('unknowMethod');
				}).should.throw(/validator method does not exist/i);
			});

		it("should return a function", 
			function() {
				validator.trivialFunction = function() {};
				validator.validate('trivialFunction').should.be.a.Function;

			});

		it("Should be memoized", function() {
			var noop = sinon.stub();
			var memoize = sinon.spy(function(fn) {
				return noop;
			});
			var validator = proxyquire('../../lib/validator', {'memoizejs': memoize});
			memoize.calledOnce.should.be.true;
			validator.validate.should.eql(noop);
		});

	});

	describe("inner function", function() {

		it("Should call the delegated method with the arguments in order",
			function(){
				var method = sinon.spy();

				validator.myCustomValidationMethod = method;
				validator.validate('myCustomValidationMethod', 1, 2, 3)('str');

				method.calledWith('str', 1, 2, 3).should.be.true;
			});

	});
});