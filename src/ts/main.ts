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
