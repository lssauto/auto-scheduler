// * tutors and rooms map created as global variables for easy access
// * these will contain all the Tutor and Room objects created in parse.js,
// * and will be used to create complete schedules in build-schedules.js

let tutors = null;
let expectedTutors = null;
let rooms = null;
let buildings = null;
let schedulesCompleted = false;

const StatusOptions = {
    PastSubmission: "Past Submission",
    WrongCourse: "Incorrect Course ID or Position",
    SchedulingError: "Invalid Time or Conflicts",
    Missing: "Email Not In Expected Tutors List",
    InProgress: "Scheduling In Progress",
    SessionsScheduled: "Sessions Scheduled",
    ScheduleConfirmed: "Schedule Confirmed"
}

const ErrorStatus = [
    StatusOptions.WrongCourse,
    StatusOptions.SchedulingError,
    StatusOptions.Missing
]

const FinishedStatus = [
    StatusOptions.SessionsScheduled,
    StatusOptions.ScheduleConfirmed
]

// * console div used to output diagnostic messages
let consoleDiv;
const consoleColors = { // use to set the color of the console messages based on message type
    error: "red",
    warning: "orange",
    info: "#2343A0",
    success: "green"
}

// * message is expected to be an object with at least a type field
function output(msg) {
    let str = "<p style='background-color: " + consoleColors[msg.type] + "'>";
    for (let key in msg) {
        str += key + ": " + msg[key] + "<br>";
    }
    str += "</p>";
    consoleDiv.innerHTML += str;

    // resize header
    contentDiv.style.paddingTop = headerDiv.clientHeight + "px";
}

function clearConsole() {
    consoleDiv.innerHTML = "";

    // resize header
    contentDiv.style.paddingTop = headerDiv.clientHeight + "px";
}

let hidden = false;
function hideConsole() {
    let button = document.getElementById("ConsoleHideButton");
    if (!hidden) {
        consoleDiv.style.display = "none";
        hidden = true;
        button.innerHTML = "Show Console";
    } else {
        consoleDiv.style.display = "block";
        hidden = false;
        button.innerHTML = "Hide Console";
    }
    // resize header
    contentDiv.style.paddingTop = headerDiv.clientHeight + "px";
}