import "../css/style.css";
import { Content } from "./elements/content/content";
import { CourseEditor } from "./elements/editors/course-editor";
import { TimeEditor } from "./elements/editors/time-editor";
import { HeaderFactory } from "./elements/header/header-factory";
import { Positions } from "./positions";
import { Room } from "./rooms/room";
import { Rooms } from "./rooms/rooms";
import { StatusOptions } from "./status-options";
import { Course } from "./tutors/course";
import { Tutor } from "./tutors/tutor";
import { Tutors } from "./tutors/tutors";

document.title = "LSS Auto Scheduler";

const body = document.getElementById("body")!;
body.style.fontFamily = `Gotham, "Helvetica Neue", Helvetica, Arial, "sans-serif"`;

const tutors = new Tutors();
const rooms = new Rooms();

const header = HeaderFactory.buildHeader();
const content = new Content();

const tutor1 = new Tutor("billyb@ucsc.edu", "Billy Bob", true);
tutor1.addCourse(Course.buildCourse({
    tutor: tutor1,
    id: "CSE 101-001",
    position: Positions.sgt,
    status: StatusOptions.inProgress,
    preference: Course.noPref,
    row: 1,
    timestamp: "28/2023 16:44:53",
    errors: [],
    times: [],
    comments: ""
}));
tutors.addTutor(tutor1);

const room1 = new Room("ARC 221 - Large");
rooms.addRoom(room1);

const timeEditor = new TimeEditor();

const courseEditor = new CourseEditor();

console.log(tutors);
console.log(rooms);
console.log(header);
console.log(content);
console.log(timeEditor);
console.log(courseEditor);
