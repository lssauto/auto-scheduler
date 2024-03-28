import { Tutor } from "./tutor";
import { TimeBlock, Tags } from "../schedule/time-block";
import { Position, Positions } from "../positions";
import { Status, StatusOptions } from "../status-options";
import { CourseEditor } from "../elements/editors/course-editor";
import * as timeConvert from "../utils/time-convert.ts";
import { Notify, NotifyEvent } from "../events/notify.ts";
import { VariableElement } from "../events/var-elem.ts";

export interface CourseConfig {
  readonly tutor: Tutor;
  readonly id: string;
  readonly position: Position;
  readonly status: Status;
  readonly preference: string;
  readonly row: number;
  readonly timestamp: string;
  readonly comments: string;
  readonly scheduler: string;
}

export class Course {
  static readonly noPref = "Any Building";

  readonly tutor: Tutor;
  id: string;
  position: Position;
  status: Status;
  preference: string;
  row: number;
  timestamp: number;
  readonly times: Map<Tags, TimeBlock[]>;
  comments: string;
  scheduler: string;

  private _div: HTMLDivElement | null;
  private _divContent: VariableElement | null;

  private onEdited: NotifyEvent = new NotifyEvent("onEdited");
  private onDeleted: NotifyEvent = new NotifyEvent("onDeleted");
  private onErrorsUpdated: NotifyEvent = new NotifyEvent("onErrorsUpdated");

  constructor(tutor: Tutor, id: string) {
    this.tutor = tutor;
    this.id = Course.formatID(id);
    this.position = Positions.defaultPosition;
    this.status = StatusOptions.inProgress;
    this.preference = Course.noPref;
    this.row = 0;
    this.timestamp = 0;
    this.times = new Map<Tags, TimeBlock[]>();
    for (const tag of Object.values(Tags)) {
      this.times.set(tag, []);
    }
    this.comments = "";
    this.scheduler = "";
    this._div = null;
    this._divContent = null;

    this.addErrorsListener(this, () => {
      if (this.times.get(Tags.conflict)!.length > 0) {
        if (!StatusOptions.isErrorStatus(this.status)) {
          this.setStatus(StatusOptions.invalidTimes);
          this.onEditedDispatch();
        }
      } else if (StatusOptions.isErrorStatus(this.status)) {
        this.setStatus(StatusOptions.errorsResolved);
        this.onEditedDispatch();
      }
    });

    tutor.addDeletedListener(this, () => {
      this.onDeletedDispatch();
    });
  }

  setID(id: string) {
    this.id = Course.formatID(id);
    return this;
  }

  setPosition(position: Position): Course {
    this.position = position;
    return this;
  }

  setStatus(status: Status): Course {
    this.status = status;
    if (this._div) {
      this._div.style.backgroundColor = this.status.color.backgroundColor;
      this._div.style.borderColor = this.status.color.borderColor;
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
    this.timestamp = timeConvert.toTimestamp(timestamp);
    return this;
  }

  isOlderThan(timestamp: number | string): boolean {
    if (typeof timestamp === "string") {
      return this.timestamp < timeConvert.toTimestamp(timestamp);
    } else {
      return this.timestamp < timestamp;
    }
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
    this.onErrorsDispatch();
  }

  removeError(time: TimeBlock) {
    const ind = this.times.get(Tags.conflict)!.indexOf(time);
    if (ind === -1) return;
    this.times.get(Tags.conflict)!.splice(ind, 1);
    this.onErrorsDispatch();
  }

  forEachError(action: (error: TimeBlock) => void) {
    this.times.get(Tags.conflict)!.forEach(action);
  }

  getErrors(): TimeBlock[] {
    return this.times.get(Tags.conflict)!;
  }

  hasTime(time: TimeBlock): boolean {
    if (this.times.get(time.tag)!.indexOf(time) !== -1) {
      console.log("found exact time");
      return true;
    }
    for (const t of this.times.get(time.tag)!) {
      if (t.isEqual(time)) {
        console.log("comparison matched");
        return true;
      }
    }
    return false;
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
    if (ind === -1) return;
    this.times.get(time.tag)!.splice(ind, 1);
  }

  getDiv(): HTMLDivElement {
    if (this._div === null) {
      this._div = this.buildDiv();
    }
    return this._div;
  }

  removeDiv() {
    this._div?.remove();
    this._divContent?.destroy();
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
    p.style.margin = "4px";
    p.style.display = "inline-block";
    this._divContent = new VariableElement(p, this.onEdited, () => {
      p.innerHTML = `<b>${this.id}: ${this.position.title}</b> || <b>Status:</b> ${this.status.title} || <b>Bldg Pref:</b> ${this.preference} || </br>`;
      p.innerHTML += `Comments: ${this.comments !== "" ? "</br>" + this.comments : ""}`;
    });
    div.append(p);

    const edit = document.createElement("button");
    edit.style.display = "inline-block";
    edit.style.verticalAlign = "top";
    edit.style.marginLeft = "3px";
    edit.style.marginTop = "4px";
    edit.innerHTML = "Edit";
    edit.addEventListener("click", () => {
      CourseEditor.instance!.editCourse(this.tutor, this);
    });
    div.append(edit);

    const deleteButton = document.createElement("button");
    deleteButton.style.display = "inline-block";
    deleteButton.style.verticalAlign = "top";
    deleteButton.style.marginLeft = "3px";
    deleteButton.style.marginTop = "4px";
    deleteButton.innerHTML = "Delete";
    deleteButton.addEventListener("click", () => {
      this.delete();
    });
    div.append(deleteButton);

    return div;
  }

  update(config: CourseConfig) {
    this.setPosition(config.position)
      .setTimestamp(config.timestamp)
      .setPreference(config.preference)
      .setRow(config.row)
      .setStatus(config.status)
      .setComments(config.comments)
      .setScheduler(config.scheduler);
    
    if (this.id !== config.id) {
      this.setID(config.id);
    }

    this.onEditedDispatch();
  }

  delete() {
    this.removeDiv();
    this.tutor.removeCourse(this.id);
    this.onDeletedDispatch();
  }

  addEditedListener(subscriber: object, action: Notify) {
    this.onEdited.addListener(subscriber, action);
  }

  removeEditedListener(subscriber: object) {
    this.onEdited.removeListener(subscriber);
  }

  onEditedDispatch() {
    this.onEdited.dispatch(this);
  }

  addDeletedListener(subscriber: object, action: Notify) {
    this.onDeleted.addListener(subscriber, action);
  }

  removeDeletedListener(subscriber: object) {
    this.onDeleted.removeListener(subscriber);
  }

  onDeletedDispatch() {
    this.onDeleted.dispatch(this);
  }

  addErrorsListener(subscriber: object, action: Notify) {
    this.onErrorsUpdated.addListener(subscriber, action);
  }

  removeErrorsListener(subscriber: object) {
    this.onErrorsUpdated.removeListener(subscriber);
  }

  onErrorsDispatch() {
    this.onErrorsUpdated.dispatch(this);
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
