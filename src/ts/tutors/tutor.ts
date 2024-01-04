import { TutorSchedule } from "./tutor-schedule";
import { Status } from "../status-options";
import { Course } from "./course";
import { ErrorCodes } from "../schedule/schedule";
import { Tags, TimeBlock, TimeBlockMatcher } from "../schedule/time-block";
import { CourseEditor } from "../elements/editors/course-editor";
import { Days } from "../days";
import { VariableElement } from "../events/var-elem";
import { Notify, NotifyEvent } from "../events/notify";

export class Tutor {
  readonly email: string;
  readonly name: string;
  readonly returnee: boolean;

  readonly schedule: TutorSchedule;

  readonly courses: Map<string, Course>;

  private _div: HTMLDivElement | null;
  private _courseDiv: HTMLDivElement | null;
  private _errorDiv: HTMLDivElement | null;

  private onErrorsUpdated: NotifyEvent = new NotifyEvent("onErrorsUpdated");

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
      if (course.getErrors().length > 0) {
        hasErrors = true;
      }
    });
    return hasErrors;
  }

  forEachError(action: (error: TimeBlock) => void) {
    this.forEachCourse(course => course.forEachError(action));
  }

  setPreference(courseID: string, buildingName: string) {
    this.courses.get(courseID)?.setPreference(buildingName);
  }

  setStatus(courseID: string, status: Status) {
    this.courses.get(courseID)?.setStatus(status);
  }

  forEachCourse(action: (course: Course) => void) {
    this.courses.forEach(action);
  }

  addTime(time: TimeBlock): ErrorCodes {
    return this.schedule.addTime(time);
  }

  hasTime(time: TimeBlock | TimeBlockMatcher): boolean {
    return this.schedule.hasTime(time);
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

    const title = document.createElement("div");
    title.style.marginTop = "5px";
    title.style.fontSize = "1.2em";
    title.innerHTML = `<b>Name: ${this.name} ; Email: ${this.email}</b>`;
    div.append(title);
    div.append(document.createElement("br"));

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

    this._courseDiv = document.createElement("div");
    this.forEachCourse(course => this._courseDiv!.append(course.getDiv()));
    div.append(this._courseDiv);

    div.append(this.schedule.getDiv());

    div.append(document.createElement("br"));

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

  addErrorsListener(subscriber: object, action: Notify) {
    this.onErrorsUpdated.addListener(subscriber, action);
  }

  removeErrorsListener(subscriber: object) {
    this.onErrorsUpdated.removeListener(subscriber);
  }

  onErrorsDispatch() {
    this.onErrorsUpdated.dispatch(this);
  }
}
