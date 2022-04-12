let rsos = [];

// Create RSO button was clicked
const createRSO = function() {
    // probably do some check here to make sure users can only create rso if admin

    // Redirect to create RSO page
    window.location.href = origin + '/createRSO';
};

// Load Events
const loadRSOs = function() {
    // Select upcoming events container
    const rsosContainer = document.getElementById(
        'rsosContainer'
    );

    let htmlString = '';
    rsos.forEach((rso) => {
        let approval = "NO";
        let color = "#DD0000";
        if (rso.approved == true) {
            approval = "YES";
            color = "#89DD00";
        }
        htmlString += `
        <a type="button" onclick="viewRSO()" class="card rsoContainer">
            <div class="card rsoNameCell bg-secondary">
                <div class="textContainer">
                    <h5 class="title">Name</h5>
                    <h1 class="rsoName">${rso.name}</h1>
                </div>
            </div>
            <div class="card rsoMembersCell bg-secondary">
                <div class="textContainer">
                    <h5 class="title">Approved</h5>
                    <h1 class="rsoMembers" style="color: ${color};">${approval}</h1>
                </div>
            </div>
            <div class="card rsoDescriptionCell bg-secondary">
                <div class="textContainer">
                    <h5 class="title">Description</h5>
                    <p class="rsoDescription">${rso.description}</p>
                </div>
            </div>
        </a>
        `;
    });

    rsosContainer.innerHTML = htmlString;

    console.log('Rendered RSOs to DOM');
};

// Get all RSOs
const getRSOs = async function() {
    // Load JWT from local storage
    const token = localStorage.getItem('token');
    await axios
        .get(origin + '/rso/get', {
            headers: { Authorization: 'Bearer ' + token },
        })
        .then(function(res) {
            console.log(res);
            if (res.status === 200) {
                rsos = res.data;
            }
        })
        .catch(function(err) {
            console.log(err);
            alert(err.response.data.message);
        });
};

// On page load get events
document.addEventListener('DOMContentLoaded', async function() {
    await getRSOs();
    loadRSOs();
});