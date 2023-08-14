// * checks if a given session time is valid, can receive an integer or a string

// checks if a given session time is valid, 
// assuming that it is a int converted with convertTimeToInt() in time-convert.js, with day being a string M/Tu/W/Th/F
function isValidSessionTime(day, sessionTime) {
    if ("MWF".includes(day)) {
        const times = SessionTimes["MWF"];
        for (let time of times) {
            if (sessionTime == convertTimeToInt(time)) { return true; }
        }
    } else if ("TuTh".includes(day)) {
        const times = SessionTimes["TuTh"];
        for (let time of times) {
            if (sessionTime == convertTimeToInt(time)) { return true; }
        }
    }

    return false;
}