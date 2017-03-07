var mongoose = require('mongoose');

mongoose.Promise = global.Promise;   //Tell Mongoose to use the built-in Promise library
mongoose.connect(process.env.MONGODB_URI);

module.exports = {
	mongoose
};