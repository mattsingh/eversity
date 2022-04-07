const origin = window.location.origin;

// Login
const login = function () {
	axios
		.post(origin + '/auth/login', {
			email: document.getElementById('email').value,
			password: document.getElementById('password').value,
		})
		.then(function (res) {
			console.log(res);
			if (res.status === 200) {
				window.location.href = origin + '/dashboard';
			}
		})
		.catch(function (err) {
			console.log(err);
			alert(err.response.data.message);
		});
};
