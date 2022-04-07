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

	// Create event
	app.post('/event/create', authenticateToken, async (req, res) => {
		const {
			name,
			date,
			contactPhone,
			contactEmail,
			rsoId,
			location,
			description,
			type,
		} = req.body;

		// Check if all fields are filled
		if (
			!name ||
			!date ||
			!contactPhone ||
			!contactEmail ||
			!location ||
			!description ||
			!(type >= 0 && type <= 2)
		) {
			return res
				.status(400)
				.json({ message: 'All fields are required (except RSO ID)' });
		}

		// Check if user is an admin
		if (req.user.auth_level < 1) {
			return res.status(403).json({
				message: 'You do not have permission to create events',
			});
		}

		// Check if RSO exists
		if (type === 2) {
			const rso = await db.query('SELECT * FROM rso WHERE id = $1', [
				rsoId,
			]);
			if (rso.rows.length === 0) {
				return res.status(400).json({ message: 'RSO does not exist' });
			}
		}

		// Create event
		let result = await db.query(
			'INSERT INTO events (name, date, contact_phone, contact_email, rso_id, location, description, type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
			[
				name,
				date,
				contactPhone,
				contactEmail,
				rsoId ? rsoId : null,
				'(' + location.lat + ', ' + location.lng + ')',
				description,
				type,
			]
		);
		
		if (result.rowCount === 0) {
			return res.status(400).json({ message: 'Event could not be created' });
		}

		res.status(200).json({ message: 'Event created' });
	});

	// Get events
	app.get('/event/get', authenticateToken, async (req, res) => {
		const type = req.query.type;
		const id = req.query.id;

		// TODO: Only show events user has access to
		// (i.e. show private events if user is in a university or show RSO events if user is in an RSO)

		// Return event with id
		if (id) {
			const event = await db.query('SELECT * FROM events WHERE id = $1', [id]);
			if (event.rows.length === 0) {
				return res.status(400).json({ message: 'Event does not exist' });
			}
			return res.status(200).json(event.rows[0]);
		}
		
		// Return events of type
		if (type || type === 0) {
			const events = await db.query('select * from events where type = $1', [type]);
			return res.status(200).json(events.rows);
		}

		// Return all events
		let result = await db.query(
			'SELECT * FROM events ORDER BY date DESC'
		);
		res.status(200).json(result.rows);
	});
};
