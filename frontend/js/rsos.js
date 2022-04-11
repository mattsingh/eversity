const origin = window.location.origin;

// Logout
const logout = function() {
    // Delete token in local storage
    localStorage.removeItem('token');
    // Redirect to home page
    window.location.href = origin + '/';
};

// Create RSO button was clicked
const createRSO = function() {
    // probably do some check here to make sure users can only create rso if admin

    // Redirect to create RSO page
    window.location.href = origin + '/createRSO';
};