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
    
    output({type: "info", message: "creating schedules..."});    
    
    // * for each tutor
    for (let tutorID in tutors) {
        let tutor = tutors[tutorID];
        if (tutor.hasErrors()) continue; // skip tutors with errors
        
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
                if (session.tag != Tags.Session) continue;
                if (session.hasRoomAssigned()) { // skip if room is already assigned, // ! not redundant to similar check made in addTime()
                    sessionsThisDay++;
                    sessions++;
                    sessionCount[session.course].count--;
                    continue;
                }
                if (sessionsThisDay >= 2) break; // skip days with more than assigned 2 sessions

                if (session.getCourse().status != StatusOptions.InProgress) continue;

                console.log("finding space for: " + session.getDayAndStartStr());

                // check if a session already has this time on a different day
                if (dayName != "Sun" || dayName != "Sat") {
                    let taken = false;
                    for (let _dayName in tutor.schedule.week) {
                        let _day = tutor.schedule.week[_dayName];
                        for (let _i = 0; _i < _day.length; _i++) {
                            if (_day[_i].tag != Tags.Session) continue;
                            if (_day[_i].start == session.start && _day[_i].hasRoomAssigned()) {
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
                if (session.scheduleByLSS === false) {
                    console.log("Tutor Scheduling Session: " + session.getDayAndStartStr());
                    session.setRoom("Scheduled By Tutor");
                    sessionsThisDay++;
                    sessions++;
                    continue;
                }

                if (session.getCourse().preference != "any") {
                    // check if preferred building has any rooms available
                    let buildingExists = false;
                    for (let roomID in rooms) {
                        if (roomID.toUpperCase().includes(session.getCourse().preference.toUpperCase())) {
                            buildingExists = true;
                            break;
                        }
                    }
                    if (!buildingExists && dayName != "Sun") {
                        // skip if session is outside buildings allowed days and times
                        let building = buildings[session.getCourse().preference];
                        if (!building.days.includes(dayName)) continue;
                        if (session.start < building.start || building.end < session.end) continue;

                        console.log("Tutor requesting specific building: " + session.getCourse().preference);
                        session.setRoom("Request Room In " + session.getCourse().preference);
                        sessionsThisDay++;
                        sessions++;
                        continue;
                    }

                    // * for each room with preference
                    if (buildingExists) {
                        for (let roomID in rooms) {
                            if (sessionCount[session.course].count <= (sessionCount[session.course].position == "LGT" ? 2 : 1) && dayName != "Sun") break; // no more sessions to assign, will default to "Request From Registrar"
                            let room = rooms[roomID];
                            if (room.type != session.getCourse().position) continue; // only match tutors to rooms for their position
                            if (room.building != session.getCourse().preference) continue; // skip rooms that aren't in the preferred building
    
                            // check if the room is available for that time
                            let response = room.addTime(session.getDayAndStartStr(), session.course, tutorID);
    
                            // if response is null, space was found
                            if (response == null) {
                                console.log("Room found: " + room.name);
                                session.setRoom = room.name;
                                sessionsThisDay++;
                                sessions++;
                                sessionCount[session.course].count--;
                                break;
                            } else if (response.error == "replaced") {
                                console.log("Session already scheduled in: " + room.name);
                                session.setRoom = room.name;
                                sessionsThisDay++;
                                sessions++;
                                sessionCount[session.course].count--;
                                break;
                            }
                        }
                    }
                }

                // * for each room without preference
                if (!session.hasRoomAssigned()) {
                    for (let roomID in rooms) {
                        if (sessionCount[session.course].count <= (sessionCount[session.course].position == "LGT" ? 2 : 1) && dayName != "Sun") break; // no more sessions to assign, will default to "Request From Registrar"
                        let room = rooms[roomID];
                        if (room.type != session.getCourse().position) continue; // only match tutors to rooms for their position

                        // check if the room is available for that time
                        let response = room.addTime(session.getDayAndStartStr(), session.course, tutorID);

                        // if response is null, space was found
                        if (response == null) {
                            console.log("Room found: " + room.name);
                            session.setRoom(room.name);
                            sessionsThisDay++;
                            sessions++;
                            sessionCount[session.course].count--;
                            break;
                        } else if (response.error == "replaced") {
                            console.log("Session already scheduled in: " + room.name);
                            session.setRoom(room.name);
                            sessionsThisDay++;
                            sessions++;
                            sessionCount[session.course].count--;
                            break;
                        }
                    }
                }

                if (!session.hasRoomAssigned() && dayName != "Sun") {
                    console.log("No Space For: " + session.getDayAndStartStr());
                    console.log(session);
                    session.setRoom("Request From Registrar");
                    sessionsThisDay++;
                    sessions++;
                    sessionCount[session.course]--;
                }
            }
        }

        for (let dayName in tutor.schedule.week) {
            let day = tutor.schedule.week[dayName];
            let timeFound = false;
            for (let i = 0; i < day.length; i++) {
                let time = day[i];
                if (time.tag != Tags.Discord) continue;

                if (i > 0 && day[i - 1].hasRoomAssigned() && time.conflictsWith(day[i - 1])) {
                    continue;
                }
                if (i < day.length - 1 && day[i + 1].hasRoomAssigned() && time.conflictsWith(day[i + 1])) {
                    continue;
                }
                time.setRoom("Discord Time");
                timeFound = true;
                break;
            }
            if (timeFound) break;
        }

        for (const courseID in tutor.courses) {
            if (tutor.courses[courseID].status == StatusOptions.InProgress) {
                tutor.courses[courseID].setStatus(StatusOptions.SessionsScheduled);
            }
        }
    }

    displayAllTutors();
    displayRooms();

    schedulesCompleted = true;

    output({type: "success", message: "schedules created!"});
}