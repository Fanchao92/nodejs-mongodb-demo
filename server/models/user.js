var mongoose = require('mongoose');
var validator = require('validator');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var bcrypt = require('bcryptjs');

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

UserSchema.pre('save', function(next) {
	if(this.isModified('password')) {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(this.password, salt, (err, hash) => {
				this.password = hash;
				next();
			});
		});
	} else {
		next();
	}
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

	return this.findOne({
		_id: decoded._id,
		'tokens.token': token,
		'tokens.access': decoded.access
	});
}

UserSchema.statics.findByCredentials = function(email, password) {
	return this.findOne({email})
		.then((user) => {
			if(user) {
				return new Promise((resolve, reject) => {
					bcrypt.compare(password, user.password, (err, res) => {
						if(err) {
							reject(err);
						} else {
							if(res) {
								resolve(user);
							} else {
								reject(new Error('Password does NOT match!'));
							}
						}
					});
				});
			} else {
				return new Promise((res, rej) => {
					rej();
				});
			}
		})
		.catch((err) => {
			return new Promise((res, rej) => {
				rej();
			});
		});
}

var User = mongoose.model('User', UserSchema);

module.exports = {
	User
};