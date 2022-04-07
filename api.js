const {
	generateAccessToken,
	decodeAccessToken,
	authenticateToken,
} = require('./jwt');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.setApp = function (app, db) {
	app.post('/auth/register', async (req, res) => {
		const { firstName, lastName, email, password, confirmPassword } =
			req.body;

		// Check if all fields are filled
		if (
			!firstName ||
			!lastName ||
			!email ||
			!password ||
			!confirmPassword
		) {
			return res.status(400).json({ message: 'All fields are required' });
		}

		// Check if password and confirm password match
		if (password !== confirmPassword) {
			return res.status(400).json({ message: 'Passwords do not match' });
		}

		// Check if user already exists
		const user = await db.query('SELECT * FROM users WHERE email = $1', [
			email,
		]);
		if (user.rows.length > 0) {
			return res.status(400).json({ message: 'User already exists' });
		}

		const domain = email.split('@')[1];

		// Get university id
		let uniResult = await db.query(
			'select id from universities where domain like $1',
			[domain]
		);

		// Check if university exists
		if (uniResult.rows.length === 0) {
			return res.status(400).json({ message: 'Invalid email' });
		}

		const universityId = uniResult.rows[0].id;

		// Hash password
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Create user
		let result = await db.query(
			'INSERT INTO users (name, email, password, university_id) VALUES ($1, $2, $3, $4)',
			[firstName + ' ' + lastName, email, hashedPassword, universityId]
		);
		res.status(200).json({ message: 'User created' });
	});

	app.post('/auth/login', async (req, res) => {
		const { email, password } = req.body;

		// Check if all fields are filled
		if (!email || !password) {
			return res.status(400).json({ message: 'All fields are required' });
		}

		// Check if user exists
		const user = await db.query('SELECT * FROM users WHERE email = $1', [
			email,
		]);
		if (user.rows.length === 0) {
			return res.status(400).json({ message: 'User does not exist' });
		}

		// Check if password is correct
		const correctPassword = await bcrypt.compare(
			password,
			user.rows[0].password
		);
		if (!correctPassword) {
			return res.status(400).json({ message: 'Incorrect password' });
		}

		// Create token
		const token = generateAccessToken(
			user.rows[0].id,
			user.rows[0].university_id,
			user.rows[0].auth_level
		);

		res.status(200).json({ token });
	});
};
