// * functions for copying tutor and room schedules in format that will paste into a spreadsheet
// * rows separated by newlines, columns separated by tabs

function copyTutorTable(event) {
    event.preventDefault(); // Prevents the form from submitting and refreshing the page

    // check if tutors exist
    if (tutors == null) {
        output({type: "error", message: "Tutor data must be parsed before copying schedules."});
        return;
    }

    if (!schedulesCompleted) {
        output({type: "error", message: "Schedules need to be created before copying schedules."});
        return;
    }

    let str = responseColumnTitles.join("\t") + "\n";

    // set new values in matrix
    for (let r = 0; r < tutorMatrix.length; r++) {
        const rowObj = tutorJSONObjs[r];
        const tutor = tutors[rowObj.email];

        // if course was deleted
        if (!(rowObj.class in tutor.courses)) {
            for (let c = 0; c < responseColumnTitles.length; c++) {
                const title = responseColumnTitles[c].trim().toLowerCase();

                if (title.includes(Titles.Status)) {
                    tutorMatrix[r][c] = StatusOptions.PastSubmission;

                } else if (title.includes(Titles.Scheduler)) {
                    tutorMatrix[r][c] = course.scheduler;
                }
            }
            continue;
        }

        const course = tutor.courses[rowObj.class];

        // determine if the current row is a past submission
        let dateObject = new Date(rowObj.timestamp);
        let timestamp = dateObject.getTime();

        if (course.timestamp > timestamp) {
            for (let c = 0; c < responseColumnTitles.length; c++) {
                const title = responseColumnTitles[c].trim().toLowerCase();

                if (title.includes(Titles.CourseID)) {
                    tutorMatrix[r][c] = course.id;

                } else if (title.includes(Titles.Status)) {
                    tutorMatrix[r][c] = StatusOptions.PastSubmission;

                } else if (title.includes(Titles.Scheduler)) {
                    tutorMatrix[r][c] = course.scheduler;
                }
            }
            continue;
        }

        // determine if the current row has errors
        if (ErrorStatus.includes(course.status)) {
            for (let c = 0; c < responseColumnTitles.length; c++) {
                const title = responseColumnTitles[c].trim().toLowerCase();

                if (title.includes(Titles.CourseID)) {
                    tutorMatrix[r][c] = course.id;

                } else if (title.includes(Titles.Status)) {
                    tutorMatrix[r][c] = course.status;

                } else if (title.includes(Titles.Scheduler)) {
                    tutorMatrix[r][c] = course.scheduler;
                }
            }
            continue;
        }

        // set assigned rooms and clean up responses' formatting
        for (let c = 0; c < responseColumnTitles.length; c++) {
            const title = responseColumnTitles[c].trim().toLowerCase();

            if (title.includes(Titles.CourseID)) {
                tutorMatrix[r][c] = course.id;

            } else if (title.includes(Titles.SessionOption)) {
                let time = tutor.schedule.findTimeByStr(tutorMatrix[r][c]);
                if (time != null) {
                    if (time.hasRoomAssigned()) {
                        tutorMatrix[r][c + 1] = time.room;
                    }
                } else {
                    tutorMatrix[r][c] = NA;
                }
                c++;

            } else if (title.includes(Titles.Status)) {
                tutorMatrix[r][c] = course.status;

            } else if (title.includes(Titles.Scheduler)) {
                tutorMatrix[r][c] = course.scheduler;
            }
        }
    }

    // concat str
    for (let r = 0; r < tutorMatrix.length; r++) {
        str += tutorMatrix[r].join("\t") + "\n";
    }
    
    // add to clipboard
    navigator.clipboard.writeText(str);

    output({
        type: "success", 
        message: "Copied full table to clipboard, this can be pasted over the form responses to update room assignments and status changes."
    });
}

function copyTutorSchedules(event) {
    event.preventDefault(); // Prevents the form from submitting and refreshing the page

    // check if tutors exist
    if (tutors == null) {
        output({type: "error", message: "Tutor data must be parsed before copying schedules."});
        return;
    }

    if (!schedulesCompleted) {
        output({type: "error", message: "Schedules need to be created before copying schedules."});
        return;
    }

    let str = "";

    for (const tutorID in tutors) {
        const tutor = tutors[tutorID];
        if (tutor.hasErrors()) continue;

        str += "Tutor\t";
        str += tutor.name + " (" + tutorID + ")\n";

        str += "Courses\t";
        for (let courseID in tutor.courses) {
            str += `${courseID} , ${tutor.courses[courseID].position}\t`;
        }
        str += "\n";

        str += tutor.schedule.copy(true);
        str += "\n";
    }

    navigator.clipboard.writeText(str);

    output({
        type: "success", 
        message: "Tutor schedules copied to clipboard! This contains their session times, and assigned rooms."
    });
}

function copyRoomSchedules(event) {
    event.preventDefault(); // Prevents the form from submitting and refreshing the page

    // check if tutors exist
    if (rooms == null) {
        output({type: "error", message: "Room data must be parsed before copying schedules."});
        return;
    }

    let str = "";

    for (const roomID in rooms) {
        const room = rooms[roomID];

        str += "Room\t";
        str += room.name + "\n";

        str += room.schedule.copy();
    }

    navigator.clipboard.writeText(str);

    output({type: "success", message: "Room schedules copied to clipboard!"});
}

let copyTutorTableButton = document.getElementById('copyTutorTableButton');
copyTutorTableButton.addEventListener('click', copyTutorTable);

let copyTutorSchedulesButton = document.getElementById('copyTutorSchedulesButton');
copyTutorSchedulesButton.addEventListener('click', copyTutorSchedules);

let RoomCopyButton = document.getElementById('RoomCopyButton');
RoomCopyButton.addEventListener('click', copyRoomSchedules);