import { TutorSchedule } from "./tutor-schedule";
import { Status, StatusOptions } from "../status-options";
import { Course } from "./course";
import { ErrorCodes } from "../schedule/schedule";
import { Tags, TimeBlock, TimeBlockMatcher } from "../schedule/time-block";
import { CourseEditor } from "../elements/editors/course-editor";
import { Days } from "../days";
import { VariableElement } from "../events/var-elem";
import { Notify, NotifyEvent } from "../events/notify";
import { Position } from "../positions";
import { Tutors } from "./tutors";

/**
 * Contains info about a tutor. Mapped by email in the Tutors list.
 */
export class Tutor {

  /**
   * Special room name used to indicate that the session is scheduled by the tutor.
   */
  static readonly tutorScheduled = "Scheduled By Tutor";

  readonly email: string;
  readonly name: string;
  readonly returnee: boolean;

  readonly schedule: TutorSchedule;

  readonly courses: Map<string, Course>;

  // HTML elements
  private _div: HTMLDivElement | null;
  private _courseDiv: HTMLDivElement | null;
  private _errorDiv: HTMLDivElement | null;

  // events
  private onErrorsUpdated: NotifyEvent = new NotifyEvent("onErrorsUpdated");
  private onDeleted: NotifyEvent = new NotifyEvent("onDeleted");

  constructor(email: string, name: string, returnee: boolean) {
    this.email = email;
    this.name = name;
    this.returnee = returnee;

    this.schedule = new TutorSchedule(this);

    this.courses = new Map<string, Course>();

    this._div = null;
    this._courseDiv = null;
    this._errorDiv = null;
  }

  addCourse(course: Course) {
    const schedule = this.schedule;

    // replace a course if it's an older submission
    if (this.courses.has(course.id)) {
      if (this.courses.get(course.id)!.isOlderThan(course.timestamp)) {
        this.courses.get(course.id)!.forEveryTime(time => {
          schedule.removeTime(time);
        });
        this.courses.get(course.id)!.removeDiv();
      } else {
        return;
      }
    }

    this.courses.set(course.id, course);
    this._courseDiv?.append(course.getDiv());

    course.addErrorsListener(this, () => {
      this.onErrorsDispatch();
    });
    course.addDeletedListener(this, () => {
      course.removeErrorsListener(this);
    });
  }

  /**
   * Sets a course in the tutor's courses map. Used to avoid the other 
   * state updates in `addCourse()`.
   */
  setCourse(course: Course) {
    this.courses.set(course.id, course);
  }

  removeCourse(courseId: string) {
    this.courses.delete(courseId);
  }

  getCourse(courseId: string): Course | undefined {
    return this.courses.get(courseId);
  }

  hasCourse(courseId: string): boolean {
    return this.courses.has(courseId);
  }

  /**
   * Returns true if this tutor has any course with a zoom link assigned.
   */
  hasZoomLinks(): boolean {    
    for (const courseID of this.courses.keys()) {      
      if (this.courses.get(courseID)!.zoomLink !== "") {
        return true;
      }
    }
    return false;
  }

  /**
   * Searches for given position in all of this tutor's courses.
   */
  hasPosition(position: Position): boolean {
    for (const courseID of this.courses.keys()) {
      if (this.courses.get(courseID)!.position === position) {
        return true;
      }
    }
    return false;
  }

  /**
   * Collects all errors from this tutor.
   */
  getErrors(): TimeBlock[] {
    const errors: TimeBlock[] = [];
    this.forEachCourse(course => {
      course.forEachError(error => errors.push(error));
    });
    return errors;
  }

  addError(time: TimeBlock) {
    this.getCourse(time.courseID ?? Course.na)?.addError(time);
    this._errorDiv?.append(time.getTutorDiv());
  }

  hasErrors(): boolean {
    let hasErrors = false;
    this.forEachCourse(course => {
      if (course.getErrors().length > 0 || StatusOptions.isErrorStatus(course.status)) {
        hasErrors = true;
      }
    });
    return hasErrors;
  }

  forEachError(action: (error: TimeBlock) => void) {
    this.forEachCourse(course => course.forEachError(action));
  }

  // course wrappers

  setPreference(courseID: string, buildingName: string) {
    this.courses.get(courseID)?.setPreference(buildingName);
  }

  setStatus(courseID: string, status: Status) {
    this.courses.get(courseID)?.setStatus(status);
  }

  forEachCourse(action: (course: Course) => void) {
    this.courses.forEach(action);
  }

  // schedule wrappers

  addTime(time: TimeBlock): ErrorCodes {
    return this.schedule.addTime(time);
  }

  hasTime(time: TimeBlock | TimeBlockMatcher): boolean {
    return this.schedule.hasTime(time);
  }

  forEachTime(action: (time: TimeBlock) => void) {
    this.schedule.forEachTime(action);
  }

  findTime(time: {
    courseID: string,
    tag: Tags,
    day: Days,
    start: number,
    end: number,
    roomName: string | null,
    tutorEmail: string | null
  }): TimeBlock | null {
    return this.schedule.findTime(time);
  }

  get scheduleIsEmpty(): boolean {
    return this.schedule.isEmpty;
  }

  getDiv(): HTMLDivElement {
    if (this._div === null) {
      this._div = this.buildDiv();
    }
    return this._div;
  }

  private buildDiv(): HTMLDivElement {
    const div = document.createElement("div");
    div.style.borderTop = "1px solid black";
    div.style.borderBottom = "1px solid black";
    div.style.paddingTop = "5px";
    div.style.paddingBottom = "5px";
    
    // name and email
    const title = document.createElement("div");
    title.style.marginTop = "5px";
    title.style.fontSize = "1.2em";
    title.innerHTML = `<b>Name: ${this.name} ; Email: ${this.email}</b>`;
    div.append(title);
    div.append(document.createElement("br"));

    // add course button
    const addCourse = document.createElement("button");
    addCourse.style.backgroundColor = "#f8f8f8";
    addCourse.style.border = "1px solid #565656";
    addCourse.style.borderRadius = "2px";
    addCourse.addEventListener("mouseover", () => {
      addCourse.style.backgroundColor = "#e8e8e8";
    });
    addCourse.addEventListener("mouseout", () => {
      addCourse.style.backgroundColor = "#f8f8f8";
    });
    addCourse.innerHTML = "AddCourse";
    addCourse.addEventListener("click", () => {
      CourseEditor.instance!.createNewCourse(this);
    });
    div.append(addCourse);

    // courses cards
    this._courseDiv = document.createElement("div");
    this.forEachCourse(course => this._courseDiv!.append(course.getDiv()));
    div.append(this._courseDiv);

    // schedule div
    div.append(this.schedule.getDiv());

    div.append(document.createElement("br"));

    // errors list
    this._errorDiv = document.createElement("div");
    this._errorDiv.style.marginTop = "5px";
    this._errorDiv.style.marginBottom = "5px";
    const errorsTitle = document.createElement("b");
    new VariableElement(errorsTitle, this.onErrorsUpdated, () => {
      if (this.hasErrors()) {
        errorsTitle.innerHTML = "Errors:";
      } else {
        errorsTitle.innerHTML = `${this.name} Has No Errors`;
      }
    });
    this._errorDiv.append(errorsTitle);
    this.forEachError(error => this._errorDiv!.append(error.getTutorDiv()));
    div.append(this._errorDiv);

    return div;
  }

  hideDiv() {
    if (this._div) {
      this._div.style.display = "none";
    }
  }

  showDiv() {
    if (this._div) {
      this._div.style.display = "block";
    }
  }

  // events

  addErrorsListener(subscriber: object, action: Notify) {
    this.onErrorsUpdated.addListener(subscriber, action);
  }

  removeErrorsListener(subscriber: object) {
    this.onErrorsUpdated.removeListener(subscriber);
  }

  onErrorsDispatch() {
    this.onErrorsUpdated.dispatch(this);
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

  delete() {
    this._div?.remove();
    Tutors.instance?.removeTutor(this);
    this.onDeletedDispatch();
  }
}
