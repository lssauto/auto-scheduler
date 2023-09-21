// * checks if a given session time is valid, expects an int

// checks if a given session time is valid, 
// assuming that it is a int converted with convertTimeToInt() in time-convert.js, with day being a string M/Tu/W/Th/F
function isValidSessionTime(day, sessionTime) {
    if (!(day in SessionTimes)) { return false; }

    let sessionEnd = sessionTime + 60;
    for (const time of SessionTimes[day]) {
        let timeBlockStart = convertTimeToInt(time.start);
        let timeBlockEnd = convertTimeToInt(time.end);
        if (timeBlockStart <= sessionTime && sessionEnd <= timeBlockEnd) { 
            return true; 
        }
    }

    return false;
}