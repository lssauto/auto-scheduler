
// remove a time from a room's or tutor's schedule
function removeTime(containerID, day, tag, startTime) {
    clearConsole();

    if (containerID in tutors) {
        let tutor = tutors[containerID];
        let time = tutor.schedule.removeTime(day, tag, startTime);

        if (time.tag == "session" && "room" in time) {
            rooms[time.room].schedule.removeTime(day, time.tag, startTime);
            updateRoomDisplay(time.room);
            output({type: "info", message: `Time will also be removed from ${time.room}.`});
        }

        updateTutorDisplay(containerID);
        output({type: "success", message: `Time for ${day} ${convertTimeToString(startTime)} has been removed from ${containerID}'s schedule.`});

    } else if (containerID in rooms) {
        let room = rooms[containerID];
        let time = room.schedule.removeTime(day, tag, startTime);

        if (tutors != null && time.tutor in tutors) {
            tutors[time.tutor].schedule.getTime(day, tag, startTime).room = null;
            tutors[time.tutor].courses[time.course].setStatus(StatusOptions.InProgress);
            updateTutorDisplay(time.tutor);
            output({type: "info", message: `Room assignment will also be removed from ${time.tutor}, and course will be marked as '${StatusOptions.InProgress}'.`});
        }

        updateRoomDisplay(containerID);
        output({type: "success", message: `Time for ${day} ${convertTimeToString(startTime)} has been removed from ${containerID}'s schedule.`});

    } else {
        output({type: 'error', 
        message: `${containerID} could not be found in either the tutors or rooms lists. The Time could not be removed.`});
    }
}