// * Valid Session Times according to https://registrar.ucsc.edu/soc/archive/html/fall2020/schedule_planner1.pdf
// ! should be put in a JSON file and then fetched, but this is easier

const sessionTimes = {
    "MWF": [
        "8:00 AM",
        "9:20 AM",
        "10:40 AM",
        "12:00 PM",
        "1:20 PM",
        "2:40 PM",
        "4:00 PM",
        "5:20 PM",
        "7:10 PM"
    ],
    "TuTh": [
        "8:00 AM",
        "9:50 AM",
        "11:40 AM",
        "1:30 PM",
        "3:20 PM",
        "5:20 PM",
        "7:10 PM"
    ]
}

// * checks if a given session time is valid, can receive an integer or a string

// checks if a given session time is valid, 
// assuming that it is a int converted with convertTimeToInt() in time-convert.js, with day being a string M/Tu/W/Th/F
function isValidSessionTime(day, sessionTime) {
    if ("MWF".includes(day)) {
        const times = sessionTimes["MWF"];
        for (let time of times) {
            if (sessionTime == convertTimeToInt(time)) { return true; }
        }
    } else if ("TuTh".includes(day)) {
        const times = sessionTimes["TuTh"];
        for (let time of times) {
            if (sessionTime == convertTimeToInt(time)) { return true; }
        }
    }

    return false;
}