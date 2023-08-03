// * tutors and rooms map created as global variables for easy access
// * these will contain all the Tutor and Room objects created in parse.js,
// * and will be used to create complete schedules in build-schedules.js

let scheduler = null;

let tutors = null;
let tutorJSONObjs = null;
let tutorMatrix = null;
let responseColumnTitles = null;
let expectedTutors = null;
let rooms = null;
let requestRooms = null;
let buildings = null;
let schedulesCompleted = false;

// * Column titles in form table, matched based on str including one of these keys, all keys are lowercase

const Titles = {
    Timestamp: "timestamp",
    Email: "email address",
    Name: "your name",
    Resubmission: "resubmission",
    Returnee: "have you worked for lss",
    CourseID: "what class are you submitting this availability form for",
    Position: "lss position",
    Lectures: "class meeting days and times",
    OfficeHours: "office hours",
    Discord: "discord support",
    Comments: "anything else you want to let lss know?",
    SessionOption: "session option",
    Scheduler: "scheduler",
    Status: "status"
}

const RoomResponse = {
    ScheduleByLSS: "lss will book me space",
    ScheduleByTutor: "i'll book my own space",
    AssignedToTutor: "scheduled by tutor"
}

NA = "N/A"; // in case this changes for some reason

const Positions = {
    LGT: "LGT",
    SGT: "SGT"
}

const PositionSessionLimit = {

}

// * Status Values

const StatusOptions = {
    PastSubmission: "Past Submission",
    WrongCourse: "Incorrect Course ID or Position",
    SchedulingError: "Invalid Time or Conflicts",
    Missing: "Email Not In Expected Tutors List",
    InProgress: "Scheduling In Progress",
    SessionsScheduled: "Sessions Scheduled",
    ScheduleConfirmed: "Schedule Confirmed"
}

// used to check for valid status options in parse.js
const StatusList = [];
for (const status in StatusOptions) {
    StatusList.push(StatusOptions[status]);
}

// used for styling, class names for css
const StatusClass = {};
StatusClass[StatusOptions.PastSubmission] = "old";
StatusClass[StatusOptions.WrongCourse] = "wrong-course";
StatusClass[StatusOptions.SchedulingError] = "scheduling-error";
StatusClass[StatusOptions.Missing] = "missing";
StatusClass[StatusOptions.InProgress] = "in-progress";
StatusClass[StatusOptions.SessionsScheduled] = "scheduled";
StatusClass[StatusOptions.ScheduleConfirmed] = "confirmed";


// arrays for .includes(), used to check if a status is part of a group of statuses
const ErrorStatus = [
    StatusOptions.WrongCourse,
    StatusOptions.SchedulingError,
    StatusOptions.Missing
]

const FinishedStatus = [
    StatusOptions.SessionsScheduled,
    StatusOptions.ScheduleConfirmed
]

// * Time Tags

const Tags = {
    Session: "session",
    Lecture: "lecture",
    OfficeHours: "office-hours",
    Discord: "discord support"
}

const Errors = {
    Conflict: "conflict",
    Invalid: "invalid",
    Replaced: "replaced",
    Overbooked: "over-booked",
    Formatting: "formatting"
}