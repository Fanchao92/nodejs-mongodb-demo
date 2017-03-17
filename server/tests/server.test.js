const expect = require('expect');
const request = require('supertest');
const app = require('./../server.js').app;
const Todo = require('./../models/todo.js').Todo;
const ObjectID = require('mongodb').ObjectID;
const todos = require('./seed/seed.js').todos;
const populateTodos = require('./seed/seed.js').populateTodos;
const users = require('./seed/seed.js').users;
const populateUsers = require('./seed/seed.js').populateUsers;
const User = require('./../models/user.js').User;

//Each time before any test case is run,
//it will wait until done() is invoked.
beforeEach(populateTodos);
beforeEach(populateUsers);

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

describe('DELETE /todos', () => {
	it('should delete the todo doc', (done) => {
		var id = todos[ 0 ]._id.toHexString();

		request(app)
			.delete('/todos/'+id)
			.expect(200)
			.expect((res) => {
				expect(res.body._id).toBe(id);
			})
			.end((err, res) => {
				if(err) {
					done(err);
				} else {
					Todo.findById(id).then((doc) => {
						expect(doc).toNotExist();
						done();
					}).catch((err) => {
						done(err);
					});
				}
			});
	});

	it('should return 404 when not found', (done) => {
		request(app)
			.delete('/todos/'+(new ObjectID().toHexString()))
			.expect(404)
			.expect((res) => {
				expect(res.body).toEqual({});
			})
			.end(() => {
				done();
			});
	});
});

describe('GET /users/me', () => {
	it('should return user if authenticated', (done) => {
		request(app)
			.get('/users/me')
			.set('x-auth', users[ 0 ].tokens[ 0 ].token)
			.expect(200)
			.expect((res) => {
				expect(res.body._id).toBe(users[ 0 ]._id.toHexString());
				expect(res.body.email).toBe(users[ 0 ].email);
			})
			.end(done);
	});

	it('should return a 401 if not authenticated', (done) => {
		request(app)
			.get('/users/me')
			.expect(401)
			.expect((res) => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});

describe('POST /users', () => {
	it('should create a user', (done) => {
		var email = "user3@gmail.com";
		var password = 'user3pswd';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(200)
			.expect((res) => {
				expect(res.headers[ 'x-auth' ]).toExist();
				expect(res.body._id).toExist();
				expect(res.body.email).toBe(email);
			})
			.end((err) => {
				if(err) {
					return done(err);
				} else {
					User.findOne({email}).then((user) => {
						expect(user).toExist();
						expect(user.password).toNotBe(password);
						done();
					}).catch((err) => {
						done(err);
					});
				}
			});
	});

	it('should return validation errors if request fails', (done) => {
		request(app)
			.post('/users')
			.send({email: users[ 0 ].email, password: users[ 1 ].password})
			.expect(400)
			.end(done);
	});

	it('should not create user if email in use', (done) => {
		request(app)
			.post('/users')
			.send({email: users[ 0 ].email, password: 'user1pswd'})
			.expect(400)
			.end(done);
	});
});

describe('POST /users/login', () => {
	it('should login user and return auth token', (done) => {
		request(app)
			.post('/users/login')
			.send({
				email: users[ 1 ].email,
				password: users[ 1 ].password
			})
			.expect(200)
			.expect((res) => {
				expect(res.header['x-auth']).toExist();
			})
			.end((err, res) => {
				if(err) {
					return done(err);
				} else {
					User.findById(users[ 1 ]._id)
						.then((user) => {
							expect(user.tokens[ 0 ].access).toEqual('auth');
							expect(user.tokens[ 0 ].token).toEqual(res.headers[ 'x-auth' ]);
							done();
						})
						.catch((e) => {
							done(e);
						});
				}
			});
	});

	it('should reject invalid login', (done) => {
		request(app)
			.post('/users/login')
			.send({
				email: users[ 1 ].email,
				password: users[ 1 ].password+' invalid'
			})
			.expect(400)
			.expect((res) => {
				expect(res.header['x-auth']).toNotExist();
			})
			.end((err, res) => {
				if(err) {
					return done(err);
				} else {
					User.findById(users[ 1 ]._id)
						.then((user) => {
							expect(user.tokens.length).toEqual(0);
							done();
						})
						.catch((e) => {
							done(e);
						});
				}
			});
	});
});

describe('DELETE users/me/token', () => {
	it("should delete a user's token", (done) => {
		request(app)
			.delete('/users/me/token')
			.set('x-auth', users[ 0 ].tokens[ 0 ].token)
			.send()
			.expect(200)
			.end((err, res) => {
				if(err) {
					return done(err);
				} else {
					User.findOne({
						_id: users[ 0 ]._id.toHexString(),
						"tokens.token": users[ 0 ].tokens[ 0 ].token,
						'tokens.access': 'auth'
					})
					.then((user) => {
						expect(user).toNotExist();
						done();
					})
					.catch((err) => {
						done(err);
					});
				}
			});
	});
});