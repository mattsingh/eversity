let events = [];
const today = new Date();
let upcomingEvents = [];
// Get token
const token = localStorage.getItem('token');

// Create Event button was clicked
const createEventPage = function() {
    // Redirect to create RSO page
    window.location.href = origin + '/createEvent';
    // On that page, probably do some check here to make sure users can only create an event if their userId matches any rso's admin_id and the rso has been approved
};

// Scrapping this - sorry :(
// Load the current date
// const loadDate = function () {
// 	// Select date element
// 	const date = document.getElementById('date');

// 	date.innerHTML = today.toDateString();
// };

const setUpcomingEvents = function() {
    events.forEach((event) => {
        let eventDate = new Date(event.date);
        if (eventDate > today) upcomingEvents.push(event);
    });
    // Reverse array
    upcomingEvents.reverse();
    console.log('Upcoming Events');
    console.log(upcomingEvents);
};

// Get location string
async function getLocationString() {
    // Load JWT from local storage
    const token = localStorage.getItem('token');

    // Get location
    const result = await axios.get(origin + '/locate', {
        headers: { Authorization: 'Bearer ' + token },
        params: { lat: event_info.location.x, lon: event_info.location.y },
    });
    const location = result.data;
    return location;
}

// Load Events
const loadEvents = async function() {
    // Select upcoming events container
    const upcomingEventsContainer = document.getElementById(
        'upcomingEventsContainer'
    );

    let htmlString = '';
    for (const event of upcomingEvents) {
        if (event.approved == true) {
            // Get location
            const loc = await getLocationString(event.location);

            htmlString += `
            <a class="card eventCell bg-secondary" onclick="location.pathname = ${'\'/events/\' + ' + event.id}" type="button" >
                <div class="textContainer">
                    <h1 class="title">${event.name}</h1>
                    <h5 class="time">${new Date(event.date).toDateString()}</h5>
                    <h5 class="location"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt" viewBox="0 0 16 16">
                    <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
                    <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                  </svg>
                  ${loc}</h5>
                    <p class="eventCellParagraph">${event.description}</p>
                </div>
            </a>
        `;
        }
    };

    upcomingEventsContainer.innerHTML = htmlString;

    console.log('Rendered Events to DOM');
};

// Get location string
async function getLocationString(location) {
    // Load JWT from local storage
    const token = localStorage.getItem('token');

    // Get location
    const result = await axios.get(origin + '/locate', {
        headers: { Authorization: 'Bearer ' + token },
        params: { lat: location.x, lon: location.y },
    });
    const res = result.data;
    return res;
}

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

// Get if is admin of any RSO
async function isAdmin() {
    //console.log(tempRSOID);
    // Load JWT from local storage
    const token = localStorage.getItem('token');
    let value = false;
    await axios
        .get(origin + '/rso/isAdminForAnyRSO', {
            headers: { Authorization: 'Bearer ' + token },
        })
        .then(function(res) {
            console.log(res);
            if (res.status === 200) {
                //console.log(res.data.isAdminForAnyRSO);
                value = res.data.isAdminForAnyRSO;
            }
        })
        .catch(function(err) {
            console.log(err);
            alert(err.response.data.message);
        });

    //console.log(value);
    return value;
}

// Load the create event button if the user is admin
const loadButton = async function() {
    // Check if they are an admin for any rso
    const isAdminOfSomeRSO = await isAdmin();
    //console.log(isAdminOfSomeRSO);
    if (isAdminOfSomeRSO == true) {
        const buttonContainer = document.getElementById(
            'buttonContainer'
        );

        buttonContainer.innerHTML = `<button type="button" class="createEvent" onclick="createEventPage()">Create Event</button>`;
    }
}

// On page load get events
document.addEventListener('DOMContentLoaded', async function() {
    loadButton();
    await getEvents();
    setUpcomingEvents();
    loadEvents().then(() => {
            console.log('Your event feed has been successfully loaded')
        })
        .catch(e => console.log('loadEvents', e));
    // loadDate();
});