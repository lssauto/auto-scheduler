import { Tutor } from "./tutor";
import { TimeBlock, Tags } from "../schedule/time-block";
import { Position, Positions } from "../positions";
import { Status, StatusOptions } from "../status-options";
import { CourseEditor } from "../elements/editors/course-editor";
import * as timeConvert from "../utils/time-convert.ts";
import { Notify, NotifyEvent } from "../events/notify.ts";
import { VariableElement } from "../events/var-elem.ts";

/**
 * Config object used for building and updating courses.
 */
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

/**
 * Owned by tutors, represents each position a tutor holds.
 */
export class Course {
  /**
   * Set to a course's building preference to signify the tutor has no preference
   * where the session is scheduled.
   */
  static readonly noPref = "Any Building";

  readonly tutor: Tutor;
  id: string;
  position: Position;
  status: Status;
  preference: string;
  row: number; // might not be needed anymore
  timestamp: number;
  readonly times: Map<Tags, TimeBlock[]>; // maps times by tags instead of days, idk why I did that
  comments: string;
  scheduler: string;

  // HTML elements
  private _div: HTMLDivElement | null;
  private _divContent: VariableElement | null;

  // events
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

    // init times with all of the tags
    this.times = new Map<Tags, TimeBlock[]>();
    for (const tag of Object.values(Tags)) {
      this.times.set(tag, []);
    }

    this.comments = "";
    this.scheduler = "";
    this._div = null;
    this._divContent = null;

    this.addErrorsListener(this, () => {
      // if there are errors, change the status
      if (this.times.get(Tags.conflict)!.length > 0) {
        if (!StatusOptions.isErrorStatus(this.status)) {
          this.setStatus(StatusOptions.invalidTimes);
          this.onEditedDispatch();
        }

      // if there are no errors, change the status
      } else if (StatusOptions.isErrorStatus(this.status)) {
        this.setStatus(StatusOptions.errorsResolved);
        this.onEditedDispatch();
      }
    });

    // delete this course if its tutor is deleted
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
    // if the course is scheduled, but is set back to in-progress,
    // remove all room assignments from its sessions
    if (StatusOptions.isScheduledStatus(this.status) && !StatusOptions.isScheduledStatus(status)) {
      for (const time of this.times.get(Tags.session)!) {
        time.roomSchedule?.removeTime(time);
        time.onEditedDispatch();
      }
    }

    this.status = status;

    // update the course's styling to match the status
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

  /**
   * Expects a timestamp string in the same format used by the google form response table.
   * Convert a timestamp int to this format using `timeConvert.stampToStr(stampInt)`.
   */
  setTimestamp(timestamp: string): Course {
    this.timestamp = timeConvert.stampToInt(timestamp);
    return this;
  }

  /**
   * Returns true if the given timestamp is older than this course's timestamp.
   */
  isOlderThan(timestamp: number | string): boolean {
    if (typeof timestamp === "string") {
      return this.timestamp < timeConvert.stampToInt(timestamp);
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
    // do not remove anything if the time doesn't exist in the errors list
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

  /**
   * Returns true if the course has a given time. This is done by both 
   * reference comparison, and field matching with `timeBlock.isEqual(other)`.
   */
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

  /**
   * For each time of a specific tag.
   */
  forEachTime(tag: Tags, action: (time: TimeBlock) => void) {
    this.times.get(tag)!.forEach(action);
  }

  /**
   * For all the times associated with this course.
   */
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
    // styling
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

    // content
    const p = document.createElement("p");
    p.style.margin = "4px";
    p.style.display = "inline-block";
    this._divContent = new VariableElement(p, this.onEdited, () => {
      p.innerHTML = `<b>${this.id}: ${this.position.title}</b> || <b>Status:</b> ${this.status.title} || <b>Bldg Pref:</b> ${this.preference} || </br>`;
      p.innerHTML += `Comments: ${this.comments !== "" ? "</br>" + this.comments : ""}`;
    });
    div.append(p);

    // edit button
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

    // delete button
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

  /**
   * Updates a course's properties. Triggers an onEdited event.
   */
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

  // events

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

  /**
   * "N/A" course id used to signal the course doesn't exist, or couldn't be 
   * formatted properly.
   */
  static readonly na = "N/A";

  /**
   * Ensures that course IDs follow specific formatting 
   * so that they can be matched against each other.
   * Returns `Course.na` if the ID given couldn't be formatted properly.
   */
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
