let events = [];
const today = new Date();
let upcomingEvents = [];

// Create Event button was clicked
const createEventPage = function() {
    // Redirect to create RSO page
    window.location.href = origin + '/createEvent';
    // On that page, probably do some check here to make sure users can only create an event if their userId matches any rso's admin_id and the rso has been approved
};

// Load the current date
const loadDate = function() {
    // Select date element
    const date = document.getElementById(
        'date'
    );

    date.innerHTML = today.toDateString();
}

const setUpcomingEvents = function() {
    events.forEach((event) => {
        let eventDate = new Date(event.date);
        if (eventDate > today) upcomingEvents.push(event);
    });
    console.log('Upcoming Events');
    console.log(upcomingEvents);
};

// Load Events
const loadEvents = function() {
    // Select upcoming events container
    const upcomingEventsContainer = document.getElementById(
        'upcomingEventsContainer'
    );

    let htmlString = '';
    upcomingEvents.forEach((event) => {
        htmlString += `
            <a class="card eventCell bg-secondary">
                <div class="textContainer">
                    <h1 class="title">${event.name}</h1>
                    <h5 class="time">${new Date(event.date).toDateString()}</h5>
                    <h5 class="location">${event.location}</h5>
                    <p class="eventCellParagraph">${event.description}</p>
                </div>
            </a>
        `;
    });

    upcomingEventsContainer.innerHTML = htmlString;

    console.log('Rendered Events to DOM');
};


// Get all RSOs
const getEvents = async function() {
    // Load JWT from local storage
    const token = localStorage.getItem('token');
    await axios
        .get(origin + '/event/get', {
            headers: { Authorization: 'Bearer ' + token },
        })
        .then(function(res) {
            console.log(res);
            if (res.status === 200) {
                events = res.data;
            }
        })
        .catch(function(err) {
            console.log(err);
            alert(err.response.data.message);
        });
};

// On page load get events
document.addEventListener('DOMContentLoaded', async function() {
    await getEvents();
    setUpcomingEvents();
    loadEvents();
    loadDate();
});