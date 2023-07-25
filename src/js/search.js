// * reads search bar input and uses it to search for the specific tutor

let SearchBar;

function scrollToTutor(email) {
    const tutor = document.getElementById(email);
    tutor.scrollIntoView({ behavior: 'smooth' });
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
    for (let tutor in tutors) {
        if (tutors[tutor].name === key) {
            scrollToTutor(tutors[tutor].email);
            return;
        }
    }

    output({ type: "error", message: "No tutor found with the name or ID: " + key });
}