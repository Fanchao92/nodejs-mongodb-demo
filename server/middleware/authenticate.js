var User = require('./../models/user.js').User;

function authenticate(req, res, next) {
	var token = req.get('x-auth');

	User.findByToken(token)
		.then((usr) => {
			if(usr) {
				req.user = usr;
				req.token = token;
				next();
			} else {
				res.status(401).send({});
			}
		})
		.catch(() => {
			res.status(401).send({});
		});
};

module.exports = {
	authenticate
}