var Limiter = require('ratelimiter');
var ms = require('ms');

module.exports = function(db, maxRequests, duration) {
	return function limitNumberOfRequests(req, res, next) {

		var id = req.user._id;
		var limit = new Limiter({
			id: id,
			db: db,
			max: maxRequests,
			duration: duration
		});

		limit.get(function(err, limit) {

			if (err) return next(err);

			res.set('X-RateLimit-Limit', limit.total);
			res.set('X-RateLimit-Remaining', limit.remaining - 1);
			res.set('X-RateLimit-Reset', limit.reset);
console.log('dedans');
			if(limit.remaining) return next();
			console.log('dedans');
			var delta = (limit.reset * 1000) - Date.now() / 1000 | 0;
			var after = limit.reset - (Date.now() / 1000) | 0;
			res.set('Retry-After', after);
			res.send(429, 'Rate limit exceeded, retry in ' + ms(delta, { long:true }));
		});
		console.log('test');
	}
};