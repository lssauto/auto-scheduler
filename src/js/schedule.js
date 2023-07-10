// * schedule class contains a map of days with arrays of time blocks. Each tutor and room will have a schedule.

class Schedule {
    constructor(container) { // container is a back reference to the tutor or room that has the schedule
        this.container = container;
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

    // expects a string formatted as "day(s) HH:MM [AM/PM]" or "day(s) HH:MM [AM/PM] - HH:MM [AM/PM]"
    // course and tag arguments used primarily by tutor schedules for display purposes
    // tutor argument is a string for the tutor's email (key to Tutors map), and is used by room schedules to track which tutor is assigned to the time
    addTime(timeStr, course="COURSE", tag="session", tutor=null) {
        if (timeStr == "N/A") return false;

        // split string at an arbitrary space to prevent days from including the "M" from PM/AM
        let halves = timeStr.split(":");

        let days = halves[0].match(/(M|Tu|W|Th|F|Sat|Sun)/g); // get all days
        let hours = timeStr.match(/[0-9]{1,2}:[0-9]{1,2}[\s]*(AM|PM|am|pm)*/g); // get all hours
        
        // if there are no days, then this is a Sun time
        if (days == null) { days = ["Sun"]; }

        // add AM or PM to first time if it's missing
        if (hours[0].match(/(AM|PM|am|pm)/g) == null) {
            hours[0] += hours[1].match(/(AM|am)/g) == null? "PM" : "AM";
        }
        // console.log(timeStr, days, hours);

        // get int time values
        const start = convertTimeToInt(hours[0]);
        const end = hours.length > 1 ? convertTimeToInt(hours[1]) : start + 60; // add 60 minutes if no second time

        // check if time is valid if it is a session
        if (tag == "session") {
            for (const day of days) {
                if (day == "Sun" || day == "Sat") { continue; }

                // returns true if time is valid, isValidSessionTime() in session-times.js
                if (!isValidSessionTime(day, start)) {
                    return {
                        day: day,
                        time: { tutor: tutor, course: course, tag: tag, start: start, end: end },
                        error: "invalid"
                    };
                }
            }
        }

        // check for overlapping times
        for (let i = 0; i < days.length; i++) {
            for (let j = 0; j < this.week[days[i]].length; j++) {
                if (start >= this.week[days[i]][j].start && start <= this.week[days[i]][j].end) {
                    //console.log("Overlapping time");
                    return {
                        day: days[i],
                        time: { tutor: tutor, course: course, tag: tag, start: start, end: end },
                        error: "conflict"
                    };
                }
                if (end >= this.week[days[i]][j].start && end <= this.week[days[i]][j].end) {
                    //console.log("Overlapping time");
                    return {
                        day: days[i],
                        time: { tutor: tutor, course: course, tag: tag, start: start, end: end },
                        error: "conflict"
                    };
                }
            }
        }

        // add new time to schedule
        for (let day of days) {
            this.week[day].push({
                tutor: tutor, 
                course: course,
                tag: tag,
                start: start,
                end: end
            });
        }

        // sort schedule by start time
        for (let day of days) {
            this.week[day].sort((a, b) => a.start - b.start);
        }

        return null;
    }

    // returns the schedule formatted as a string
    Display(assigned=false) {
        let output = "";

        for (let day in this.week) {
            output += `<b>${day}: |</b>`;

            const times = this.week[day];

            for (let time of times) {
                if (assigned) {
                    if (!("room" in time)) continue;
                }
                
                let body = "";
                if (time.tutor != null) {
                    if (time.tutor in tutors) {
                        body = tutors[time.tutor].name + " / " + time.tutor;
                    } else {
                        body = time.tutor;
                    }
                } else {
                    if ("room" in time) {
                        body = time.course + " / <b>" + time.room + "</b>";
                    } else {
                        body = time.course;
                    }
                }
                output += ` (${body}`;
                output += ` ${time.tag}: ${convertTimeToString(time.start)} - ${convertTimeToString(time.end)}) `;
                output += time == times.at(-1) ? "" : "<b>|</b>";
            }

            output += "<b>|</b></br></br>";
        }

        return output;
    }
}