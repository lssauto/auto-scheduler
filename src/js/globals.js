/* 
    Contains all enums and globally accessible objects. 
    Most HTML elements are global variables declared separately in elements.js.
*/

// # ================================================================
// # ENUMS

// Enums used primarily for string comparisons.

// Column titles in form table. Matched based on str including one of these keys, all keys are lowercase.
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

// Fixed responses for room selection. Matched based on str including one of these keys, all keys are lowercase.
const RoomResponse = {
    ScheduleByLSS: "lss will book me space",
    ScheduleByTutor: "i'll book my own space",
    AssignedToTutor: "scheduled by tutor"
};

const NA = "N/A"; // in case this changes for some reason

// * Positions ==============================================================

// Used to match position titles from table data, titles are set to lower case.
// ? matched using matchPosition() in match-pos.js
const PositionKeys = {
    LGT: "large",
    SGT: "small",
    ELGT: "embedded large",
    ESGT: "embedded small",
    SI: "si leader",
    WR: "writing individual"
};

// Valid positions, used as keys for other enums.
const Positions = {
    LGT: "LGT",
    SGT: "SGT",
    ELGT: "EMB LGT",
    ESGT: "EMB SGT",
    SI: "SI",
    WR: "Writing"
};

const DefaultPosition = Positions.SGT;

// any positions that don't expect course IDs, course ID is replaced with "N/A"
const CourselessPositions = [
    Positions.WR
]

const SelfSchedulable = [
    Positions.SGT,
    Positions.ESGT,
    Positions.WR
]

// max sessions for each position
const PositionSessionLimit = {};
PositionSessionLimit[Positions.LGT]  = 3;
PositionSessionLimit[Positions.SGT]  = 3;
PositionSessionLimit[Positions.ELGT] = 3;
PositionSessionLimit[Positions.ESGT] = 3;
PositionSessionLimit[Positions.SI]   = 3;
PositionSessionLimit[Positions.WR]   = 8;

// once number of sessions reaches this limit, any more sessions will be registrar requests
const PositionRequestLimit = {};
PositionRequestLimit[Positions.LGT]  = 2;
PositionRequestLimit[Positions.SGT]  = 3;
PositionRequestLimit[Positions.ELGT] = 2;
PositionRequestLimit[Positions.ESGT] = 3;
PositionRequestLimit[Positions.SI]   = 2;

// * Scheduler Strategies ================================================

// specific scheduler strategies to be used for each position
// ? Options: defaultScheduler, writingScheduler
const ScheduleBuilders = {};
ScheduleBuilders[Positions.LGT]  = defaultScheduler;
ScheduleBuilders[Positions.SGT]  = defaultScheduler;
ScheduleBuilders[Positions.ELGT] = defaultScheduler;
ScheduleBuilders[Positions.ESGT] = defaultScheduler;
ScheduleBuilders[Positions.SI]   = defaultScheduler;
ScheduleBuilders[Positions.WR]   = writingScheduler;

// returned by specific schedulers, tells main buildSchedules() function how to update session counts
const NO_SESSION = 0;
const REQUEST = 1;
const SCHEDULED = 2;
const TUTOR_SCHEDULED = 3;

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
RoomPositionFilter[Positions.LGT] = [Positions.LGT, Positions.SI, Positions.ELGT];
RoomPositionFilter[Positions.SGT] = [Positions.SGT, Positions.ESGT, Positions.WR];
RoomPositionFilter[Positions.SI] = [Positions.SI];
RoomPositionFilter[Positions.WR] = [Positions.WR];

// * Status Values ===========================================================

// Used to match status options from table data, statuses are set to lower case.
const StatusKeys = {
    PastSubmission: "past",
    WrongCourse: "incorrect",
    SchedulingError: "invalid",
    Missing: "expected",
    ErrorsResolved: "resolved",
    InProgress: "in progress",
    SessionsScheduled: "scheduled",
    SlackNote: "slack",
    CalendarPosted: "calendar",
    TutorHubPosted: "tutorhub",
    ScheduleConfirmed: "confirmed"
}

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
StatusClass[StatusOptions.SlackNote] = "posted";
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

// * Valid Session Times according to https://registrar.ucsc.edu/soc/archive/html/fall2020/schedule_planner1.pdf
const SessionTimes = {
    "M": [
        {start: "8:00 AM", end: "9:05 AM"},
        {start: "9:20 AM", end: "10:25 AM"},
        {start: "10:40 AM", end: "11:45 AM"},
        {start: "12:00 PM", end: "1:05 PM"},
        {start: "1:20 PM", end: "2:25 PM"},
        {start: "2:40 PM", end: "3:45 PM"},
        {start: "4:00 PM", end: "5:05 PM"},
        {start: "5:20 PM", end: "6:55 PM"},
        {start: "7:10 PM", end: "8:45 PM"},
        {start: "9:00 PM", end: "10:00 PM"}
    ],
    "Tu": [
        {start: "8:00 AM", end: "9:35 AM"},
        {start: "9:50 AM", end: "11:25 AM"},
        {start: "11:40 AM", end: "1:15 PM"},
        {start: "1:30 PM", end: "3:05 PM"},
        {start: "3:20 PM", end: "4:55 PM"},
        {start: "5:20 PM", end: "6:55 PM"},
        {start: "7:10 PM", end: "8:45 PM"}
    ],
    "W": [
        {start: "8:00 AM", end: "9:05 AM"},
        {start: "9:20 AM", end: "10:25 AM"},
        {start: "10:40 AM", end: "11:45 AM"},
        {start: "12:00 PM", end: "1:05 PM"},
        {start: "1:20 PM", end: "2:25 PM"},
        {start: "2:40 PM", end: "3:45 PM"},
        {start: "4:00 PM", end: "5:05 PM"},
        {start: "5:20 PM", end: "6:55 PM"},
        {start: "7:10 PM", end: "8:45 PM"},
        {start: "9:00 PM", end: "10:00 PM"}
    ],
    "Th": [
        {start: "8:00 AM", end: "9:35 AM"},
        {start: "9:50 AM", end: "11:25 AM"},
        {start: "11:40 AM", end: "1:15 PM"},
        {start: "1:30 PM", end: "3:05 PM"},
        {start: "3:20 PM", end: "4:55 PM"},
        {start: "5:20 PM", end: "6:55 PM"},
        {start: "7:10 PM", end: "8:45 PM"}
    ],
    "F": [
        {start: "8:00 AM", end: "9:05 AM"},
        {start: "9:20 AM", end: "10:25 AM"},
        {start: "10:40 AM", end: "11:45 AM"},
        {start: "12:00 PM", end: "1:05 PM"},
        {start: "1:20 PM", end: "2:25 PM"},
        {start: "2:40 PM", end: "3:45 PM"},
        {start: "4:00 PM", end: "5:05 PM"},
        {start: "5:05 PM", end: "10:00 PM"}
    ],
    "Sun": [
        {start: "8:00 AM", end: "9:00 AM"},
        {start: "9:00 AM", end: "10:00 AM"},
        {start: "10:00 AM", end: "11:00 AM"},
        {start: "11:00 AM", end: "12:00 PM"},
        {start: "12:00 PM", end: "1:00 PM"},
        {start: "1:00 PM", end: "2:00 PM"},
        {start: "2:00 PM", end: "3:00 PM"},
        {start: "3:00 PM", end: "4:00 PM"},
        {start: "4:00 PM", end: "5:00 PM"},
        {start: "5:00 PM", end: "6:00 PM"},
        {start: "6:00 PM", end: "7:00 PM"},
        {start: "7:00 PM", end: "8:00 PM"},
        {start: "8:00 PM", end: "9:00 PM"},
        {start: "9:00 PM", end: "10:00 PM"}
    ]
}

// # =================================================================
// # GLOBALS

// The name of scheduler, assigned when user fills in their name.
let scheduler = null;

let tutorPositions = null;
let tutors = null;

// Map of positions containing Arrays of emails. Organizes Tutors by position.
let positionsMap = {};
for (const key in Positions) {
    positionsMap[Positions[key]] = [];
}

// Array of any tutor emails that have building preferences.
// Used to schedule tutors with preferences first.
let preferenceList = [];

/*
    Array of objects created by buildTutorJSON() function.
    Used to make creating Tutor instances easier, 
    and for reconstructing input table in copyTutorTable() function.
*/
let tutorJSONObjs = [];

/*
    Matrix containing original tutor response table.
    Used for reconstructing input table in copyTutorTable() function.
 */
let tutorMatrix = [];

/*
    Array of the titles used to determine how responses 
    should be interpreted in buildTutorJSON() function.
*/
let responseColumnTitles = [];

let buildings = null;
let rooms = null;

// Room instances are specifically to represent any buildings that require registrar requests.
let requestRooms = null;

// Set true once buildSchedules() has been run.
let schedulesCompleted = false;

// toggles verbose output to in-app console
let verbose = false;