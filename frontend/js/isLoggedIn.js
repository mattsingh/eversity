// Redirect the user to the home page if there isn't a valid login token
if (localStorage.getItem('token') == null) {

    console.log("Redirecting back to home page due to lack of valid credentials");
    // Redirect to home page
    window.location.href = origin + '/';
}