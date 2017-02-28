var mongoose = require('mongoose');

var User = mongoose.model('User', {
	email: {
		type: String,
		require: true,
		trim: true,
		minLength: 5
	}
});

module.exports = {
	User
};