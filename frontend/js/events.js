const origin = window.location.origin;
let events = [];
const today = new Date();
let recentEvents = [];
let upcomingEvents = [];

// Logout
const logout = function() {
    // Delete token in local storage
    localStorage.removeItem('token');
    // Redirect to home page
    window.location.href = origin + '/';
};