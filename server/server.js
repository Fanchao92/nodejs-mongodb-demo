var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('./db/mongoose.js').mongoose;
var Todo = require('./models/todo.js').Todo;
var User = require('./models/user.js').User;
var ObjectID = require('mongodb').ObjectID;

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	var todo = new Todo({
		text: req.body.text
	});

	todo.save()
		.then((doc) => {
			res.send(doc);
		})
		.catch((err) => {
			res.status(400).send(err);
		});
});

app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({
			todos
		});
	}).catch((err) => {
		res.status(400).send(err);
	});
});

app.get('/todos/:id', (req, res) => {
	var id = req.params.id;
	
	if(ObjectID.isValid(id)) {
		Todo.findById(id)
			.then((todo) => {
				if(todo) {
					res.send({todo});
				} else {
					res.status(404).send({});
				}
			})
			.catch((e) => {
				res.status(400).send({});
			});
	} else {
		res.status(404).send({});
	}
});

app.listen(3000, () => {
	console.log('Server Started on Port 3000');
});

module.exports = {
	app
};