// * used to filter which tutors are displayed

function filterErrors() {
    document.getElementById('tutorContainer').style.display = "none";
    document.getElementById('expectedTutorContainer').style.display = "block";

    let errorsContainer = document.getElementById('errorsContainer');
    errorsContainer.style.display = "block";

    let errors = "<h1>Tutors With Errors:</h1></br>";
    for (const email in tutors) {
        if (tutors[email].hasErrors()) {
            errors += tutors[email].createDivAsHTML();
            continue;
        }
    }
    errorsContainer.innerHTML = errors;
}

function filterComments() {
    document.getElementById('expectedTutorContainer').style.display = "none";

    let tutorContainer = document.getElementById('tutorContainer');
    tutorContainer.style.display = "block";

    let errorsContainer = document.getElementById('errorsContainer');
    errorsContainer.style.display = "block";

    let str = "<h1>Tutors With Comments:</h1></br>";
    let errStr = "<hr><h1>Tutors With Comments And Errors:</h1></br>";
    for (const email in tutors) {
        const tutor = tutors[email];
        let hasComments = false;
        for (const course in tutor.courses) {
            if (tutor.courses[course].comments != "") {
                hasComments = true;
                break;
            }
        }

        if (hasComments) {
            if (tutor.hasErrors()) {
                errStr += tutor.createDivAsHTML();
            } else {
                str += tutor.createDivAsHTML();
            }
        }
    }
    tutorContainer.innerHTML = str;
    errorsContainer.innerHTML = errStr;
}

function filterRegistrar() {
    document.getElementById('errorsContainer').style.display = "none";
    document.getElementById('expectedTutorContainer').style.display = "none";

    let tutorContainer = document.getElementById('tutorContainer');
    tutorContainer.style.display = "block";

    let str = "<h1>Tutors With Registrar Requests:</h1></br>";
    for (const email in tutors) {
        const tutor = tutors[email];
        let hasRequest = false;
        for (const day in tutor.schedule.week) {
            const sessions = tutor.schedule.week[day];
            for (const session of sessions) {
                if (session.tag != Tags.Session) continue;
                if (!session.hasRoomAssigned()) continue;
                if (session.room.toLowerCase().includes("request")) {
                    hasRequest = true;
                }
            }
        }

        if (hasRequest) {
            str += tutor.createDivAsHTML();
            continue;
        }
    }
    tutorContainer.innerHTML = str;
}

// * interface function that will call specific filter functions
function filterTutors() {
    clearConsole();
    if (tutors == null) {
        output({type: "error", message: "Cannot filter tutors without tutor data."});
        return;
    }

    let dropdown = document.getElementById("filterOptions");
    let selection = dropdown.options[dropdown.selectedIndex].value;

    switch (selection) {
        case "errors":
            filterErrors();
            break;

        case "expected":
            document.getElementById('tutorContainer').style.display = "none";
            document.getElementById('errorsContainer').style.display = "none";
            displayExpectedTutors();
            break;

        case "comments":
            filterComments();
            break;
        
        case "registrar":
            if (!schedulesCompleted) {
                output({type: "error", message: "Cannot filter for tutors with registrar requests until schedules have been completed."});
                return;
            }
            filterRegistrar();
            break;

        default:
            displayAllTutors();
            break;
    }

    output({type: "success", message: "Successfully filtered tutors based on " + selection});
}

// * ===================================================================

// filter rooms by buildings or sessions by registrar requests

function filterRooms(building) {
    if (building == "any") {
        displayRooms();
        return;
    }

    let roomContainer = document.getElementById('roomContainer');
    let str = "";

    for (let room in rooms) {
        if (rooms[room].building == building) {
            str += `<div id='${room}'>`;
            str += rooms[room].display();
            str += "</br>";
            str += ("=".repeat(50)) + "</br></div>";
        }
    }

    for (let room in requestRooms) {
        if (requestRooms[room].name.includes(building)) {
            str += `<div id='${room}'>`;
            str += requestRooms[room].display();
            str += "</br>";
            str += ("=".repeat(50)) + "</br></div>";
        }
    }

    roomContainer.innerHTML = str;
}