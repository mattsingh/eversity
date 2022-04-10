const origin = window.location.origin;

// Logout
const logout = function() {
    // Delete token in local storage
    localStorage.removeItem("token");
    // Redirect to home page
    window.location.href = origin + '/';
};