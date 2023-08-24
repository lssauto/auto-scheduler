// * specific scheduling strategies
// specific schedulers expect 3 arguments: 
// the Tutor instance the Time belongs to,
// the Time instance to schedule, 
// and the session count for the associated course

// * =====================================================================
// default strategy

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

    // check if another tutor in the same position supporting the same course already has that time
    for (const email of positionsMap[course.position]) {
        if (email == tutor.email) continue;

        const otherTutor = tutors[email];
        const day = otherTutor.schedule.week[session.day];
        for (let i = 0; i < day.length; i++) {
            if (day[i].tag != Tags.Session) continue;
            if (day[i].course != session.course) continue;
            
            if (day[i].start == session.start && day[i].hasRoomAssigned()) {
                console.log("Time taken by another tutor: " + email);
                return NO_SESSION;
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

// * =====================================================================

// * =====================================================================
// writing tutor strategy

function writingScheduler(tutor, session, sessionCount) {
    if (sessionCount > PositionSessionLimit[session.getCourse().position]) return NO_SESSION;

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
    // for (const email of positionsMap[Positions.WR]) {
    //     if (email == tutor.email) continue;

    //     const otherTutor = tutors[email];
    //     const day = otherTutor.schedule.week[session.day];
    //     for (let i = 0; i < day.length; i++) {
    //         if (day[i].tag != Tags.Session) continue;
    //         if (day[i].start == session.start && day[i].hasRoomAssigned()) {
    //             console.log("Time taken by another tutor: " + email);
    //             return NO_SESSION;
    //         }
    //     }
    // }

    let course = session.getCourse();

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

    console.log("Tutor Scheduling Session: " + session.getDayAndStartStr());
    session.setRoom(FixedRooms.TutorScheduled);
    return TUTOR_SCHEDULED;
}

// * =====================================================================

// * =====================================================================
// study hall strategy

// function studyHallScheduler(tutor, session, sessionCount) {
//     const studyHallTutors = positionsMap[Positions.SH];

    
// }