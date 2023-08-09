// * Assign rooms to tutor's requested session times

// returned by specific schedulers, tells main function how to update session counts
const NO_SESSION = 0;
const REQUEST = 1;
const SCHEDULED = 2;
const TUTOR_SCHEDULED = 3;

function defaultScheduler(tutor, session, courseSessionCount) {
    let course = session.getCourse();

    // check if a session already has this time on a different day
    if (session.day != "Sun" || session.day != "Sat") {
        for (const dayName in tutor.schedule.week) {
            const day = tutor.schedule.week[dayName];
            for (let i = 0; i < day.length; i++) {
                if (day[i].tag != Tags.Session) continue;
                if (day[i].start == session.start && day[i].hasRoomAssigned()) {
                    console.log("Time taken on a different day");
                    return NO_SESSION;
                }
            }
        }
    }

    // check if tutor wants this session scheduled
    if (session.scheduleByLSS === false) {
        console.log("Tutor Scheduling Session: " + session.getDayAndStartStr());
        session.setRoom(FixedRooms.TutorScheduled);
        return TUTOR_SCHEDULED;
    }

    // * schedule for preferred building
    if (course.preference != "any") {
        let building = buildings[course.preference];
        
        console.log("Searching for rooms in: " + course.preference);
        
        // * if preference requires a registrar request
        if (!building.hasRooms && session.day != "Sun") {
            // skip if session is outside buildings allowed days and times // ! check is typically done in schedule.addTime()
            if (!building.days.includes(session.day)) return NO_SESSION;
            if (session.start < building.start || building.end < session.end) return NO_SESSION;

            console.log("Tutor requesting specific building: " + course.preference);
            requestRooms[FixedRooms.SpecificRequest + course.preference].schedule.pushTime(session).setTutor(tutor.email);
            session.setRoom(FixedRooms.SpecificRequest + course.preference);
            return REQUEST;
        }

        // * for each room filtering with preference
        for (let roomID in rooms) {
            if (courseSessionCount > PositionRequestLimit[course.position] && session.day != "Sun") break; // no more sessions to assign, will default to "Request From Registrar"

            let room = rooms[roomID];

            if (!RoomPositionFilter[room.type].includes(course.position)) continue; // only match tutors to rooms for their position
            if (room.building != course.preference) continue; // skip rooms that aren't in the preferred building

            // check if the room is available for that time
            let response = room.addTime(session.getDayAndStartStr(), session.course, tutor.email);

            // if response is null, space was found
            if (response == null) {
                console.log("Room found: " + room.name);
                session.setRoom(room.name);
                return SCHEDULED;
            } else if (response.error == Errors.Replaced) {
                console.log("Session already scheduled in: " + room.name);
                session.setRoom(room.name);
                return SCHEDULED;
            }
        }

        console.log("No space found in: " + course.preference);
    }

    // * for each room without preference
    for (let roomID in rooms) {
        if (courseSessionCount > PositionRequestLimit[course.position] && session.day != "Sun") break; // no more sessions to assign, will default to "Request From Registrar"
        
        let room = rooms[roomID];

        if (!RoomPositionFilter[room.type].includes(course.position)) continue; // only match tutors to rooms for their position

        // check if the room is available for that time
        let response = room.addTime(session.getDayAndStartStr(), session.course, tutor.email);

        // if response is null, space was found
        if (response == null) {
            console.log("Room found: " + room.name);
            session.setRoom(room.name);
            return SCHEDULED;
        } else if (response.error == Errors.Replaced) {
            console.log("Session already scheduled in: " + room.name);
            session.setRoom(room.name);
            return SCHEDULED;
        }
    }

    // * registrar request
    if (session.day != "Sun") {
        console.log("No Space For: " + session.getDayAndStartStr());
        requestRooms[FixedRooms.Request].schedule.pushTime(session).setTutor(tutor.email);
        session.setRoom(FixedRooms.Request);
        return REQUEST;
    }

    console.log("Session could not be scheduled");
    return NO_SESSION;
}

function writingScheduler(tutor, session, sessionCount) {
    // check if a session already has this time on a different day
    if (session.day != "Sun" || session.day != "Sat") {
        for (const dayName in tutor.schedule.week) {
            const day = tutor.schedule.week[dayName];
            for (let i = 0; i < day.length; i++) {
                if (day[i].tag != Tags.Session) continue;
                if (day[i].start == session.start && day[i].hasRoomAssigned()) {
                    console.log("Time taken on a different day");
                    return NO_SESSION;
                }
            }
        }
    }

    // check if another writing tutor has the same session
    for (const email of positionsMap[Positions.WR]) {
        if (email == tutor.email) continue;

        const otherTutor = tutors[email];
        for (const dayName in otherTutor.schedule.week) {
            const day = otherTutor.schedule.week[dayName];
            for (let i = 0; i < day.length; i++) {
                if (day[i].tag != Tags.Session) continue;
                if (day[i].start == session.start && day[i].hasRoomAssigned()) {
                    console.log("Time taken by another tutor: " + email);
                    return NO_SESSION;
                }
            }
        }
    }

    console.log("Tutor Scheduling Session: " + session.getDayAndStartStr());
    session.setRoom(FixedRooms.TutorScheduled);
    return TUTOR_SCHEDULED;
}

function studyHallScheduler(session) {

}

// * =================================================================

// * =================================================================

// specific schedulers expect 3 arguments: 
// the Tutor instance the Time belongs to,
// the Time instance to schedule, 
// and the session count for the associated course
const ScheduleBuilders = {};
ScheduleBuilders[Positions.LGT] = defaultScheduler;
ScheduleBuilders[Positions.SGT] = defaultScheduler;
ScheduleBuilders[Positions.SI] = defaultScheduler;
ScheduleBuilders[Positions.WR] = writingScheduler;
ScheduleBuilders[Positions.SH] = studyHallScheduler;

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
    let finished = 0;
    let p = 0; let e = 0;
    const emailList = Object.keys(tutors);
    while (finished < emailList.length && e < emailList.length) {
        // tutors with building preferences are scheduled first
        let tutor = null;
        if (p < preferenceList.length) {
            tutor = tutors[preferenceList[p]];
            p++;
        } else {
            tutor = tutors[emailList[e]];
            e++;
            if (preferenceList.includes(tutor.email)) continue;
        }
        finished++;

        if (tutor.hasErrors()) continue; // skip tutors with errors
        
        console.log("creating schedule for: " + tutor.name + " (" + tutor.email + ")");

        let sessions = 0; // number of sessions assigned to this tutor
        let maxSessions = 0; // maximum number of sessions assigned to this tutor
        let sessionCounts = {}; // max sessions for each course
        // calc max sessions
        for (const courseID in tutor.courses) {
            const course = tutor.courses[courseID];
            maxSessions += PositionSessionLimit[course.position];
            sessionCounts[courseID] = {position: course.position, count: 0};
        }

        // * for each day of the week
        for (let dayName in tutor.schedule.week) {
            if (sessions >= maxSessions) break; // no more sessions to assign
            let day = tutor.schedule.week[dayName];
            
            // * for each session in the day
            let sessionsThisDay = 0; // number of sessions assigned to this day
            for (let i = 0; i < day.length; i++) {
                let time = day[i];

                if (sessionsThisDay >= 2) break; // skip days with more than 2 sessions assigned 

                if (time.tag != Tags.Session) continue;
                if (!ProgressStatus.includes(time.getCourse().status)) continue;
                if (sessionCounts[time.course].count >= PositionSessionLimit[time.getCourse().position]) continue;

                console.log("finding space for: " + time.getDayAndStartStr());

                let result = NO_SESSION;
                if (time.hasRoomAssigned()) { // skip if room is already assigned, // ! not redundant to similar check made in schedule.addTime()
                    result = SCHEDULED;
                } else { // call specific scheduler function
                    result = ScheduleBuilders[time.getCourse().position](tutor, time, sessionCounts[time.course].count);
                }

                // update session counts
                switch (result) {
                    case SCHEDULED:
                        sessionsThisDay++;
                        sessions++;
                        sessionCounts[time.course].count++;
                        break;
                    
                    case REQUEST:
                    case TUTOR_SCHEDULED:
                        sessionsThisDay++;
                        sessions++;
                        break;
                    
                    case NO_SESSION:
                    default:
                        break;
                }
            }
        }

        // assign discord times if tutor has any
        for (const dayName in tutor.schedule.week) {
            const day = tutor.schedule.week[dayName];
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

                time.setRoom(FixedRooms.Discord);
                timeFound = true;
                break;
            }
            if (timeFound) break;
        }

        for (const courseID in tutor.courses) {
            if (ProgressStatus.includes(tutor.courses[courseID].status)) {
                tutor.courses[courseID].setStatus(StatusOptions.SessionsScheduled);
            }
        }
    }

    displayAllTutors();
    displayRooms();

    schedulesCompleted = true;

    output({type: "success", message: "schedules created!"});
}