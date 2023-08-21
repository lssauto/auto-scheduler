// * checks if a given session time is valid, can receive an integer or a string

// checks if a given session time is valid, 
// assuming that it is a int converted with convertTimeToInt() in time-convert.js, with day being a string M/Tu/W/Th/F
function isValidSessionTime(day, sessionTime) {
    if ("MW".includes(day)) {
        const times = SessionTimes["MW"];
        for (const time of times) {
            if (sessionTime == convertTimeToInt(time)) { return true; }
        }
        if (convertTimeToInt("9:00 PM") <= sessionTime || sessionTime <= convertTimeToInt("10:00 PM")) {
            return true;
        }
    } else if ("F".includes(day)) {
        const times = SessionTimes["F"];
        for (const time of times) {
            if (sessionTime == convertTimeToInt(time)) { return true; }
        }
        if (convertTimeToInt("5:05 PM") <= sessionTime || sessionTime <= convertTimeToInt("10:00 PM")) {
            return true;
        }
    } else if ("TuTh".includes(day)) {
        const times = SessionTimes["TuTh"];
        for (const time of times) {
            if (sessionTime == convertTimeToInt(time)) { return true; }
        }
    }

    return false;
}