const origin = window.location.origin;

// Redirect the user to the home page if there isn't a valid login token
if (localStorage.getItem('token') == null) {

    console.log("Redirecting back to home page due to lack of valid credentials");
    // Redirect to home page
    window.location.href = origin + '/';
}


// Logout
const logout = function() {
    // Delete token in local storage
    localStorage.removeItem("token");
    // Redirect to home page
    window.location.href = origin + '/';
};