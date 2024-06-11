import "../css/style.css";
import { Content } from "./elements/content/content";
import { CourseEditor } from "./elements/editors/course-editor";
import { TimeEditor } from "./elements/editors/time-editor";
import { BuildingEditor } from "./elements/editors/building-editor";
import { HeaderFactory } from "./elements/header/header-factory";
import { Rooms } from "./rooms/rooms";
import { Tutors } from "./tutors/tutors";
import { Messages } from "./elements/messages/messages";
import { ParserMenu } from "./parsers/parser-menu";
import { ResponseTableMaker } from "./table-makers/response-maker";
import { SchedulerName } from "./elements/header/scheduler-name";

document.title = "LSS Auto Scheduler";

const body = document.getElementById("body")!;
body.style.fontFamily = `Gotham, "Helvetica Neue", Helvetica, Arial, "sans-serif"`;
body.style.backgroundColor = "#E9E9E9";
body.style.margin = "0px";
body.style.width = "100%";
body.style.height = "100%";
body.style.position = "fixed";
body.style.left = "0px";
body.style.top = "0px";

SchedulerName.getName();

const tutors = new Tutors();
const rooms = new Rooms();

const header = HeaderFactory.buildHeader();

const content = new Content();
new Messages();

const timeEditor = new TimeEditor();

const courseEditor = new CourseEditor();

const buildingEditor = new BuildingEditor();

new ParserMenu();

new ResponseTableMaker();

console.log(tutors);
console.log(rooms);
console.log(header);
console.log(content);
console.log(timeEditor);
console.log(courseEditor);
console.log(buildingEditor);

// import { Tutor } from "./tutors/tutor";
// import { Tags, TimeBlock } from "./schedule/time-block";
// import { Days } from "./days";
// import * as timeConvert from "./utils/time-convert";
// import { Course } from "./tutors/course";
// import { Positions } from "./positions";
// import { StatusOptions } from "./status-options";
// import { Room } from "./rooms/room";

// const tutor1 = new Tutor("billy@ucsc.edu", "Billy Bob", true);
// tutor1.addCourse(Course.buildCourse({
//     tutor: tutor1,
//     id: "CSE 101-02",
//     position: Positions.lgt,
//     status: StatusOptions.inProgress,
//     preference: Course.noPref,
//     row: 0,
//     timestamp: timeConvert.stampToStr(1),
//     zoomLink: "abcd",
//     comments: "",
//     scheduler: "tony"
// }));
// tutors.addTutor(tutor1);

// tutor1.addTime(TimeBlock.buildTimeBlock({
//     coords: {row: -1, col: -1},
//     tag: Tags.session,
//     day: Days.sun,
//     start: timeConvert.strToInt("1:00PM"),
//     end: timeConvert.strToInt("2:00PM"),
//     scheduleByLSS: false,
//     isVirtual: true,
//     tutorEmail: tutor1.email,
//     roomName: null,
//     courseID: "CSE 101-002"
// }));

// tutor1.addTime(TimeBlock.buildTimeBlock({
//     coords: {row: -1, col: -1},
//     tag: Tags.session,
//     day: Days.fri,
//     start: timeConvert.strToInt("12:00PM"),
//     end: timeConvert.strToInt("1:00PM"),
//     scheduleByLSS: true,
//     isVirtual: true,
//     tutorEmail: tutor1.email,
//     roomName: null,
//     courseID: "CSE 101-002"
// }));

// tutor1.addTime(TimeBlock.buildTimeBlock({
//     coords: {row: -1, col: -1},
//     tag: Tags.session,
//     day: Days.wed,
//     start: timeConvert.strToInt("12:00PM"),
//     end: timeConvert.strToInt("1:00PM"),
//     scheduleByLSS: true,
//     isVirtual: true,
//     tutorEmail: tutor1.email,
//     roomName: null,
//     courseID: "CSE 101-002"
// }));

// const room1 = new Room("ARC 116 - Small");
// rooms.addRoom(room1);

// const encoding = ResponseTableMaker.encodeTutor(tutor1);
// console.log(encoding);

// console.log(ResponseTableMaker.decodeTutor(encoding));
// console.log(tutor1);