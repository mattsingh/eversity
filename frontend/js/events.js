let events = [];
const today = new Date();
let recentEvents = [];
let upcomingEvents = [];

// Create Event button was clicked
const createEventPage = function() {
    // Redirect to create RSO page
    window.location.href = origin + '/createEvent';
    // On that page, probably do some check here to make sure users can only create an event if their userId matches any rso's admin_id and the rso has been approved
};