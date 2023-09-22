// * functions called by "Ignore" and "Remove" buttons on tutor errors.

function ignoreError(email, courseID, i, updateDisplay=true) {
    // if the tutor's email is not in the tutors object, return.
    if (!tutors[email]) return;

    let tutor = tutors[email];
    let error = tutor.courses[courseID].errors[i];

    // add time to the tutor's schedule
    tutor.schedule.pushTime(error.time);

    // remove error
    tutors[email].courses[courseID].errors.splice(i, 1);

    // re-display tutor
    if (updateDisplay) {
        clearConsole();
        let para = document.getElementById(email);
        if (tutors[email].courses[courseID].errors.length == 0) {
            tutors[email].courses[courseID].setStatus(StatusOptions.ErrorsResolved);
        }
        if (!tutors[email].hasErrors()) para.remove();
        updateTutorDisplay(email);
    }

    output({type: "success", message: `${error.error} error for ${tutor.name} (${email}) has been ignored.`});
}

function removeError(email, courseID, i, updateDisplay=true) {
    // if the tutor's email is not in the tutors object, return.
    if (!tutors[email]) return;

    let tutor = tutors[email];
    let error = tutor.courses[courseID].errors[i];

    // remove error
    tutors[email].courses[courseID].errors.splice(i, 1);

    // re-display tutor
    clearConsole();
    if (updateDisplay) {
        let para = document.getElementById(email);
        if (tutors[email].courses[courseID].errors.length == 0) {
            tutors[email].courses[courseID].setStatus(StatusOptions.ErrorsResolved);
        }
        if (!tutors[email].hasErrors()) para.remove();
        updateTutorDisplay(email);
    }

    output({type: "success", message: `${error.error} error for ${tutor.name} (${email}) has been removed.`});
}

// * =================================================================

function setBuildingPreference(email, course) {
    clearConsole();
    if (!(email in tutors)) {
        output({type: "error", message: `${email} does not exit in tutor list.`});
        return;
    }

    let dropdown = document.getElementById(email + "-" + course + "-preference");
    let selection = dropdown.options[dropdown.selectedIndex].value;

    tutors[email].courses[course].setPreference(selection);
    if (selection != "any" && !preferenceList.includes(email)) {
        preferenceList.push(email);
    } else if (selection == "any") {
        preferenceList.splice(preferenceList.indexOf(email), 1);
    }

    output({type: "success", message: `${tutors[email].name}'s preferred building for sessions supporting ${course} has been set to ${selection}.`});
}

// * =================================================================

function setStatus(email, course, updateDisplay=true) {
    clearConsole();
    if (!(email in tutors)) {
        output({type: "error", message: `${email} does not exit in tutor list.`});
        return;
    }

    let dropdown = document.getElementById(email + "-" + course + "-status");
    let selection = dropdown.options[dropdown.selectedIndex].value;

    let previous = tutors[email].courses[course].status
    tutors[email].courses[course].setStatus(selection, false); // false flag to not update tutor display

    // re-display tutor
    para = document.getElementById(email);
    if (ErrorStatus.includes(previous) && !ErrorStatus.includes(selection)) {
        if (!tutors[email].hasErrors()) {
            para.remove();
        }
    }
    if (updateDisplay) updateTutorDisplay(email);

    output({type: "success", message: `${tutors[email].name}'s status for sessions supporting ${course} has been set to '${selection}'.`});
}

// * =================================================================

function removeCourse(email, course, updateDisplay=true) {
    if (!(email in tutors)) {
        output({type: "error", message: `${email} does not exit in tutor list.`});
        return;
    }

    let tutor = tutors[email];

    positionList = positionsMap[tutor.courses[course].position];
    let i = positionList.indexOf(email);
    if (i != -1) {
        positionList.splice(i, 1);
    }

    delete tutor.courses[course];
    tutor.fillSchedule();

    clearConsole();
    output({type: "success", message: `${course}, and all times associated have been removed from ${tutors[email].name}'s course list.`});

    // delete tutor if they have no courses left
    if (Object.keys(tutor.courses).length == 0) {
        output({type: "warning", 
            message: `${course} was the last course in ${tutors[email].name}'s course list. They will be removed from the tutors list.`});
            delete tutors[email];
        let para = document.getElementById(email);
        para.remove();
        return;
    }

    // re-display tutor
    let para = document.getElementById(email);
    if (!tutors[email].hasErrors() && para.parentNode.id == "errorsContainer") {
        para.remove();
    }
    if (updateDisplay) updateTutorDisplay(email);
}



function copySlackNote(name, courseID) {
    let message = `Hi @${name} This is a notification that your sessions for *${courseID}* have been posted on TutorHub. Please review the session days/times, and either let us know immediately if you need to make scheduling changes by thread replying to this note, or if you have a question that you'd like to keep private please direct message a coordinator. If you do not need to make changes, please confirm that your schedule works, as is, by replying with a thumbs-up to this note.`;
    navigator.clipboard.writeText(message);
    output({type: "success", message: `Slack message to ${name} for their ${courseID} sessions has been copied to your clipboard.`});
}