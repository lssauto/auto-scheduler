// * checks if a given session time is valid, expects an int

// checks if a given session time is valid, 
// assuming that it is a int converted with convertTimeToInt() in time-convert.js, with day being a string M/Tu/W/Th/F
function isValidSessionTime(day, sessionTime) {
    if (!(day in SessionTimes)) { return false; }

    for (const time of SessionTimes[day]) {
        if (sessionTime == convertTimeToInt(time)) { return true; }
    }

    if ("MW".includes(day)) {
        if (convertTimeToInt("9:00 PM") <= sessionTime || sessionTime <= convertTimeToInt("10:00 PM")) {
            return true;
        }
    } else if ("F".includes(day)) {
        if (convertTimeToInt("5:05 PM") <= sessionTime || sessionTime <= convertTimeToInt("10:00 PM")) {
            return true;
        }
    }

    return false;
}