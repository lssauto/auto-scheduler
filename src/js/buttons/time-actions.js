
function changeTime(email, timeID) {
    if (tutors == null || !(email in tutors)) return;

    let time = tutors[email].schedule.findTimeByID(timeID);
    let isError = false;
    if (time == null) {
        isError = true;
        for (const courseID in tutors[email].courses) {
            const course = tutors[email].courses[courseID];
            for (const error of course.errors) {
                if (error.time.id == timeID) {
                    time = error.time;
                    break;
                }
            }
            if (time != null) break;
        }
        if (time == null) {
            output({type: "error", message: "Time could not be found."});
            return;
        }
    }

    let input = document.getElementById(timeID + "-selection");
    let timeObj = parseTimeStr(input.value);

    if (timeObj == null) {
        output({type: "error", message: "Invalid time format. Follow this format: [M/Tu/W/Th/F/Sat/Sun] ##:## [AM/PM]"});
        return;
    }

    let prevDay = time.day;
    let prevTime = time.getTimeStr();
    
    if (!isError) {
        if (prevDay != timeObj.days[0]) {
            time.schedule.removeTime(prevDay, time.schedule.findTimeIndex(time));
            time.setDay(timeObj.days[0])
                .setStart(timeObj.start)
                .setEnd(timeObj.end);
            time.schedule.pushTime(time);
        } else {
            time.setDay(timeObj.days[0])
                .setStart(timeObj.start)
                .setEnd(timeObj.end);
            time.schedule.week[time.day].sort((a, b) => a.start - b.start);
        }

        if (ScheduledStatus.includes(time.getCourse().status)) {
            time.getCourse().setStatus(StatusOptions.InProgress, false); // false flag to not update tutor display
        }
    } else {
        time.setDay(timeObj.days[0])
            .setStart(timeObj.start)
            .setEnd(timeObj.end);
    }

    updateTutorDisplay(email);

    output({type: "success", message: `changed ${tutors[email].name}'s session time from ${prevTime} to ${time.getTimeStr()}.`});
}