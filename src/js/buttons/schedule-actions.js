
function removeTimeFromTutor(email, day, i) {
    let tutor = tutors[email];
    let time = tutor.schedule.removeTime(day, i);
    
    if (time.hasRoomAssigned()) {
        let room = time.getRoom();
        room.schedule.removeTime(day, room.schedule.findTimeIndex(time));
        updateRoomDisplay(time.room);
        output({type: "info", message: `Time will also be removed from ${time.room}.`});
    }
    
    updateTutorDisplay(email);
    output({type: "success", message: `Time for ${time.getDayAndStartStr()} has been removed from ${email}'s schedule.`});
}

function removeTimeFromRoom(name, day, i, updateStatus) {
    console.log(name);
    let room = name in rooms ? rooms[name] : requestRooms[name];
    let time = room.schedule.removeTime(day, i);
    
    if (updateStatus && tutors != null && time.tutor in tutors && !ErrorStatus.includes(time.getCourse().status)) {
        time.getCourse().setStatus(StatusOptions.InProgress);
        updateTutorDisplay(time.tutor);
        output({type: "info", message: `Room assignment will also be removed from ${time.tutor}, and course will be marked as '${StatusOptions.InProgress}'.`});
    }
    
    updateRoomDisplay(name);
    output({type: "success", message: `Time for ${time.getDayAndStartStr()} has been removed from ${name}'s schedule.`});
}

// remove a time from a room's or tutor's schedule
function removeTime(containerID, day, i, updateStatus=true) {
    clearConsole();

    if (containerID in tutors) {
        removeTimeFromTutor(containerID, day, i);

    } else if (containerID in rooms || containerID in requestRooms) {
        removeTimeFromRoom(containerID, day, i, updateStatus);

    } else {
        output({type: 'error', 
        message: `${containerID} could not be found in either the tutors or rooms lists. The Time could not be removed.`});
    }
}