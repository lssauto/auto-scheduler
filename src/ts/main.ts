import "../css/style.css";
import { Content } from "./elements/content/content";
import { CourseEditor } from "./elements/editors/course-editor";
import { TimeEditor } from "./elements/editors/time-editor";
import { BuildingEditor } from "./elements/editors/building-editor";
import { HeaderFactory } from "./elements/header/header-factory";
import { Positions } from "./positions";
import { Room } from "./rooms/room";
import { Rooms } from "./rooms/rooms";
import { StatusOptions } from "./status-options";
import { Course } from "./tutors/course";
import { Tutor } from "./tutors/tutor";
import { Tutors } from "./tutors/tutors";
import { Messages } from "./elements/messages/messages";
import { ParserMenu } from "./parsers/parser-menu";
import { ResponseTableMaker } from "./table-makers/response-maker";
import { isValidSessionTime } from "./utils/session-times";
import { Days } from "./days";
import * as timeConvert from "./utils/time-convert";

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

const tutors = new Tutors();
const rooms = new Rooms();

const header = HeaderFactory.buildHeader();
const content = new Content();
new Messages();

const tutor1 = new Tutor("billyb@ucsc.edu", "Billy Bob", true);
tutor1.addCourse(
  Course.buildCourse({
    tutor: tutor1,
    id: "CSE 101-001",
    position: Positions.sgt,
    status: StatusOptions.inProgress,
    preference: Course.noPref,
    row: 1,
    timestamp: "28/2023 16:44:53",
    comments: "",
  })
);
tutors.addTutor(tutor1);

const tutor2 = new Tutor("sammy@ucsc.edu", "Sammy Slug", true);
tutor2.addCourse(
  Course.buildCourse({
    tutor: tutor1,
    id: "BIOL 45-002",
    position: Positions.lgt,
    status: StatusOptions.inProgress,
    preference: Course.noPref,
    row: 1,
    timestamp: "28/2023 16:44:53",
    comments: "",
  })
);
tutors.addTutor(tutor2);

const room1 = new Room("ARC 221 - Large");
rooms.addRoom(room1);

const timeEditor = new TimeEditor();

const courseEditor = new CourseEditor();

const buildingEditor = new BuildingEditor();

new ParserMenu();

new ResponseTableMaker();

console.log(Positions.match("ARC"));

console.log(tutors);
console.log(rooms);
console.log(header);
console.log(content);
console.log(timeEditor);
console.log(courseEditor);
console.log(buildingEditor);


console.log(isValidSessionTime({
  day: Days.tue, 
  start: timeConvert.strToInt("11:40 AM"), 
  end: timeConvert.strToInt("12:40 PM")
}));