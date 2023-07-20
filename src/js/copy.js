// * functions for copying tutor and room schedules in format that will paste into a spreadsheet
// * rows separated by newlines, columns separated by tabs
/*
function CopyTutorSchedules(event) {
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
        if (tutor.conflicts.length > 0) continue;

        str += "Tutor\t";
        str += tutor.name + " (" + tutorID + ")\n";

        str += "Courses\t";
        for (let courseID in tutor.courses) {
            str += `${courseID} , ${tutor.courses[courseID].position}\t`;
        }
        str += "\n";

        str += tutor.schedule.Copy(true);
        str += "\n";
    }

    navigator.clipboard.writeText(str);
    TutorCopyButton.innerHTML = "Copied!";

    output({type: "success", message: "Tutor schedules copied to clipboard!"});
}*/

function CopyRoomSchedules(event) {
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

        str += room.schedule.Copy();
    }

    navigator.clipboard.writeText(str);
    RoomCopyButton.innerHTML = "Copied!";

    output({type: "success", message: "Room schedules copied to clipboard!"});
}

/*
let TutorCopyButton = document.getElementById('TutorCopyButton');
TutorCopyButton.addEventListener('click', CopyTutorSchedules);*/

let RoomCopyButton = document.getElementById('RoomCopyButton');
RoomCopyButton.addEventListener('click', CopyRoomSchedules);