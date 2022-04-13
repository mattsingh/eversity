function createEvent() {
	// Get event name
	const eventName = document.getElementById('eventName').value;
	// Get event date
	const eventDate = document.getElementById('eventDate').value;
	// Get event time
	const eventTime = document.getElementById('eventTime').value;

	// Get event type
	const eventType = document.getElementById('eventType').value;

	// Join date and time
	const eventDateTime = new Date(`${eventDate} ${eventTime}`);

	// Get event location
	const eventLocationString = document.getElementById('eventLocation').value;
	const eventLocation = parseLocationfromURL(eventLocationString);

	// Get event description
	const eventDescription = document.getElementById('eventDescription').value;

	// Get contact email
	const eventContactEmail =
		document.getElementById('eventContactEmail').value;

	// Get contact phone
	const eventContactPhone =
		document.getElementById('eventContactPhone').value;

	// Get token
	const token = localStorage.getItem('token');

	axios
		.post(
			origin + '/event/create',
			{
				name: eventName,
				date: eventDateTime,
				location: eventLocation,
				description: eventDescription,
				contactEmail: eventContactEmail,
				contactPhone: eventContactPhone,
				type: eventType,
			},
			{
				headers: { Authorization: 'Bearer ' + token },
			}
		)
		.then(function (response) {
			if (response.status === 200) {
				console.log(response.data);
				alert('Event created successfully!');
			}
		})
		.catch(function (error) {
			console.log(error);
			alert(error.response.data.message);
		});
}

function parseLocationfromURL(url) {
	let url_split = url.split('/');
	for (const section in url_split) {
		if (url_split[section].includes('@')) {
			let section_split = url_split[section].split(',');
			return {
				lat: section_split[0].slice(1),
				lng: section_split[1].slice(0, -1),
			};
		}
	}
	return null;
}

document.addEventListener('DOMContentLoaded', async function () {
	// TODO: Redirect to login if no token
});

// On submitButton click, create event
document.getElementById('submitButton').addEventListener('click', function () {
	createEvent();
});
