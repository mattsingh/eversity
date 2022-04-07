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
				// Store token in local storage
				localStorage.setItem('token', res.data.token);
				// Redirect to dashboard
				window.location.href = origin + '/dashboard';
			}
		})
		.catch(function (err) {
			console.log(err);
			alert(err.response.data.message);
		});
};
