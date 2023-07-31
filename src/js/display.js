// displays all tutor's expected courses and positions
function displayExpectedTutors() {
    console.log("Expected Tutors Map:\n", expectedTutors);
    let tutorContainer = document.getElementById('expectedTutorContainer');
    tutorContainer.style.display = "block";
    tutorContainer.innerHTML = "";

    if (tutors != null) {
        tutorContainer.innerHTML += "<hr><hr><h1>Missing Tutors:</h1></br>";
    } else {
        tutorContainer.innerHTML += "<h1>Expected Tutor Courses and Positions:</h1></br>";
    }

    let str = "";

    for (const email in expectedTutors) {
        if (tutors != null && email in tutors) continue;
        const expectedTutor = expectedTutors[email];
        
        str += `<b>Name: ${expectedTutor.name} ; `;
        str += `Email: ${expectedTutor.email}</b></br>`;
        str += "<b>Courses:</b></br>";

        for (const id in expectedTutor.courses) {
            str += `${id}: ${expectedTutor.courses[id]}</br>`;
        }
        str += "</br>";
        str += ("=".repeat(50)) + "</br>";
    }

    tutorContainer.innerHTML += str;
}

// * =================================================================

function updateTutorDisplay(email) {
    let para = document.getElementById(email);

    if (para == null) {
        let container = null;
        if (tutors[email].hasErrors()) {
            container = document.getElementById('errorsContainer');
        } else {
            container = document.getElementById('tutorContainer');
        }
        if (container.style.display == 'none') return;
        str = "";
        str += tutors[email].CreateDiv();
        container.innerHTML += str;
    } else {
        para.innerHTML = tutors[email].Display() + "</br>" + ("=".repeat(50)) + "</br>";
    }
}

// * =================================================================

function displayErrors() {
    let errorsContainer = document.getElementById('errorsContainer');
    errorsContainer.style.display = "block";
    errorsContainer.innerHTML = "";
    let errors = "</br><hr><hr><h1>Tutors With Errors:</h1></br>";
    for (const tutor in tutors) {
        if (!tutors[tutor].hasErrors()) continue;
        errors += tutors[tutor].CreateDiv();
    }

    errorsContainer.innerHTML = errors;
}

// display tutors by adding their display string to the page
function displayTutors() {
    console.log("Tutors Map:\n", tutors);
    let tutorContainer = document.getElementById('tutorContainer');
    tutorContainer.style.display = "block";
    tutorContainer.innerHTML = "";

    let str = "<h1>Tutor Schedules:</h1></br>";
    for (const tutor in tutors) {
        if (tutors[tutor].hasErrors()) continue;
        str += tutors[tutor].CreateDiv();
    }

    tutorContainer.innerHTML = str;
}

function displayAllTutors() {
    displayTutors();
    displayErrors();
    displayExpectedTutors();
}

// * =================================================================

function updateRoomDisplay(name) {
    let para = document.getElementById(name);
    para.innerHTML = rooms[name].Display() + "</br>" + ("=".repeat(50)) + "</br>";
}

// * =================================================================

// display rooms by adding their display string to the page
function displayRooms() {
    console.log("Rooms Map:\n", rooms);
    let roomContainer = document.getElementById('roomContainer');
    roomContainer.innerHTML = "";
    let str = "";

    for (let room in rooms) {
        str += `<div id='${room}'>`;
        str += rooms[room].Display();
        str += "</br>";
        str += ("=".repeat(50)) + "</br></div>";
    }

    roomContainer.innerHTML = str;
}

function displayBuildings() {
    console.log("Buildings:\n", buildings);

    let buildingContainer = document.getElementById("buildingContainer");
    buildingContainer.innerHTML = "</br><b>Buildings:</b></br>";

    for (const name in buildings) {
        const building = buildings[name];
        let days = "";
        for (let day of building.days) { days += day + " "; }
        buildingContainer.innerHTML += `| ${name}: ${days} ${convertTimeToString(building.start)} - ${convertTimeToString(building.end)} |</br>`;
    }
    buildingContainer.innerHTML += "</br>";

    if (tutors != null) {
        displayTutors();
    }
}