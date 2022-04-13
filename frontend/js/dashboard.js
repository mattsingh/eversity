let events = [];
const today = new Date();
let recentEvents = [];
let upcomingEvents = [];
let jwt_contents = {};

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

const setRecentEvents = function() {
    events.forEach((event) => {
        let eventDate = new Date(event.date);
        if (eventDate < today) recentEvents.push(event);
    });
    console.log('Recent Events');
    console.log(recentEvents);
};

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
    // Select recent events container
    const recentEventsContainer = document.getElementById(
        'recentEventsContainer'
    );

    let htmlString = '';
    upcomingEvents.forEach((event) => {
        if (event.approved == true) {
            htmlString += `
            <div class="card eventCell bg-secondary">
                <img class="eventCellPicture" src="https://media.discordapp.net/attachments/958034245551534132/962500224394334249/unknown.png" alt="Event picture" />
                <h3 class="card-title">${event.name}</h6>
                <p class="card-text">${new Date(event.date).toDateString()}</p>
                <p class="eventCellParagraph">${event.description}</p>
            </div>
        `;
        }
    });

    upcomingEventsContainer.innerHTML = htmlString;

    htmlString = '';
    recentEvents.forEach((event) => {
        if (event.approved == true) {
            htmlString += `
			<div class="card eventCell bg-secondary">
				<img class="eventCellPicture" src="https://media.discordapp.net/attachments/958034245551534132/962500224394334249/unknown.png" alt="Event picture" />
				<h3 class="card-title">${event.name}</h6>
				<p class="card-text">${new Date(event.date).toDateString()}</p>
				<p class="eventCellParagraph">${event.description}</p>
			</div>
			`;
        }

    });

    recentEventsContainer.innerHTML = htmlString;
    console.log('Rendered Events to DOM');
};

// Get all events
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

// Load all upcoming events that are not approved
const loadPendingEvents = async function(auth_level) {

    // Get the pending event container
    const pendingEventsLocation = document.getElementById('pendingEvents');

    if (auth_level == 2) {
        console.log("Welcome, Super Admin");
        // Load pending events container
        let htmlString = `<h1>Pending Events</h1>
        <div id="pendingEventsContainer" class="card">`;

        upcomingEvents.forEach((event) => {
            if (event.approved == false) {
                htmlString += `<div class="card eventCell bg-secondary">
			<img class="eventCellPicture" src="https://media.discordapp.net/attachments/958034245551534132/962500224394334249/unknown.png" alt="Event picture" />
			<h3 class="card-title">${event.name}</h6>
			<h5 class="time">${new Date(event.date).toDateString()}</h5>
				<p class="eventCellParagraph">${event.description}</p>
				<button class="approveRSO" value="${event.id}" onclick="approveEvent(this.value)">Approve</button>
				<button class="denyRSO" value="${event.id}" onclick="denyEvent(this.value)">Deny</button>
		</div>
		`;
            }
        });
        // Close the container at the end
        htmlString += '</div>';

        pendingEventsLocation.innerHTML = htmlString;
        console.log('Rendered Pending Events to DOM for Super Admin');
    }
}


const approveEvent = function(eventId) {
    // Load JWT from local storage
    const token = localStorage.getItem('token');

    //console.log("Approving ID = " + eventId);
    axios
        .post(origin + '/event/approve', {
            eventToApproveID: eventId,
        }, {
            headers: { Authorization: 'Bearer ' + token },
        })
        .then(function(res) {
            console.log(res);
            if (res.status === 200) {
                // Redirect to dashboard (basically reloading)
                window.location.href = origin + '/dashboard';
            }
        })
        .catch(function(err) {
            console.log(err);
            alert(err.response.data.message);
        });
};


const denyEvent = function(eventId) {
    // Load JWT from local storage
    const token = localStorage.getItem('token');

    //console.log("ID = " + eventId);
    axios
        .post(origin + '/event/deny', {
            eventToDeleteID: eventId,
        }, {
            headers: { Authorization: 'Bearer ' + token },
        })
        .then(function(res) {
            console.log(res);
            if (res.status === 200) {
                // Redirect to dashboard (basically reloading)
                window.location.href = origin + '/dashboard';
            }
        })
        .catch(function(err) {
            console.log(err);
            alert(err.response.data.message);
        });
};

// On page load get events
document.addEventListener('DOMContentLoaded', async function() {
    // TODO: Redirect to login if no token
    await getEvents();
    setRecentEvents();
    setUpcomingEvents();
    loadEvents();

    // Load JWT from local storage
    const token = localStorage.getItem('token');
    jwt_contents = parseJwt(token);
    loadPendingEvents(jwt_contents.auth_level);
});