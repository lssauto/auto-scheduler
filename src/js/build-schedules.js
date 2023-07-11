// * Assign rooms to tutor's requested session times

function BuildSchedules() {

    clearConsole();

    if (tutors == null) {
        output({type: "error", message: "Tutor data must be parsed before building schedules."});
        return;
    }
    if (rooms == null) {
        output({type: "error", message: "Room data must be parsed before building schedules."});
        return;
    }

    output({type: "info", message: "creating schedules.."});

    // * for each tutor
    for (let tutorID in tutors) {
        let tutor = tutors[tutorID];
        if (tutor.conflicts.length > 0) continue; // skip tutors with errors

        console.log("creating schedule for: " + tutor.name + " (" + tutor.email + ")");

        let sessions = 0; // number of sessions assigned to this tutor
        let maxSessions = 0; // maximum number of sessions assigned to this tutor
        // calc max sessions
        for (const courseID in tutor.courses) {
            const course = tutor.courses[courseID];
            maxSessions += course.position == "LGT" ? 5 : 4;
        }

        // * for each day of the week
        for (let dayName in tutor.schedule.week) {
            if (sessions >= maxSessions) break; // no more sessions to assign
            let day = tutor.schedule.week[dayName];

            // * for each session in the day
            let sessionsThisDay = 0; // number of sessions assigned to this day
            for (let i = 0; i < day.length; i++) {
                if (day[i].tag != "session") continue;
                if (sessionsThisDay >= 2) break; // skip days with more than assigned 2 sessions

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
                    if (taken) {
                        console.log("Time taken on a different day");
                        continue;
                    } 
                }

                // check if tutor wants this session scheduled
                if (!day[i].scheduleByLSS) {
                    console.log("Tutor Scheduling Session: " + dayName + " " + convertTimeToString(day[i].start));
                    tutor.schedule.week[dayName][i].room = "Scheduled By Tutor";
                    sessionsThisDay++;
                    sessions++;
                    continue;
                } 

                // * for each room
                for (let roomID in rooms) {
                    let room = rooms[roomID];
                    if (room.type != tutor.courses[day[i].course].position) continue; // only match tutors to rooms for their position

                    // check if the room is available for that time
                    let response = room.addTime(dayName + " " + convertTimeToString(day[i].start), day[i].course, tutorID);
                    
                    // if response is null, space was found
                    if (response == null) {
                        console.log("Room found: " + room.name);
                        tutor.schedule.week[dayName][i].room = room.name;
                        sessionsThisDay++;
                        sessions++;
                        break;
                    }
                }

                if (!("room" in tutor.schedule.week[dayName][i])) {
                    console.log("No Space For: " + dayName + " " + convertTimeToString(day[i].start));
                    tutor.schedule.week[dayName][i].room = "Request From Registrar";
                    sessionsThisDay++;
                    sessions++;
                }
            }
        }
    }

    displayTutors(true);
    displayRooms();

    output({type: "success", message: "schedules created!"});
}