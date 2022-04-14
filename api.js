const {
    generateAccessToken,
    decodeAccessToken,
    authenticateToken,
} = require('./jwt');
const axios = require('axios');
const bcrypt = require('bcrypt');
const { user } = require('pg/lib/defaults');
const saltRounds = 10;

exports.setApp = function(app, db) {
    app.post('/auth/register', async(req, res) => {
        const { firstName, lastName, email, password, confirmPassword } =
        req.body;

        // Check if all fields are filled
        if (!firstName ||
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
            'select id from universities where domain like $1', [domain]
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
            'INSERT INTO users (name, email, password, university_id) VALUES ($1, $2, $3, $4)', [firstName + ' ' + lastName, email, hashedPassword, universityId]
        );
        res.status(200).json({ message: 'User created' });
    });

    app.post('/auth/login', async(req, res) => {
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
    app.post('/event/create', authenticateToken, async(req, res) => {
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
        if (!name ||
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
            'INSERT INTO events (name, date, contact_phone, contact_email, rso_id, location, description, type, creator_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [
                name,
                date,
                contactPhone,
                contactEmail,
                rsoId ? rsoId : null,
                '(' + location.lat + ', ' + location.lng + ')',
                description,
                type,
                req.user.user_id,
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
    app.get('/event/get', authenticateToken, async(req, res) => {
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
                'select * from events where type = $1', [type]
            );
            return res.status(200).json(events.rows);
        }

        // Return all events
        let result = await db.query('SELECT * FROM events ORDER BY date DESC');
        res.status(200).json(result.rows);
    });

    // Approve an Event
    app.post('/event/approve', authenticateToken, async(req, res) => {

        const { eventToApproveID } = req.body;
        //console.log(eventToApproveID);

        // Update Event approved column with matching id
        let result = await db.query('UPDATE events SET approved = $1 WHERE id = $2', [true, eventToApproveID]);

        console.log("Successfully approved event with id: " + eventToApproveID);

        res.status(200).json(result.rows);
    });

    // Delete an Event
    app.post('/event/deny', authenticateToken, async(req, res) => {

        const { eventToDeleteID } = req.body;

        // Delete Event with matching id
        let result = await db.query('DELETE FROM events WHERE id = $1', [eventToDeleteID]);

        console.log("Successfully denied/removed event with id: " + req.body);

        res.status(200).json(result.rows);
    });

    // Create RSO
    app.post('/rso/create', authenticateToken, async(req, res) => {
        const { name, description } = req.body;

        // Check if all fields are filled
        if (!name || !description) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Not necessary
        // Check if user is an admin
        //if (req.user.auth_level < 1) {
        //    return res.status(403).json({
        //        message: 'You do not have permission to create RSOs',
        //    });
        //}

        // Create RSO
        let result = await db.query(
            'INSERT INTO rsos (name, description, university_id, admin_id) VALUES ($1, $2, $3, $4)', [name, description, req.user.university_id, req.user.user_id]
        );

        if (result.rowCount === 0) {
            return res
                .status(400)
                .json({ message: 'RSO could not be created' });
        } else {
            const newRSO = await db.query('SELECT * FROM rsos WHERE name = $1 AND description = $2', [
                name, description,
            ]);

            //console.log(newRSO.rows[0].id);

            // Add to member_of table
            let memberResult = await db.query(
                'INSERT INTO member_of (user_id, rso_id) VALUES ($1, $2)', [req.user.user_id, newRSO.rows[0].id]
            );

            if (memberResult.rowCount === 0) {
                return res
                    .status(400)
                    .json({ message: 'member_of entry could not be created' });
            }

        }
        res.status(200).json({ message: 'RSO created' });
    });

    // Join RSO
    app.post('/rso/join', authenticateToken, async(req, res) => {
        const { rsoId } = req.body;

        // Add to member_of table
        let memberResult = await db.query(
            'INSERT INTO member_of (user_id, rso_id) VALUES ($1, $2)', [req.user.user_id, rsoId]
        );

        if (memberResult.rowCount === 0) {
            return res
                .status(400)
                .json({ message: 'member_of entry could not be created' });
        }

        // Now we check the amount of rows of members with this rsoID

        let allMembers = await db.query(
            'SELECT * FROM member_of WHERE rso_id = $1', [rsoId]
        );

        if (allMembers.rows.length >= 5) //REMINDER to change this to 5
        {

            // Change the rso approved column to true
            let result = await db.query('UPDATE rsos SET approved = $1 WHERE id = $2', [true, rsoId]);

            /* Need authorization to change these
            // Get the admin_id of the rso with the rsoId
            let tempRSO = await db.query(
                'SELECT * FROM rsos WHERE rso_id = $1', [rsoId]
            );

            let adminID = tempRSO[0].admin_id;

            // Change the auth_level of the user with admin_id to 1
            let userResult = await db.query('UPDATE users SET auth_level = $1 WHERE id = $2', [1, adminID]);
            */
        }

        res.status(200).json({ message: 'Successfully joined an RSO' });
    });

    // Leave RSO
    app.post('/rso/leave', authenticateToken, async(req, res) => {
        const { rsoId } = req.body;

        // Add to member_of table
        let memberResult = await db.query(
            'DELETE FROM member_of WHERE user_id = $1 AND rso_id = $2', [req.user.user_id, rsoId]
        );

        // Now we check the amount of rows of members with this rsoID

        let allMembers = await db.query(
            'SELECT * FROM member_of WHERE rso_id = $1', [rsoId]
        );

        if (allMembers.rows.length < 5) //REMINDER to change this to 5
        {
            // Change the rso approved column to true
            let result = await db.query('UPDATE rsos SET approved = $1 WHERE id = $2', [false, rsoId]);

            /* Need authorization to change these
            // Get the admin_id of the rso with the rsoId
            let tempRSO = await db.query(
                'SELECT * FROM rsos WHERE rso_id = $1', [rsoId]
            );

            let adminID = tempRSO[0].admin_id;

            // Change the auth_level of the user with admin_id to 0
            let userResult = await db.query('UPDATE users SET auth_level = $1 WHERE id = $2', [0, adminID]);
            */
        }

        res.status(200).json({ message: 'Successfully left an RSO' });
    });

    // Check if in an RSO
    app.get('/rso/isMember', authenticateToken, async(req, res) => {
        const rsoId = req.query.rsoId;
        // Check member_of table
        const result = await db.query(
            'SELECT * FROM member_of WHERE user_id = $1 AND rso_id = $2', [req.user.user_id, rsoId]
        );
        //console.log(result.rows.length);
        let isMember = false;
        if (result.rows.length != 0) {
            isMember = true;
        }

        res.status(200).json({ isMember });
    });

    // Check if is the admin for an RSO
    app.get('/rso/isAdminForThisRSO', authenticateToken, async(req, res) => {
        const rsoId = req.query.rsoId;

        // Check member_of table
        const result = await db.query(
            'SELECT * FROM rsos WHERE id = $1 AND admin_id = $2', [rsoId, req.user.user_id]
        );
        //console.log(result.rows.length);
        let isAdminForThisRSO = false;
        if (result.rows.length != 0) {
            isAdminForThisRSO = true;
        }

        res.status(200).json({ isAdminForThisRSO });
    });

    // Check if is the admin for an RSO
    app.get('/rso/isAdminForAnyRSO', authenticateToken, async(req, res) => {

        // Check member_of table
        const result = await db.query(
            'SELECT * FROM rsos WHERE admin_id = $1', [req.user.user_id]
        );
        //console.log(result.rows.length);
        let isAdminForAnyRSO = false;
        if (result.rows.length != 0) {
            isAdminForAnyRSO = true;
        }

        res.status(200).json({ isAdminForAnyRSO });
    });

    // Get RSOs
    app.get('/rso/get', authenticateToken, async(req, res) => {
        const id = req.query.id;

        // Return RSO from university with id
        if (id) {
            const rso = await db.query(
                'SELECT * FROM RSO WHERE id = $1 AND university_id = $1', [id, req.user.university_id]
            );
            if (rso.rows.length === 0) {
                return res.status(400).json({ message: 'RSO does not exist' });
            }
            return res.status(200).json(rso.rows[0]);
        }

        // Return all RSOs
        let result = await db.query(
            'SELECT * FROM rsos where university_id = $1', [req.user.university_id]
        );
        res.status(200).json(result.rows);
    });

    // Post comment
    app.post('/comments/create', authenticateToken, async(req, res) => {
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
            'INSERT INTO comments (event_id, user_id, text, rating) VALUES ($1, $2, $3, $4)', [eventId, req.user.user_id, text, rating]
        );
        if (result.rowCount === 0) {
            return res
                .status(400)
                .json({ message: 'Comment could not be created' });
        }
        res.status(200).json({ message: 'Comment created' });
    });

    // Get comments
    app.get('/comments/get', authenticateToken, async(req, res) => {
        const eventId = req.query.eventId;

        // Return comments for event with id
        if (eventId) {
            const comments = await db.query(
                'SELECT comments.id, comments.text, comments.rating, comments.created_at, users.name, users.id as user_id FROM comments INNER JOIN users ON comments.user_id = users.id WHERE comments.event_id = $1', [eventId]
            );
            if (comments.rows.length === 0) {
                return res.status(200).json({ message: 'No comments' });
            }

            // Get rating average
            let avg_result = await db.query(
                'SELECT AVG(rating) FROM comments where event_id = $1', [eventId]
            );

            res.status(200).json({
                average: avg_result.rows[0].avg,
                comments: comments.rows,
            });
        }
    });

    // Delete comment
    app.delete('/comments/delete/:id', authenticateToken, async(req, res) => {
        const commentId = req.params.id;

        // Check if all fields are filled
        if (!commentId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // If user is an admin or the comment author, delete comment
        if (req.user.auth_level < 1) {
            let result = await db.query(
                'SELECT * FROM comments WHERE id = $1 AND user_id = $2', [commentId, req.user.user_id]
            );
            if (result.rows.length === 0) {
                return res.status(400).json({ message: 'You are not authorized to delete this comment' });
            }
        }

        // Delete comment
        result = await db.query(
            'DELETE FROM comments WHERE id = $1', [commentId]
        );
        if (result.rowCount === 0) {
            return res
                .status(400)
                .json({ message: 'Comment could not be deleted' });
        }
        res.status(200).json({ message: 'Comment deleted' });
    });

    // Locate
    app.get('/locate', authenticateToken, async(req, res) => {
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