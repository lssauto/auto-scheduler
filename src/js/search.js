// * reads search bar input and uses it to search for the specific tutor

let SearchBar;

function searchTutors() {
    let key = SearchBar.value;

    if (tutors == null) {
        output({ type: "error", message: "Tutor data must be parsed before searching for any tutors." });
        return;
    }

    let value = tutors[key + "@ucsc.edu"];

    if (value !== undefined && value !== null) {
        output({ type: "info", message: value.Display(value.scheduled)});
        return;
    }

    // check if input is full email
    value = tutors[key];

    if (value !== undefined && value !== null) {
        output({ type: "info", message: value.Display(value.scheduled)});
        return;
    }

    // if input isn't tutor ID, search tutors by name
    for (let tutor in tutors) {
        if (tutors[tutor].name === key) {
            output({ type: "info", message: tutors[tutor].Display(tutors[tutor].scheduled)});
            return;
        }
    }

    output({ type: "error", message: "No tutor found with the name or ID: " + key });
}