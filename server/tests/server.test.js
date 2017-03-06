const expect = require('expect');
const request = require('supertest');
const app = require('./../server.js').app;
const Todo = require('./../models/todo.js').Todo;
const ObjectID = require('mongodb').ObjectID;

var todos = [{
	text: "todo 1",
	_id: new ObjectID()
}, {
	text: "todo 2",
	_id: new ObjectID()
}];

//Each time before any test case is run,
//it will wait until done() is invoked.
beforeEach((done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);
	}).then(() => {
		done();
	});
});

describe('POST /todos', () => {
	it('should create a new todo', (done)=>{
		var text = 'Test my app: POST /todos';

		request(app)
			.post('/todos')
			.send({text})
			.expect(200)
			.expect((res) => {
				expect(res.body.text).toBe(text);
			})
			.end((err, res) => {
				if(err) {
					return done(err);
				} else {
					Todo.find().then((todos) => {
						expect(todos.length).toBe(3);
						expect(todos[ 2 ].text).toBe(text);
						done();
					}).catch((e) => {done(e)});
				}
			});
	});
});

describe('GET /todos/:id', () => {
	it('should return todo doc', (done) => {
		request(app)
			.get(`/todos/${todos[ 0 ]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[ 0 ].text);
			})
			.end(done);
	});

	it('should return 404 if not found', (done) => {
		var hexId = new ObjectID().toHexString();
		request(app)
			.get(`/todos/${hexId}`)
			.expect(404)
			.expect((res) => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});