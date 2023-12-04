import "../css/style.css";
import { Content } from "./elements/content/content";
import { TimeEditor } from "./elements/editors/time-editor";
import { HeaderFactory } from "./elements/header/header-factory";
import { Room } from "./rooms/room";
import { Rooms } from "./rooms/rooms";
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
tutors.addTutor(tutor1);

const room1 = new Room("ARC 221 - Large");
rooms.addRoom(room1);

const timeEditor = new TimeEditor();

console.log(tutors);
console.log(rooms);
console.log(header);
console.log(content);
console.log(timeEditor);
