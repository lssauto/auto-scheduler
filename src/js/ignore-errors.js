// * function called by "Ignore" buttons on tutor errors.
// * takes the tutor's email to use as a key in the tutors object, and the index of the conflict that will be ignored.

function ignoreError(email, i) {
    // if the tutor's email is not in the tutors object, return.
    if (!tutors[email]) return;

    let tutor = tutors[email];
    let conflict = tutor.conflicts[i];

    // add time to the tutor's schedule
    tutor.schedule.week[conflict.day].push({
        tutor: null, 
        course: conflict.time.course,
        tag: conflict.time.tag,
        start: conflict.time.start,
        end: conflict.time.end
    });
    if (conflict.time.tag == "session") {
        tutor.schedule.week[conflict.day].at(-1).scheduleByLSS = conflict.time.scheduleByLSS;
    }

    tutor.schedule.week[conflict.day].sort((a, b) => a.start - b.start);

    // remove error
    tutor.conflicts.splice(i, 1);

    // re-display tutors
    displayTutors();

    clearConsole();
    output({type: "success", message: `${conflict.error} error for ${tutor.name} (${email}) has been ignored.`});
}

function removeError(email, i) {
    // if the tutor's email is not in the tutors object, return.
    if (!tutors[email]) return;

    let tutor = tutors[email];
    let conflict = tutor.conflicts[i];

    // remove error
    tutors[email].conflicts.splice(i, 1);

    // re-display tutors
    displayTutors();

    clearConsole();
    output({type: "success", message: `${conflict.error} error for ${tutor.name} (${email}) has been removed.`});
}

function setBuildingPreference(email, course) {
    if (!(email in tutors)) {
        output({type: "error", message: `${email} does not exit in tutor list.`});
        return;
    }

    let dropdown = document.getElementById(email + "-preference");
    let selection = dropdown.options[dropdown.selectedIndex].value;

    tutors[email].courses[course].preference = selection;

    clearConsole();
    output({type: "success", message: `${tutors[email].name}'s preferred building for sessions supporting ${course} has been set to ${selection}.`});
}