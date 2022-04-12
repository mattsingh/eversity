const event_id = window.location.href.split('/')[4];

let event_info = {};
let comments = [];
let avg_rating = null;

// Get event info
async function getEventInfo() {
	// Load JWT from local storage
	const token = localStorage.getItem('token');

	await axios
		.get(origin + '/event/get', {
			headers: { Authorization: 'Bearer ' + token },
			params: { id: event_id },
		})
		.then(function (response) {
			if (response.status === 200) {
				console.log(response.data);
				event_info = response.data;
			}
		})
		.catch(function (error) {
			console.log(error);
			alert(error.response.data.message);
		});
}

// Get all comments
async function getComments() {
	// Load JWT from local storage
	const token = localStorage.getItem('token');

	await axios
		.get(origin + '/comments/get', {
			headers: { Authorization: 'Bearer ' + token },
			params: { eventId: event_id },
		})
		.then(function (response) {
			if (response.status === 200) {
				comments = response.data.comments;
				avg_rating = response.data.average;
				console.log('Comments: ', comments);
			}
		})
		.catch(function (error) {
			console.log(error);
			alert(error.response.data.message);
		});
}

// Load Event Info
function loadEventInfo() {
	// Set title
	document.getElementById('event-title').innerHTML = event_info.name;
	// Set date
	document.getElementById('event-date').innerHTML = new Date(
		event_info.date
	).toDateString();
	// Set description
	document.getElementById('event-description').innerHTML =
		event_info.description;
	// Set location
	getLocationString().then((res) => {
		document.getElementById('event-location').innerHTML = `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt" viewBox="0 0 16 16">
			<path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/>
			<path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
	  	</svg>
		${res}`;
	});
}

// Load Comments
function loadComments() {
	let htmlString = '';
	comments.forEach((comment) => {
		htmlString += `
		<div class="card comment bg-primary overflow-auto">
			<div class="card-body">
				<h6 class="card-title">${comment.name} - ${timeAgo(comment.created_at)}</h5>
				<p class="card-text">${comment.text}</p>
			</div>
		</div>
		`;
	});
	document.getElementById('comments-container').innerHTML = htmlString;
}

// Time Ago
function timeAgo(date) {
	const now = new Date();
	const seconds = Math.abs(Math.floor((now - new Date(date)) / 1000));
	let interval = Math.floor(seconds / 31536000);
	if (interval > 1) {
		return interval + ' years ago';
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return interval + ' months ago';
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return interval + ' days ago';
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return interval + ' hours ago';
	}
	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return interval + ' minutes ago';
	}
	return Math.floor(seconds) + ' seconds ago';
}

async function postComment() {
	// Load JWT from local storage
	const token = localStorage.getItem('token');

	// Get comment text
	const comment = document.getElementById('comment-text').value;

	// Get rating
	let rating = getRating();

	await axios
		.post(
			origin + '/comments/create',
			{
				eventId: event_id,
				text: comment,
				rating: rating,
			},
			{
				headers: { Authorization: 'Bearer ' + token },
			}
		)
		.then(function (response) {
			if (response.status === 200) {
				console.log('Comment posted');
				window.location.reload();
			}
		})
		.catch(function (error) {
			console.log(error);
			alert(error.response.data.message);
		});
}

// Get rating
function getRating() {
	for (let i = 5; i > 0; i--) {
		if (document.getElementById('star-' + i).checked) {
			return i;
		}
	}
	return null;
}

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

// On page, get event info
document.addEventListener('DOMContentLoaded', async function () {
	// TODO: Redirect to login if no token
	await getEventInfo();
	await getComments();

	loadEventInfo();
	loadComments();
});
