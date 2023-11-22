import "../css/style.css";
import { Content } from "./elements/content/content";
import { HeaderFactory } from "./elements/header/header-factory";
import { Rooms } from "./rooms/rooms";
import { Tutors } from "./tutors/tutors";

document.title = "LSS Auto Scheduler";

const tutors = new Tutors();
const rooms = new Rooms();

const header = HeaderFactory.buildHeader();
const content = new Content();

console.log(tutors);
console.log(rooms);
console.log(header);
console.log(content);