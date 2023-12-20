import { Tutor } from "./tutor";
import { TimeBlock, Tags } from "../schedule/time-block";
import { Position, Positions } from "../positions";
import { Status, StatusOptions } from "../status-options";
import { CourseEditor } from "../elements/editors/course-editor";

interface CourseConfig {
  tutor: Tutor;
  id: string;
  position: Position;
  status: Status;
  preference: string;
  row: number;
  timestamp: string;
  errors: TimeBlock[];
  times: TimeBlock[];
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

  readonly times: Map<Tags, TimeBlock[]>;
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
    this.times = new Map<Tags, TimeBlock[]>();
    for (const tag in Tags) {
      this.times.set(tag as Tags, []);
    }
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
    if (this.div) {
      this.div.style.backgroundColor = this.status.color.backgroundColor;
      this.div.style.borderColor = this.status.color.borderColor;
    }
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
    this.times.get(Tags.conflict)!.push(time);
  }

  forEachError(action: (error: TimeBlock) => void) {
    this.times.get(Tags.conflict)!.forEach(action);
  }

  getErrors(): TimeBlock[] {
    return this.times.get(Tags.conflict)!;
  }

  addTime(time: TimeBlock) {
    this.times.get(time.tag)!.push(time);
  }

  forEachTime(tag: Tags, action: (time: TimeBlock) => void) {
    this.times.get(tag)!.forEach(action);
  }

  forEveryTime(action: (time: TimeBlock) => void) {
    this.times.forEach((times) => {
      times.forEach(action);
    });
  }

  removeTime(time: TimeBlock) {
    const ind = this.times.get(time.tag)!.indexOf(time);
    this.times.get(time.tag)!.splice(ind, 1);
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
    div.style.backgroundColor = this.status.color.backgroundColor;
    div.style.borderColor = this.status.color.borderColor;

    const p = document.createElement("p");
    p.style.display = "inline-block";
    p.innerHTML = `<b>${this.id}: ${this.position.title}</b> || Status: ${this.status.title} || Building Preference: ${this.preference} || </br>`;
    p.innerHTML += `Comments: ${this.comments}`;
    div.append(p);

    const edit = document.createElement("button");
    edit.style.display = "inline-block";
    edit.style.verticalAlign = "top";
    edit.style.marginLeft = "3px";
    edit.style.marginTop = "15px";
    edit.innerHTML = "Edit";
    edit.addEventListener("click", () => {
      CourseEditor.instance!.editCourse(this.tutor, this);
    });
    div.append(edit);

    const deleteButton = document.createElement("button");
    deleteButton.style.display = "inline-block";
    deleteButton.style.verticalAlign = "top";
    deleteButton.style.marginLeft = "3px";
    deleteButton.style.marginTop = "15px";
    deleteButton.innerHTML = "Delete";
    deleteButton.addEventListener("click", () => {
      console.log("delete course");
    });
    div.append(deleteButton);

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
      config.times.forEach(time => newCourse.addTime(time));

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
      } else if (courseNums[1].match(/(All Sections|all sections)/g) !== null) {
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
