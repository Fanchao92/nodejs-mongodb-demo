const ObjectID = require('mongodb').ObjectID;
const Todo = require('./../../models/todo.js').Todo;
const User = require('./../../models/user.js').User;
const jwt = require('jsonwebtoken');

const user1Id = new ObjectID();
const user2Id = new ObjectID();

var users = [{
	_id: user1Id,
	email: 'user1@gmail.com',
	password: 'user1pswd',
	tokens: [{
		access: 'auth',
		token: jwt.sign({_id: user1Id, access: 'auth'}, 'secret').toString()
	}]
}, {
	_id: user2Id,
	email: 'user2@gmail.com',
	password: 'user2pswd',

}];

var todos = [{
	text: "todo 1",
	_id: new ObjectID()
}, {
	text: "todo 2",
	_id: new ObjectID()
}];

const populateUsers = (done) => {
	User.remove({}).then(() => {
		var user1 = new User(users[ 0 ]).save();
		var user2 = new User(users[ 1 ]).save();

		return Promise.all([ user1, user2 ]);
	}).then(() => {
		done();
	});
};

const populateTodos = (done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);
	}).then(() => {
		done();
	});
};

module.exports = {
	todos, populateTodos, users, populateUsers
};