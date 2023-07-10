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