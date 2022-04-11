const origin = window.location.origin;
let events = [];
const today = new Date();
let recentEvents = [];
let upcomingEvents = [];

// Logout
const logout = function () {
	// Delete token in local storage
	localStorage.removeItem('token');
	// Redirect to home page
	window.location.href = origin + '/';
};

const setRecentEvents = function () {
	events.forEach((event) => {
		let eventDate = new Date(event.date);
		if (eventDate < today) recentEvents.push(event);
	});
	console.log('Recent Events');
	console.log(recentEvents);
};

const setUpcomingEvents = function () {
	events.forEach((event) => {
		let eventDate = new Date(event.date);
		if (eventDate > today) upcomingEvents.push(event);
	});
	console.log('Upcoming Events');
	console.log(upcomingEvents);
};

// Load Events
const loadEvents = function () {
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
		htmlString += `
            <div class="card eventCell bg-secondary">
                <img class="eventCellPicture" src="https://media.discordapp.net/attachments/958034245551534132/962500224394334249/unknown.png" alt="Event picture" />
                <h3 class="card-title">${event.name}</h6>
                <p class="card-text">${new Date(event.date).toDateString()}</p>
                <p class="eventCellParagraph">${event.description}</p>
            </div>
        `;
	});

	upcomingEventsContainer.innerHTML = htmlString;

	htmlString = '';
	recentEvents.forEach((event) => {
		htmlString += `
        <div class="card eventCell bg-secondary">
            <img class="eventCellPicture" src="https://media.discordapp.net/attachments/958034245551534132/962500224394334249/unknown.png" alt="Event picture" />
            <h3 class="card-title">${event.name}</h6>
            <p class="card-text">${new Date(event.date).toDateString()}</p>
            <p class="eventCellParagraph">${event.description}</p>
        </div>
        `;
	});

	recentEventsContainer.innerHTML = htmlString;
	console.log('Rendered Events to DOM');
};

// Get all events
const getEvents = async function () {
	// Load JWT from local storage
	const token = localStorage.getItem('token');
	await axios
		.get(origin + '/event/get', {
			headers: { Authorization: 'Bearer ' + token },
		})
		.then(function (res) {
			console.log(res);
			if (res.status === 200) {
				events = res.data;
			}
		})
		.catch(function (err) {
			console.log(err);
			alert(err.response.data.message);
		});
};

// On page load get events
document.addEventListener('DOMContentLoaded', async function () {
    // TODO: Redirect to login if no token
	await getEvents();
	setRecentEvents();
	setUpcomingEvents();
	loadEvents();
});
