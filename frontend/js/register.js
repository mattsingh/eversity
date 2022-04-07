const origin = window.location.origin;

// Register
const register = function () {
	axios
		.post(origin + '/auth/register', {
			firstName: document.getElementById('firstName').value,
			lastName: document.getElementById('lastName').value,
			email: document.getElementById('email').value,
			password: document.getElementById('password').value,
			confirmPassword: document.getElementById('confirmPassword').value,
		})
		.then(function (res) {
			console.log(res);
			if (res.status === 200) {
				window.location.href = origin + '/login';
			}
		})
		.catch(function (err) {
			console.log(err);
			alert(err.response.data.message);
		});
}