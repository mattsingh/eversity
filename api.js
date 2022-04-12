const {
	generateAccessToken,
	decodeAccessToken,
	authenticateToken,
} = require('./jwt');
const axios = require('axios');
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
			return res
				.status(400)
				.json({ message: 'Event could not be created' });
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
			const event = await db.query('SELECT * FROM events WHERE id = $1', [
				id,
			]);
			if (event.rows.length === 0) {
				return res
					.status(400)
					.json({ message: 'Event does not exist' });
			}
			return res.status(200).json(event.rows[0]);
		}

		// Return events of type
		if (type || type === 0) {
			const events = await db.query(
				'select * from events where type = $1',
				[type]
			);
			return res.status(200).json(events.rows);
		}

		// Return all events
		let result = await db.query('SELECT * FROM events ORDER BY date DESC');
		res.status(200).json(result.rows);
	});

	// Create RSO
	app.post('/rso/create', authenticateToken, async (req, res) => {
		const { name, description } = req.body;

		// Check if all fields are filled
		if (!name || !description) {
			return res.status(400).json({ message: 'All fields are required' });
		}

		// Check if user is an admin
		if (req.user.auth_level < 1) {
			return res.status(403).json({
				message: 'You do not have permission to create RSOs',
			});
		}

		// Create RSO
		let result = await db.query(
			'INSERT INTO rsos (name, description, university_id, admin_id) VALUES ($1, $2, $3, $4)',
			[name, description, req.user.university_id, req.user.user_id]
		);
		if (result.rowCount === 0) {
			return res
				.status(400)
				.json({ message: 'RSO could not be created' });
		}
		res.status(200).json({ message: 'RSO created' });
	});

	// Get RSOs
	app.get('/rso/get', authenticateToken, async (req, res) => {
		const id = req.query.id;

		// Return RSO from university with id
		if (id) {
			const rso = await db.query(
				'SELECT * FROM RSO WHERE id = $1 AND university_id = $1',
				[id, req.user.university_id]
			);
			if (rso.rows.length === 0) {
				return res.status(400).json({ message: 'RSO does not exist' });
			}
			return res.status(200).json(rso.rows[0]);
		}

		// Return all RSOs
		let result = await db.query(
			'SELECT * FROM rsos where university_id = $1',
			[req.user.university_id]
		);
		res.status(200).json(result.rows);
	});

	// Post comment
	app.post('/comments/create', authenticateToken, async (req, res) => {
		const { eventId, text, rating } = req.body;

		// Check if all fields are filled
		if (!eventId || !text || !rating) {
			return res.status(400).json({ message: 'All fields are required' });
		}

		// Check if rating is between 1 and 5
		if (rating < 1 || rating > 5) {
			return res
				.status(400)
				.json({ message: 'Rating must be between 1 and 5' });
		}

		// Create comment
		let result = await db.query(
			'INSERT INTO comments (event_id, user_id, text, rating) VALUES ($1, $2, $3, $4)',
			[eventId, req.user.user_id, text, rating]
		);
		if (result.rowCount === 0) {
			return res
				.status(400)
				.json({ message: 'Comment could not be created' });
		}
		res.status(200).json({ message: 'Comment created' });
	});

	// Get comments
	app.get('/comments/get', authenticateToken, async (req, res) => {
		const eventId = req.query.eventId;

		// Return comments for event with id
		if (eventId) {
			const comments = await db.query(
				'SELECT comments.id, comments.text, comments.rating, comments.created_at,users.name FROM comments INNER JOIN users ON comments.user_id = users.id WHERE comments.event_id = $1', 
				[eventId]
			);
			if (comments.rows.length === 0) {
				return res.status(400).json({ message: 'No comments' });
			}
			
			// Get rating average
			let avg_result = await db.query(
				'SELECT AVG(rating) FROM comments where event_id = $1',
				[eventId]
			);

			res.status(200).json({
				average: avg_result.rows[0].avg,
				comments: comments.rows,
			});
		}
	});

	// Locate
	app.get('/locate', authenticateToken, async (req, res) => {
		const { lat, lon } = req.query;

		// Check if all fields are filled
		if (!lat || !lon) {
			return res.status(400).json({ message: 'All fields are required' });
		}

		const result = await getLocationString(lat, lon);
		console.log(result);
		res.status(200).json(result);
	});
};


// Get location string
async function getLocationString(lat, lon) {
	const result = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat},${lon}&key=${process.env.GEOCODING_API_KEY}`);
	return result.data.results[0].formatted;
}