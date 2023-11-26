import { Tutor } from "./tutor";
import { TimeBlock, Tags } from "../schedule/time-block";
import { Position, Positions } from "../positions";
import { Status, StatusOptions } from "../status-options";

interface CourseConfig {
  tutor: Tutor;
  id: string;
  position: Position;
  status: Status;
  preference: string;
  row: number;
  timestamp: string;
  errors: TimeBlock[];
  lectures: TimeBlock[];
  officeHours: TimeBlock[];
  discordHours: TimeBlock[];
  sessions: TimeBlock[];
  comments: string;
}

export class Course {
  tutor: Tutor;
  id: string;
  position: Position;
  status: Status;
  preference: string;

  static readonly noPref = "Any Building";

  row: number;

  timestamp: number;
  errors: TimeBlock[];
  lectures: TimeBlock[];
  officeHours: TimeBlock[];
  discordHours: TimeBlock[];
  sessions: TimeBlock[];
  comments: string;

  scheduler: string;

  div: HTMLDivElement | null;

  constructor(tutor: Tutor, id: string) {
    this.tutor = tutor;
    this.id = Course.formatID(id);
    this.position = Positions.defaultPosition;
    this.status = StatusOptions.inProgress;
    this.preference = Course.noPref;
    this.row = 0;
    this.timestamp = 0;
    this.errors = [];
    this.lectures = [];
    this.officeHours = [];
    this.discordHours = [];
    this.sessions = [];
    this.comments = "";
    this.scheduler = "";
    this.div = null;
  }

  setPosition(position: Position): Course {
    this.position = position;
    return this;
  }

  setStatus(status: Status): Course {
    this.status = status;
    return this;
  }

  setPreference(preference: string): Course {
    this.preference = preference;
    return this;
  }

  setRow(row: number): Course {
    this.row = row;
    return this;
  }

  setTimestamp(timestamp: string): Course {
    const dateObject = new Date(timestamp);
    this.timestamp = dateObject.getTime(); // convert to milliseconds for comparison
    return this;
  }

  isOlderThan(course: Course): boolean {
    return this.timestamp < course.timestamp;
  }

  setComments(comments: string): Course {
    this.comments = comments;
    return this;
  }

  setScheduler(scheduler: string): Course {
    this.scheduler = scheduler;
    return this;
  }

  addError(time: TimeBlock) {
    this.errors.push(time);
  }

  forEachError(action: (error: TimeBlock) => void) {
    this.errors.forEach(action);
  }

  addLecture(time: TimeBlock) {
    if (time.tag !== Tags.lecture) {
      console.error("non-lecture time added to lecture array for: " + this.tutor.name + ", " + this.id);
      return;
    }
    this.lectures.push(time);
  }

  addOfficeHours(time: TimeBlock) {
    if (time.tag !== Tags.officeHours) {
      console.error("non-office hours time added to lecture array for: " + this.tutor.name + ", " + this.id);
      return;
    }
    this.officeHours.push(time);
  }

  addDiscordHours(time: TimeBlock) {
    if (time.tag !== Tags.discord) {
      console.error("non-discord time added to lecture array for: " + this.tutor.name + ", " + this.id);
      return;
    }
    this.discordHours.push(time);
  }

  addSession(time: TimeBlock) {
    if (time.tag !== Tags.session) {
      console.error("non-session time added to lecture array for: " + this.tutor.name + ", " + this.id);
      return;
    }
    this.sessions.push(time);
  }

  forEachTime(action: (time: TimeBlock) => void) {
    this.lectures.forEach(action);
    this.officeHours.forEach(action);
    this.discordHours.forEach(action);
    this.sessions.forEach(action);
  }

  getDiv(): HTMLDivElement {
    if (this.div === null) {
      this.div = this.buildDiv();
    }
    return this.div;
  }

  private buildDiv(): HTMLDivElement {
    const div = document.createElement("div");
    div.style.display = "inline-block";
    div.style.padding = "7px";
    div.style.borderStyle = "solid";
    div.style.borderWidth = "1px";
    div.style.margin = "3px";
    div.style.marginRight = "20px";
    div.style.borderRadius = "5px";

    const p = document.createElement("p");
    p.innerHTML = `<b>${this.id}: ${this.position.title}</b> || ${this.status.title} || ${this.preference}</br>`;
    p.innerHTML += `Comments: ${this.comments}`;
    div.append(p);

    //TODO: add edit course button

    return div;
  }

  // statics =================================

  static buildCourse(config: CourseConfig): Course {
    const newCourse = new Course(config.tutor, config.id);
    newCourse.setPosition(config.position)
      .setTimestamp(config.timestamp)
      .setPosition(config.position)
      .setPreference(config.preference)
      .setRow(config.row)
      .setStatus(config.status)
      .setComments(config.comments);
    
      config.errors.forEach(error => newCourse.addError(error));
      config.lectures.forEach(lecture => newCourse.addLecture(lecture));
      config.officeHours.forEach(office => newCourse.addOfficeHours(office));
      config.discordHours.forEach(discord => newCourse.addDiscordHours(discord));
      config.sessions.forEach(session => newCourse.addSession(session));

      return newCourse;
  }

  static readonly na = "N/A";

  // ensures that course IDs follow specific formatting so that they can be matched against each other
  static formatID(courseStr: string): string {
    let courseId: string = courseStr.trim();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    courseId = courseId.replaceAll("–", "-"); // replace strange hyphen characters with dashes

    if (courseId === "" || courseId === Course.na) return Course.na; // if position is courseless

    const departments = courseId.match(/[A-Z]{2,4}/g);
    const sections = courseId.match(
      /[0-9]{1,3}[A-Z]*([\s]*-[\s]*([0-9]{1,3}|\(All Sections\)))?/g
    );

    if (departments === null || sections === null) {
      return Course.na;
    }

    let course = "";
    for (let i = 0; i < sections.length; i++) {
      if (i > 0) course += "/";

      course += departments[i] + " ";

      const courseNums = sections[i].split("-");

      course += courseNums[0].trim().replace(/^0+/, "") + "-";

      if (courseNums.length == 1) {
        course += "001";
      } else if (courseNums[1].match(/[a-z]/g) !== null) {
        // if the section # contains letters, it's "All Sections"
        course += "(All Sections)";
      } else {
        courseNums[1] = courseNums[1].trim();
        course += "0".repeat(3 - courseNums[1].length) + courseNums[1];
      }
    }

    return course;
  }
}
