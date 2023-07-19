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
        let sessionCount = {}; // max sessions for each course
        // calc max sessions
        for (const courseID in tutor.courses) {
            const course = tutor.courses[courseID];
            maxSessions += course.position == "LGT" ? 5 : 4;
            sessionCount[courseID] = {position: course.position, count: course.position == "LGT" ? 5 : 4};
        }

        // * for each day of the week
        for (let dayName in tutor.schedule.week) {
            if (sessions >= maxSessions) break; // no more sessions to assign
            let day = tutor.schedule.week[dayName];

            // * for each session in the day
            let sessionsThisDay = 0; // number of sessions assigned to this day
            for (let i = 0; i < day.length; i++) {
                let session = day[i];
                if (session.tag != "session") continue;
                if (session.room != null) { // skip if room is already assigned, // ! not redundant to similar check made in addTime()
                    sessionsThisDay++;
                    sessions++;
                    sessionCount[session.course].count--;
                    continue;
                }
                if (sessionsThisDay >= 2) break; // skip days with more than assigned 2 sessions

                console.log("finding space for: " + dayName + " " + convertTimeToString(session.start));

                // check if a session already has this time on a different day
                if (dayName != "Sun" || dayName != "Sat") {
                    let taken = false;
                    for (let _dayName in tutor.schedule.week) {
                        let _day = tutor.schedule.week[_dayName];
                        for (let _i = 0; _i < _day.length; _i++) {
                            if (_day[_i].tag != "session") continue;
                            if (_day[_i].start == session.start && "room" in _day[_i]) {
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
                if (!session.scheduleByLSS) {
                    console.log("Tutor Scheduling Session: " + dayName + " " + convertTimeToString(session.start));
                    tutor.schedule.week[dayName][i].room = "Scheduled By Tutor";
                    sessionsThisDay++;
                    sessions++;
                    continue;
                }

                if (tutor.courses[session.course].preference != "any") {
                    // check if preferred building has any rooms available
                    let buildingExists = false;
                    for (let roomID in rooms) {
                        if (roomID.toUpperCase().includes(tutor.courses[session.course].preference.toUpperCase())) {
                            buildingExists = true;
                            break;
                        }
                    }
                    if (!buildingExists) {
                        console.log("Tutor requesting specific building: " + tutor.courses[session.course].preference);
                        tutor.schedule.week[dayName][i].room = "Request Room In " + tutor.courses[session.course].preference;
                        sessionsThisDay++;
                        sessions++;
                        continue;
                    }

                    // * for each room with preference
                    for (let roomID in rooms) {
                        if (sessionCount[session.course].count <= (sessionCount[session.course].position == "LGT" ? 0 : 1)) break; // no more sessions to assign, will default to "Request From Registrar"
                        let room = rooms[roomID];
                        if (room.type != tutor.courses[session.course].position) continue; // only match tutors to rooms for their position
                        if (room.building != tutor.courses[session.course].preference) continue; // skip rooms that aren't in the preferred building

                        // check if the room is available for that time
                        let response = room.addTime(dayName + " " + convertTimeToString(session.start), session.course, tutorID);

                        // if response is null, space was found
                        if (response == null) {
                            console.log("Room found: " + room.name);
                            tutor.schedule.week[dayName][i].room = room.name;
                            sessionsThisDay++;
                            sessions++;
                            sessionCount[session.course].count--;
                            break;
                        } else if (response.error == "replaced") {
                            console.log("Session already scheduled in: " + room.name);
                            tutor.schedule.week[dayName][i].room = room.name;
                            sessionsThisDay++;
                            sessions++;
                            sessionCount[session.course].count--;
                            break;
                        }
                    }
                }

                // * for each room without preference
                if (!("room" in tutor.schedule.week[dayName][i])) {
                    for (let roomID in rooms) {
                        if (sessionCount[session.course].count <= (sessionCount[session.course].position == "LGT" ? 2 : 1)) break; // no more sessions to assign, will default to "Request From Registrar"
                        let room = rooms[roomID];
                        if (room.type != tutor.courses[session.course].position) continue; // only match tutors to rooms for their position

                        // check if the room is available for that time
                        let response = room.addTime(dayName + " " + convertTimeToString(session.start), session.course, tutorID);

                        // if response is null, space was found
                        if (response == null) {
                            console.log("Room found: " + room.name);
                            tutor.schedule.week[dayName][i].room = room.name;
                            sessionsThisDay++;
                            sessions++;
                            sessionCount[session.course].count--;
                            break;
                        } else if (response.error == "replaced") {
                            console.log("Session already scheduled in: " + room.name);
                            tutor.schedule.week[dayName][i].room = room.name;
                            sessionsThisDay++;
                            sessions++;
                            sessionCount[session.course].count--;
                            break;
                        }
                    }
                }

                if (!("room" in tutor.schedule.week[dayName][i])) {
                    console.log("No Space For: " + dayName + " " + convertTimeToString(session.start));
                    tutor.schedule.week[dayName][i].room = "Request From Registrar";
                    sessionsThisDay++;
                    sessions++;
                    sessionCount[session.course]--;
                }
            }
        }

        tutor.scheduled = true;
    }

    displayTutors(true);
    displayRooms();

    schedulesCompleted = true;

    output({type: "success", message: "schedules created!"});
}