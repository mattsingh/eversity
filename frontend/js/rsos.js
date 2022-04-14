let rsos = [];

// Create RSO button was clicked
const createRSO = function() {
    // probably do some check here to make sure users can only create event if admin

    // Redirect to create RSO page
    window.location.href = origin + '/createRSO';
};

// Load Events
const loadRSOs = async function() {
    // Select upcoming events container
    const rsosContainer = document.getElementById(
        'rsosContainer'
    );

    let htmlString = '';
    for (const rso of rsos) {
        let approval = "NO";
        let color = "#DD0000";
        if (rso.approved == true) {
            approval = "YES";
            color = "#89DD00";
        }
        htmlString += `
        <div class="card rsoContainer">
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
        `;

        const isAnRSOMember = await isMember(rso.id);
        //console.log(isAnRSOMember);

        const isAdminMemberForThisRSO = await isAdminForThisRSO(rso.id);

        if (isAnRSOMember == true) { // TO DO: add onclick functions
            if (isAdminMemberForThisRSO == false) {
                htmlString += `<button class="leaveRSO" value="${rso.id}" onclick="leaveRSO(this.value)">Leave</button>`;
            }
        } else {
            htmlString += `<button class="joinRSO" value="${rso.id}" onclick="joinRSO(this.value)">Join</button>`;
        }

        // Close the rso cell/container
        htmlString += `</div>`;
    };

    rsosContainer.innerHTML = htmlString;

    console.log('Rendered RSOs to DOM');
};

const joinRSO = function(tempRSOId) {
    // Load JWT from local storage
    const token = localStorage.getItem('token');

    axios
        .post(origin + '/rso/join', {
            rsoId: tempRSOId,
        }, {
            headers: { Authorization: 'Bearer ' + token },
        })
        .then(function(res) {
            console.log(res);
            if (res.status === 200) {
                // Redirect to dashboard (basically reloading)
                window.location.href = origin + '/rsos';
            }
        })
        .catch(function(err) {
            console.log(err);
            alert(err.response.data.message);
        });
};

const leaveRSO = function(tempRSOId) {
    // Load JWT from local storage
    const token = localStorage.getItem('token');

    axios
        .post(origin + '/rso/leave', {
            rsoId: tempRSOId,
        }, {
            headers: { Authorization: 'Bearer ' + token },
        })
        .then(function(res) {
            console.log(res);
            if (res.status === 200) {
                // Redirect to dashboard (basically reloading)
                window.location.href = origin + '/rsos';
            }
        })
        .catch(function(err) {
            console.log(err);
            alert(err.response.data.message);
        });
};

// Get if is member of a RSO
async function isMember(tempRSOID) {
    //console.log(tempRSOID);
    // Load JWT from local storage
    const token = localStorage.getItem('token');
    let value = false;
    await axios
        .get(origin + '/rso/isMember', {
            headers: { Authorization: 'Bearer ' + token },
            params: { rsoId: tempRSOID },
        })
        .then(function(res) {
            console.log(res);
            if (res.status === 200) {
                //console.log(res.data.isMember);
                value = res.data.isMember;
            }
        })
        .catch(function(err) {
            console.log(err);
            alert(err.response.data.message);
        });

    //console.log(value);
    return value;
}

// Get if is member of this RSO
async function isAdminForThisRSO(tempRSOID) {
    //console.log(tempRSOID);
    // Load JWT from local storage
    const token = localStorage.getItem('token');
    let value = false;
    await axios
        .get(origin + '/rso/isAdminForThisRSO', {
            headers: { Authorization: 'Bearer ' + token },
            params: { rsoId: tempRSOID },
        })
        .then(function(res) {
            console.log(res);
            if (res.status === 200) {
                //console.log(res.data.isAdminForThisRSO);
                value = res.data.isAdminForThisRSO;
            }
        })
        .catch(function(err) {
            console.log(err);
            alert(err.response.data.message);
        });

    //console.log(value);
    return value;
}

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