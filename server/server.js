var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('./db/mongoose.js').mongoose;
var Todo = require('./models/todo.js').Todo;
var User = require('./models/user.js').User;
var ObjectID = require('mongodb').ObjectID;

var app = express();
var port = process.env.PORT || 3000;

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

app.delete('/todos/:id', (req, res) => {
	var id = req.params.id;

	if(ObjectID.isValid(id)) {
		Todo.findByIdAndRemove(id)
			.then((doc) => {
				if(doc) {
					res.send(doc);
				} else {
					res.status(404).send({});
				}
			})
			.catch((e) => {
				res.status(404).send({});
			});
	} else {
		res.status(404).send({});
	}
});

app.patch('/todos/:id', (req, res) => {
	var id = req.params.id;
	var body = _.pick(req.body, ['text', 'completed']);

	if(!ObjectID.isValid(id)) {
		res.status(404).send({});
	} else {
		if(_.isBoolean(body.completed) && body.completed) {
			body.completedAt = new Date().getTime();
		} else {
			body.completed = false;
			body.completedAt = null;
		}

		Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
			.then((todo) => {
				if(!todo) {
					res.status(404).send({});
				} else {
					res.send(todo);
				}
			})
			.catch((e) => {
				res.status(404).send({});
			});
	}
});

app.listen(port, () => {
	console.log(`Server Started on Port ${port}`);
});

module.exports = {
	app
};