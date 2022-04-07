const jwt = require('jsonwebtoken');

exports.generateAccessToken = function (user_id, university_id, auth_level) {
	return jwt.sign(
		{ user_id, university_id, auth_level },
		process.env.TOKEN_SECRET
	);
};

exports.decodeAccessToken = function (token) {
	return jwt.decode(token, process.env.TOKEN_SECRET);
};

exports.authenticateToken = function (req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) return res.sendStatus(401);

	jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
		if (err) return res.status(403).json({ message: 'Forbidden; Invalid JWT' });

		req.user = user;

		next();
	});
};
