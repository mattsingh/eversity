const express = require('express');
const path = require('path');
const { Client } = require('pg');
const api = require('./api');
const bodyParser = require('body-parser');
require('dotenv').config();

const db = new Client({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

db.connect();
console.log('Connected to Heroku Postgres Database');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('frontend'));

app.use(
	'/js',
	express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'))
);

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, 'frontend/pages/index.html'));
});

app.get('/login', function (req, res) {
	res.sendFile(path.join(__dirname, 'frontend/pages/login.html'));
});

app.get('/register', function (req, res) {
	res.sendFile(path.join(__dirname, 'frontend/pages/register.html'));
});

app.get('/dashboard', function (req, res) {
    res.sendFile(path.join(__dirname, 'frontend/pages/dashboard.html'));
});

app.use(bodyParser.json());
api.setApp(app, db);

app.listen(port);
console.log('Server started at http://localhost:' + port);
