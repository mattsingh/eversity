const origin = window.location.origin;

// Logout
const logout = function () {
	// Delete token in local storage
	localStorage.removeItem('token');
	// Redirect to home page
	window.location.href = origin + '/';
};

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};
