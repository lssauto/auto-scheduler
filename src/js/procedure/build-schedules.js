// * Assign rooms to tutor's requested session times
function buildSchedules() {
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