// * schedule class contains a map of days with arrays of time blocks. Each tutor and room will have a schedule.

class Schedule {
    constructor(container) { // container is a back reference to the tutor or room that has the schedule
        this.container = container;
        this.range = null;
        this.week = {
            "M": [],
            "Tu": [],
            "W": [],
            "Th": [],
            "F": [],
            "Sat": [],
            "Sun": []
        }
    }

    setRange(range) {
        this.range = range;
        return this;
    }

    // expects a string formatted as "day(s) HH:MM [AM/PM]" or "day(s) HH:MM [AM/PM] - HH:MM [AM/PM]"
    // course and tag arguments used primarily by tutor schedules for display purposes
    // tutor argument is a string for the tutor's email (key to Tutors map), and is used by room schedules to track which tutor is assigned to the time
    addTime(timeStr, course="COURSE", tag="session", tutor=null, scheduleByLSS=true) {
        if (timeStr == NA) return false;

        let timeObj = parseTimeStr(timeStr);
        if (timeObj == null) {
            let errorTime = new Time(this);
            errorTime.setTutor(tutor)
                .setCourse(course)
                .setTag(tag)
                .setScheduleByLSS(scheduleByLSS);
            return {
                time: errorTime,
                error: Errors.Formatting
            }
        }

        const days = timeObj.days;
        const start = timeObj.start;
        const end = timeObj.end;

        // check if time is within the room's valid time range
        if (this.container instanceof Room && this.range != null) {
            for (const day of days) {
                let matches = false;
                for (const validDay of this.range.days) {
                    if (day == validDay) {
                        matches = true;
                        break;
                    }
                }
                if (!matches) {
                    let errorTime = new Time(this);
                    errorTime.setTutor(tutor)
                        .setCourse(course)
                        .setTag(tag)
                        .setDay(day)
                        .setStart(start)
                        .setEnd(end)
                        .setScheduleByLSS(scheduleByLSS);
                    return {
                        time: errorTime,
                        error: Errors.Invalid
                    };
                }
            }

            if (start < this.range.start || this.range.end < end) {
                let errorTime = new Time(this);
                errorTime.setTutor(tutor)
                    .setCourse(course)
                    .setTag(tag)
                    .setStart(start)
                    .setEnd(end)
                    .setScheduleByLSS(scheduleByLSS);
                return {
                    time: errorTime,
                    error: Errors.Invalid
                };
            }
        }

        // check if time is valid if it is a session and schedule is for a tutor
        if (this.container instanceof Tutor && tag == Tags.Session) {
            for (const day of days) {
                if (day == "Sun" || day == "Sat") { continue; }

                // returns true if time is valid, isValidSessionTime() in session-times.js
                if (!isValidSessionTime(day, start)) {
                    let errorTime = new Time(this);
                    errorTime.setTutor(tutor)
                        .setCourse(course)
                        .setTag(tag)
                        .setDay(day)
                        .setStart(start)
                        .setEnd(end)
                        .setScheduleByLSS(scheduleByLSS);
                    return {
                        time: errorTime,
                        error: Errors.Invalid
                    };
                }
            }
        }

        // check for overlapping times
        for (let i = 0; i < days.length; i++) {
            const dayName = days[i];

            for (let j = 0; j < this.week[dayName].length; j++) {
                let day = this.week[dayName];

                if (day[j].conflictsWith({start: start, end: end})) {
                    let errorTime = new Time(this);
                    errorTime.setTutor(tutor)
                        .setCourse(course)
                        .setTag(tag)
                        .setDay(dayName)
                        .setStart(start)
                        .setEnd(end)
                        .setScheduleByLSS(scheduleByLSS);

                    // if this is the same session time for the same tutor, just replace it
                    if (this.container instanceof Room && day[j].isEqual(errorTime)) {
                        day[j] = errorTime;
                        return {
                            time: day[j],
                            error: Errors.Replaced
                        };
                    }

                    return {
                        time: errorTime,
                        error: Errors.Conflict
                    };
                    
                }
            }
        }
        
        // add new times
        for (let day of days) {
            let newTime = new Time(this);
            newTime.setTutor(tutor)
                .setCourse(course)
                .setTag(tag)
                .setDay(day)
                .setStart(start)
                .setEnd(end)
                .setScheduleByLSS(scheduleByLSS);
            
            // check if day has too many sessions already for room schedules
            if (this.container instanceof Room && tag == Tags.Session && this.week[day].length >= 4) {
                return {
                    time: newTime,
                    error: Errors.Overbooked
                };
            }

            // add new time to schedule
            this.week[day].push(newTime);

            this.week[day].sort((a, b) => a.start - b.start);
        }

        return null;
    }

    pushTime(time) {
        let newTime = time.makeCopy();
        newTime.setSchedule(this).setContainer(this.container);
        this.week[newTime.day].push(newTime);
        this.week[newTime.day].sort((a, b) => a.start - b.start);
        return newTime;
    }

    // returns the time that was removed
    removeTime(day, i) {
        i = parseInt(i, 10); // make sure i is a number, not a str
        if (day in this.week && i in this.week[day]) {
            return this.week[day].splice(i, 1)[0];
        }
        return null
    }

    findTimeIndex(givenTime) {
        for (let i = 0;  i < this.week[givenTime.day].length; i++) {
            let time = this.week[givenTime.day][i];
            if (time.isEqual(givenTime)) {
                return i;
            }
        }
        return null;
    }

    // expects string formatted as "DAY ##:## AM/PM"
    findTimeByStr(timeStr, tag="session") {
        let timeObj = parseTimeStr(timeStr);
        if (timeObj == null) return null;
        const day = timeObj.days[0];

        for (const time of this.week[day]) {
            if (timeObj.start == time.start && timeObj.end == time.end && time.tag == tag) {
                return time;
            }
        }
        return null;
    }

    // returns the schedule formatted as a string
    display() {
        let output = "";

        for (let day in this.week) {
            output += `<b>${day}:</b></br>`;

            const times = this.week[day];

            for (let i = 0; i < times.length; i++) {
                const time = times[i];

                // if displaying schedule for tutor with assigned sessions
                if (this.container instanceof Tutor && ScheduledStatus.includes(this.container.courses[time.course].status)) {
                    if (!time.hasRoomAssigned()) continue;
                }

                let confirmed = time.getCourse().status == StatusOptions.ScheduleConfirmed;
                let tag = confirmed ? "confirmed" : time.tag;

                output += `<div class='time ${tag}'>|` + ` (${time.getFullStr()}) `;
                output += "|";

                // remove time button
                if (!confirmed) {
                    output += ` <button type='submit' onclick="removeTime(`;
                    if (this.container instanceof Room) {
                        output += `'${this.container.name}', `;
                    } else {
                        output += `'${this.container.email}', `;
                    }
                    output += `'${day}', ${i})">Remove</button>`;
                }
                

                output += "</div></br>";
            }

            output += "</br></br>";
        }

        return output;
    }

    // return a string representation of the schedule that will paste into a spreadsheet
    copy(assigned=false) {
        let output = "";

        for (let day in this.week) {
            output += day + "\t";

            const times = this.week[day];

            for (let time of times) {
                if (assigned) {
                    if (!(time.hasRoomAssigned())) continue;
                }
                
                let body = "";
                if (this.container instanceof Room) {
                    if (tutors != null && time.tutor in tutors) {
                        body = time.course + " , " + time.getTutor().name + " (" + time.tutor + ") , ";
                    } else {
                        body = time.course + " , " + " (" + time.tutor + ") , ";
                    }
                } else {
                    if (time.hasRoomAssigned()) {
                        body = time.course + " , " + time.room + " , ";
                    } else {
                        body = time.course;
                    }
                }
                output += body;
                output += `${time.getStartToEndStr()}\t`;
            }

            output += "\n";
        }

        return output;
    }
}