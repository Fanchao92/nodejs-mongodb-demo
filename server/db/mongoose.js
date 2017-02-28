var mongoose = require('mongoose');

mongoose.Promise = global.Promise;   //Tell Mongoose to use the built-in Promise library
mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {
	mongoose
};