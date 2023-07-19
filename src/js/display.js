// displays all tutor's expected courses and positions
function displayExpectedTutors() {
    console.log("Expected Tutors Map:\n", expectedTutors);
    let tutorContainer = document.getElementById('expectedTutorContainer');
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

// display tutors by adding their display string to the page
function displayTutors(assigned=false) {
    console.log("Tutors Map:\n", tutors);
    let tutorContainer = document.getElementById('tutorContainer');
    tutorContainer.innerHTML = "";
    let errors = "</br><hr><hr><h1>Tutors With Errors:</h1></br>";
    for (let tutor in tutors) {
        if (tutors[tutor].conflicts.length > 0) {
            errors += tutors[tutor].Display();
            errors += "</br>";
            errors += ("=".repeat(50)) + "</br>";
            continue;
        }
        tutorContainer.innerHTML += tutors[tutor].Display(assigned);
        tutorContainer.innerHTML += "</br>";
        tutorContainer.innerHTML += ("=".repeat(50)) + "</br>";
    }

    tutorContainer.innerHTML += errors;
    displayExpectedTutors();
}

// display rooms by adding their display string to the page
function displayRooms() {
    console.log("Rooms Map:\n", rooms);
    let roomContainer = document.getElementById('roomContainer');
    roomContainer.innerHTML = "";

    for (let room in rooms) {
        roomContainer.innerHTML += rooms[room].Display();
        roomContainer.innerHTML += "</br>";
        roomContainer.innerHTML += ("=".repeat(50)) + "</br>";
    }
}

function displayBuildings() {
    console.log("Buildings:\n", buildings);

    let buildingContainer = document.getElementById("buildingContainer");
    buildingContainer.innerHTML = "</br>Buildings: ";

    for (const building of buildings) {
        buildingContainer.innerHTML += building + " | ";
    }
    buildingContainer.innerHTML += "</br>";

    if (tutors != null) {
        displayTutors();
    }
}