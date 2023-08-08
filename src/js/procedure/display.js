// displays all tutor's expected courses and positions
function displayExpectedTutors() {
    console.log("Expected Tutors Map:\n", expectedTutors);
    expectedTutorContainer.style.display = "block";

    let str = "";
    if (tutors != null) {
        str += "<hr><hr><h1>Missing Tutors:</h1></br>";
    } else {
        str += "<h1>Expected Tutor Courses and Positions:</h1></br>";
    }


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

    expectedTutorContainer.innerHTML = str;
}

// * =================================================================

function updateTutorDisplay(email) {
    let para = document.getElementById(email);

    if (para == null) {
        let container = null;
        if (tutors[email].hasErrors()) {
            container = errorsContainer;
        } else {
            container = tutorContainer;
        }
        if (container.style.display == 'none') return;
        container.appendChild(tutors[email].createDiv());

    } else {
        para.innerHTML = tutors[email].createDivInnerHTML();
    }
}

// * =================================================================

function displayErrors() {
    errorsContainer.style.display = "block";
    str = "</br><hr><hr><h1>Tutors With Errors:</h1></br>";
    for (const tutor in tutors) {
        if (!tutors[tutor].hasErrors()) continue;
        str += tutors[tutor].createDivAsHTML();
    }
    errorsContainer.innerHTML = str;
}

// display tutors by adding their display string to the page
function displayTutors() {
    console.log("Tutors Map:\n", tutors);
    console.log("Positions Map:\n", positionsMap);
    tutorContainer.style.display = "block";
    str = "<h1>Tutor Schedules:</h1></br>";
    for (const tutor in tutors) {
        if (tutors[tutor].hasErrors()) continue;
        str += tutors[tutor].createDivAsHTML();
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
    para.innerHTML = rooms[name].display() + "</br>" + ("=".repeat(50)) + "</br>";
}

// * =================================================================

// display rooms by adding their display string to the page
function displayRooms() {
    console.log("Rooms Map:\n", rooms);
    console.log("Request Rooms Map:\n", requestRooms);
    let roomContainer = document.getElementById('roomContainer');
    let str = "";

    for (let room in rooms) {
        str += `<div id='${room}'>`;
        str += rooms[room].display();
        str += "</br>";
        str += ("=".repeat(50)) + "</br></div>";
    }

    str += "</br><hr><hr><h1>Registrar Requests:</h1></br>";
    for (let room in requestRooms) {
        str += `<div id='${room}'>`;
        str += requestRooms[room].display();
        str += "</br>";
        str += ("=".repeat(50)) + "</br></div>";
    }

    roomContainer.innerHTML = str;
}

function displayBuildings() {
    console.log("Buildings:\n", buildings);

    let buildingContainer = document.getElementById("buildingContainer");
    let str = "</br><b>Buildings:</b></br>";
    for (const name in buildings) {
        const building = buildings[name];
        let days = "";
        for (let day of building.days) { days += day + " "; }
        str += "<p class='building'>";
        str += `| <b>${name}</b>: ${days} ${convertTimeToString(building.start)} - ${convertTimeToString(building.end)} | `;
        str += `<button type='submit' onclick="filterRooms('${name}')">Filter Rooms</button>`;
        str += "</p><br>";
    }
    str += `<button type='submit' onclick="filterRooms('Request')">Filter Registrar Requests</button><br>`;
    str += `<button type='submit' onclick="filterRooms('any')">Show All Rooms</button>`;
    str += "<br>";
    buildingContainer.innerHTML = str;

    if (rooms != null) {
        displayRooms();
    }
    if (tutors != null) {
        displayTutors();
    }
}