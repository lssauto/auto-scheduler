// * used to filter which tutors are displayed

function filterErrors() {
    document.getElementById('tutorContainer').style.display = "none";
    document.getElementById('expectedTutorContainer').style.display = "block";

    let errorsContainer = document.getElementById('errorsContainer');
    errorsContainer.style.display = "block";
    errorsContainer.innerHTML = "";

    let errors = "<h1>Tutors With Errors:</h1></br>";
    for (const tutor in tutors) {
        if (tutors[tutor].hasErrors()) {
            errors += `<p id='${tutor}'>`;
            errors += tutors[tutor].Display();
            errors += "</br>";
            errors += ("=".repeat(50)) + "</br></p>";
            continue;
        }
    }
    errorsContainer.innerHTML += errors;
}

function filterComments() {
    document.getElementById('errorsContainer').style.display = "none";
    document.getElementById('expectedTutorContainer').style.display = "none";

    let tutorContainer = document.getElementById('tutorContainer');
    tutorContainer.style.display = "block";
    tutorContainer.innerHTML = "";

    let str = "<h1>Tutors With Comments:</h1></br>";
    for (const tutor in tutors) {
        let hasComments = false;
        for (const course in tutors[tutor].courses) {
            if (tutors[tutor].courses[course].comments != "") {
                hasComments = true;
                break;
            }
        }

        if (hasComments) {
            str += `<p id='${tutor}'>`;
            str += tutors[tutor].Display();
            str += "</br>";
            str += ("=".repeat(50)) + "</br></p>";
            continue;
        }
    }
    tutorContainer.innerHTML += str;
}

function filterRegistrar() {
    document.getElementById('errorsContainer').style.display = "none";
    document.getElementById('expectedTutorContainer').style.display = "none";

    let tutorContainer = document.getElementById('tutorContainer');
    tutorContainer.style.display = "block";
    tutorContainer.innerHTML = "";

    let str = "<h1>Tutors With Registrar Requests:</h1></br>";
    for (const email in tutors) {
        const tutor = tutors[email];
        let hasRequest = false;
        for (const day in tutor.schedule.week) {
            const sessions = tutor.schedule.week[day];
            for (const session of sessions) {
                if (session.tag != "session") continue;
                if (!("room" in session)) continue;
                if (session.room.toLowerCase().includes("request")) {
                    hasRequest = true;
                }
            }
        }

        if (hasRequest) {
            str += `<p id='${tutor}'>`;
            str += tutors[tutor].Display();
            str += "</br>";
            str += ("=".repeat(50)) + "</br></p>";
            continue;
        }
    }
    tutorContainer.innerHTML += str;
}

function filterTutors() {
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