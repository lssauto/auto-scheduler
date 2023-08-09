// * tutors and rooms map created as global variables for easy access
// * these will contain all the Tutor and Room objects created in parse.js,
// * and will be used to create complete schedules in build-schedules.js

let scheduler = null;

let tutors = null;
let preferenceList = [];
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
};

const RoomResponse = {
    ScheduleByLSS: "lss will book me space",
    ScheduleByTutor: "i'll book my own space",
    AssignedToTutor: "scheduled by tutor"
};

const NA = "N/A"; // in case this changes for some reason

// * Positions ==============================================================

// used to match position titles from table data, titles are set to lower case
const PositionKeys = {
    LGT: "large",
    SGT: "small",
    SI: "si",
    WR: "writing",
    SH: "study hall"
};

const Positions = {
    LGT: "LGT",
    SGT: "SGT",
    SI: "SI",
    WR: "Writing",
    SH: "Study Hall"
};

// map of positions to contain tutor emails
let positionsMap = {};
for (const key in Positions) {
    positionsMap[Positions[key]] = [];
}

const DefaultPosition = Positions.SGT;

// any positions that don't expect course IDs, course ID is replaced with "N/A"
const CourselessPositions = [
    Positions.WR,
    Positions.SH
]

// max sessions for each position
const PositionSessionLimit = {};
PositionSessionLimit[Positions.LGT] = 5;
PositionSessionLimit[Positions.SGT] = 4;
PositionSessionLimit[Positions.SI] = 5;
PositionSessionLimit[Positions.WR] = 5;
PositionSessionLimit[Positions.SH] = 2;

// once number of sessions reaches this limit, any more sessions will be registrar requests
const PositionRequestLimit = {};
PositionRequestLimit[Positions.LGT] = 3;
PositionRequestLimit[Positions.SGT] = 3;
PositionRequestLimit[Positions.SI] = 3;

// * Rooms ===================================================================

const FixedRooms = {
    TutorScheduled: "Scheduled By Tutor",
    Request: "Request From Registrar",
    SpecificRequest: "Request Room In ", // building name expected to be concat to end of str
    Discord: "Discord Time"
}

// used to determine if a tutor's position allows them to be scheduled in that room
// key is the type of the room, and the value is a list of acceptable tutor positions
const RoomPositionFilter = {};
RoomPositionFilter[Positions.LGT] = [Positions.LGT, Positions.SI, Positions.SH];
RoomPositionFilter[Positions.SGT] = [Positions.SGT];
RoomPositionFilter[Positions.SI] = [Positions.SI];
RoomPositionFilter[Positions.WR] = [Positions.WR];
RoomPositionFilter[Positions.SH] = [Positions.SH];

// * Status Values ===========================================================

const StatusOptions = {
    PastSubmission: "Past Submission",
    WrongCourse: "Incorrect Course ID or Position",
    SchedulingError: "Invalid Time or Conflicts",
    Missing: "Email Not In Expected Tutors List",
    ErrorsResolved: "All Errors Resolved",
    InProgress: "Scheduling In Progress",
    SessionsScheduled: "Sessions Scheduled",
    SlackNote: "Slack Note Sent",
    CalendarPosted: "Posted On Calendar",
    TutorHubPosted: "Posted On TutorHub",
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
StatusClass[StatusOptions.ErrorsResolved] = "in-progress";
StatusClass[StatusOptions.InProgress] = "in-progress";
StatusClass[StatusOptions.SessionsScheduled] = "scheduled";
StatusClass[StatusOptions.SlackNote] = "scheduled";
StatusClass[StatusOptions.CalendarPosted] = "posted";
StatusClass[StatusOptions.TutorHubPosted] = "posted";
StatusClass[StatusOptions.ScheduleConfirmed] = "confirmed";


// arrays for .includes(), used to check if a status is part of a group of statuses
const ProgressStatus = [
    StatusOptions.ErrorsResolved,
    StatusOptions.InProgress
]

const ErrorStatus = [
    StatusOptions.WrongCourse,
    StatusOptions.SchedulingError,
    StatusOptions.Missing
]

const ScheduledStatus = [
    StatusOptions.SessionsScheduled,
    StatusOptions.SlackNote,
    StatusOptions.CalendarPosted,
    StatusOptions.TutorHubPosted,
    StatusOptions.ScheduleConfirmed
]

const FinishedStatus = [
    StatusOptions.ScheduleConfirmed
]

// * Time Tags ===========================================================

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

// * Scheduler Strategies ================================================

// specific scheduler strategies to be used for each position
// ? Options: defaultScheduler, writingScheduler, studyHallScheduler
const ScheduleBuilders = {};
ScheduleBuilders[Positions.LGT] = defaultScheduler;
ScheduleBuilders[Positions.SGT] = defaultScheduler;
ScheduleBuilders[Positions.SI] = defaultScheduler;
ScheduleBuilders[Positions.WR] = writingScheduler;
ScheduleBuilders[Positions.SH] = studyHallScheduler;

// returned by specific schedulers, tells main buildSchedules() function how to update session counts
const NO_SESSION = 0;
const REQUEST = 1;
const SCHEDULED = 2;
const TUTOR_SCHEDULED = 3;