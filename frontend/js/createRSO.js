// Create RSO with given info
const submitRSO = function() {
    // Load JWT from local storage
    const token = localStorage.getItem('token');
    axios
        .post(origin + '/rso/create', {
            name: document.getElementById('rsoName').value,
            description: document.getElementById('rsoDescription').value,
        }, {
            headers: { Authorization: 'Bearer ' + token },
        })
        .then(function(res) {
            console.log(res);
            if (res.status === 200) {
                // Redirect to RSO listings page
                alert("Your RSO has successfully been created!");
            }
        })
        .catch(function(err) {
            console.log(err);
            alert("Error: " + err.response.data.message);
        });
    // Redirect to RSO listings page
    window.location.href = origin + '/rsos';
};