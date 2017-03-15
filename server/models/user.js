var mongoose = require('mongoose');
var validator = require('validator');
var jwt = require('jsonwebtoken');
var _ = require('lodash');

var UserSchema = new mongoose.Schema({
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

UserSchema.methods.generateAuthToken = function() {
	var access = 'auth';
	var token = jwt.sign({_id: this._id.toHexString(), access}, 'secret');

	this.tokens.push({access, token});
	return this.save()
		.then(() => {
			return token;
		});
};

UserSchema.methods.toJSON = function() {
	var userObj = this.toObject();

	return _.pick(userObj, ['_id', 'email']);
}

UserSchema.statics.findByToken = function(token) {
	var decoded;

	try {
		decoded = jwt.verify(token, 'secret');
	} catch(err) {
		return new Promise((res, rej) => {
			rej();
		});
	}

	return User.findOne({
		_id: decoded._id,
		'tokens.token': token,
		'tokens.access': decoded.access
	});
}

var User = mongoose.model('User', UserSchema);

module.exports = {
	User
};