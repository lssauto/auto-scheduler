// * Assign rooms to tutor's requested session times

function BuildSchedules() {
    console.log("creating schedules...");

    if (tutors == null) {
        console.log("Tutor data must be parsed");
        return;
    }
    if (rooms == null) {
        console.log("Rooms data must be parsed");
        return;
    }

    // for each tutor
    for (let tutorID in tutors) {
        let tutor = tutors[tutorID];
        if (tutor.conflicts.length > 0) continue; // skip tutors with errors

        console.log("creating schedule for: " + tutor.name + " (" + tutor.email + ")");

        // for each day of the week
        for (let dayName in tutor.schedule.week) {
            let day = tutor.schedule.week[dayName];

            // for each session in the day
            let sessions = 0; // number of sessions assigned to this day
            for (let i = 0; i < day.length; i++) {
                if (day[i].tag != "session") continue;
                console.log(sessions);
                if (sessions >= 2) continue; // skip days with more than assigned 2 sessions

                console.log("finding space for: " + dayName + " " + convertTimeToString(day[i].start));

                // check if a session already has this time on a different day
                if (dayName != "Sun" || dayName != "Sat") {
                    let taken = false;
                    for (let _dayName in tutor.schedule.week) {
                        let _day = tutor.schedule.week[_dayName];
                        for (let _i = 0; _i < _day.length; _i++) {
                            if (day[i].tag != "session") continue;
                            if (_day[_i].start == day[i].start && "room" in _day[_i]) {
                                taken = true;
                            }
                        }
                    }
                    if (taken) continue;
                }

                // for each room
                for (let roomID in rooms) {
                    let room = rooms[roomID];
                    if (room.type != tutor.courses[day[i].course].position) continue; // only match tutors to rooms for their position

                    // check if the room is available for that time
                    let response = room.addTime(dayName + " " + convertTimeToString(day[i].start), day[i].course, tutorID);
                    
                    // if response is null, space was found
                    if (response == null) {
                        console.log("Room found: " + room.name);
                        tutor.schedule.week[dayName][i].room = room.name;
                        sessions++;
                        break;
                    }
                }
            }
        }
    }

    displayTutors(true);
    displayRooms();
}