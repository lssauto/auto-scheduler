
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

    let dropdown = document.getElementById(timeID + "-selection");
    let selection = dropdown.options[dropdown.selectedIndex].value;
    let timeObj = parseTimeStr(selection);

    let prevDay = time.day;
    let prevTime = time.getDayAndStartStr();
    
    if (!isError) {
        if (prevDay != timeObj.days[0]) {
            time.schedule.removeTime(prevDay, time.schedule.findTimeIndex(time));
            time.setDay(timeObj.days[0])
                .setStart(timeObj.start)
                .setEnd(timeObj.end);
            time.schedule.pushTime(time);
            console.log("removed time");
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