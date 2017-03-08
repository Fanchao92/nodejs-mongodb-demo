var mongoose = require('mongoose');
var validator = require('validator');

var User = mongoose.model('User', {
	email: {
		type: String,
		require: true,
		trim: true,
		minlength: 5,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email address!'
		}
	},
	password: {
		type: String,
		require: true,
		minlength: 8
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});

module.exports = {
	User
};