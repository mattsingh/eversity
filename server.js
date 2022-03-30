const express = require('express');
const path = require('path');
const { Client } = require('pg');
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

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(
	'/js',
	express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'))
);

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, '/pages/index.html'));
});

app.listen(port);
console.log('Server started at http://localhost:' + port);
