const expect = require('expect');
const request = require('supertest');
const app = require('./../server.js').app;
const Todo = require('./../models/todo.js').Todo;

//Each time before any test case is run,
//it will wait until done() is invoked.
beforeEach((done) => {
	Todo.remove({}).then(() => {
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
						expect(todos.length).toBe(1);
						expect(todos[ 0 ].text).toBe(text);
						done();
					}).catch((e) => {done(e)});
				}
			});
	});
});