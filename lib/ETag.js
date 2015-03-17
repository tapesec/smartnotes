var crypto = require('crypto');
var cacheAndServe = function(req, res, next) {
	res.cachable = function(content) {
		var stringContent = JSON.stringify(content);
		var hash = crypto.createHash('md5');
		hash.update(stringContent);
		res.set({ 'ETag': hash.digest('hex') });

		if(req.fresh) {
			if (res._headers) {
				Object.keys(res._headers).forEach(function(header) {
					if (header.indexOf('content') === 0) {
						res.removeHeader(header);
					}
				});
			}
			res.statusCode = 304;
			return res.end();
		} else {
			res.setHeader('Content-Type', 'application/json');
			res.end(stringContent);
		}
	};

	next();
};

module.exports = cacheAndServe;