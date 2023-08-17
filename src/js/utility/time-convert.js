// * utility function to convert individual times to an integer representation to make comparison easier

// * times given as "HH:MM [AM/PM]" are converted to an integer representing the number of minutes
// * from midnight. This means all times will be between 0 (12:00 AM) and 1439 (11:59 PM).

// ! does not work for times from 12:00 AM to 12:59 AM, this is left unfixed since it's not a valid time
function convertTimeToInt(time) {
    time = time.toUpperCase();

    const [hours, minutes] = time.split(":");
    let totalMinutes = parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    if (time.includes("PM") && hours !== "12") {
        totalMinutes += 12 * 60; // Add 12 hours if it's PM (except for 12pm)
    }

    return totalMinutes;
}

// convert an integer representation of a time to a string "HH:MM [AM/PM]"
function convertTimeToString(time) {
    const hours = Math.floor(time / 60);
    const mins = time % 60;

    let formattedHours = hours % 12;
    if (formattedHours === 0) {
        formattedHours = 12;
    }

    const ampm = hours < 12 ? "AM" : "PM";

    const formattedTime = `${formattedHours}:${mins.toString().padStart(2, "0")} ${ampm}`;
    return formattedTime;
}

function parseTimeStr(timeStr, dayDefault=["Sun"]) {
    // split string at an arbitrary space to prevent days from including the "M" from PM/AM
    let halves = timeStr.split(":");

    let days = halves[0].match(/(M|Tu|W|Th|F|Sat|Sun)/g); // get all days
    let hours = timeStr.match(/[0-9]{1,2}:[0-9]{1,2}[\s]*(AM|PM|am|pm)*/g); // get all hours

    if (hours == null) return null;
    
    // if there are no days, then this is a Sun time
    if (days == null) { days = dayDefault; }

    // add AM or PM to first time if it's missing
    if (hours[0].match(/(AM|PM|am|pm)/g) == null) {
        if (hours[1].split(":")[0].trim() == "12") {
            hours[0] += hours[1].match(/(AM|am)/g) == null ? "AM" : "PM";
        } else {
            hours[0] += hours[1].match(/(AM|am)/g) == null ? "PM" : "AM";
        }
    }

    // get int time values
    const start = convertTimeToInt(hours[0]);
    const end = hours.length > 1 ? convertTimeToInt(hours[1]) : start + 60; // add 60 minutes if no second time

    return {
        days: days,
        start: start,
        end: end
    }
}