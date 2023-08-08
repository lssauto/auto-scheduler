// pop ups

function getSchedulerName() {
    scheduler = window.prompt("Scheduler Name:","");
    document.getElementById('schedulerName').innerHTML = "Scheduler: " + scheduler;
}

function password() {
    key = "lss";
    pend = window.prompt("Password","");

    if(pend != key) {
        history.go(-1);
    } else {
        document.getElementById("body").style.display = "block";
        getSchedulerName();
    }
}

window.onload = password;

// ? https://www.geeksforgeeks.org/how-to-display-warning-before-leaving-the-web-page-with-unsaved-changes-using-javascript/
// Event listener for the 'beforeunload' event
window.addEventListener('beforeunload', function (e) {

    // Check if any of the input fields are filled
    if (tutors != null || expectedTutors != null || buildings != null || rooms != null) {

        // Cancel the event and show alert that
        // the unsaved changes would be lost
        e.preventDefault();
        e.returnValue = '';
    }
});