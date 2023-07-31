// * reads search bar input and uses it to search for the specific tutor

let SearchBar;

function scrollToTutor(email) {
    const tutor = document.getElementById(email);
    tutor.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function searchTutors() {
    let key = SearchBar.value;

    if (tutors == null) {
        output({ type: "error", message: "Tutor data must be parsed before searching for any tutors." });
        return;
    }

    displayAllTutors();

    let value = tutors[key + "@ucsc.edu"];

    if (value !== undefined && value !== null) {
        scrollToTutor(key + "@ucsc.edu");
        return;
    }

    // check if input is full email
    value = tutors[key];

    if (value !== undefined && value !== null) {
        scrollToTutor(key);
        return;
    }

    // if input isn't tutor ID, search tutors by name
    const name = key.toLowerCase();
    for (const tutor in tutors) {
        if (tutors[tutor].name.toLowerCase().includes(name)) {
            scrollToTutor(tutors[tutor].email);
            return;
        }
    }

    // search by course
    const course = formatCourseID(key);
    let results = [];
    if (course != null) {
        for (const email in tutors) {
            const tutor = tutors[email];
            for (const courseID in tutor.courses) {
                if (courseID == course) {
                    results.push(email);
                }
            }
        }

        document.getElementById('expectedTutorContainer').style.display = "none";

        let tutorContainer = document.getElementById('tutorContainer');
        tutorContainer.style.display = "block";
        tutorContainer.innerHTML = "";

        let errorsContainer = document.getElementById('errorsContainer');
        errorsContainer.style.display = "block";
        errorsContainer.innerHTML = "";

        let str = `<h1>Tutors Assigned to ${course}:</h1></br>`;
        let errStr = `<hr><h1>Tutors Assigned to ${course} And Have Errors:</h1></br>`;
        for (const email of results) {
            if (tutors[email].hasErrors()) {
                errStr += tutors[email].CreateDiv();
            } else {
                str += tutors[email].CreateDiv();
            }
        }
        tutorContainer.innerHTML += str;
        errorsContainer.innerHTML += errStr;
        return;
    }

    output({ type: "error", message: "No tutor or course found with the name or ID: " + key });
}