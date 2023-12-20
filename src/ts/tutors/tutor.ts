import { TutorSchedule } from "./tutor-schedule";
import { Status } from "../status-options";
import { Course } from "./course";
import { ErrorCodes } from "../schedule/schedule";
import { TimeBlock } from "../schedule/time-block";
import { CourseEditor } from "../elements/editors/course-editor";

export class Tutor {
  readonly email: string;
  readonly name: string;
  readonly returnee: boolean;

  readonly schedule: TutorSchedule;

  readonly courses: Map<string, Course>;

  private _div: HTMLDivElement | null;
  private _courseDiv: HTMLDivElement | null;

  constructor(email: string, name: string, returnee: boolean) {
    this.email = email;
    this.name = name;
    this.returnee = returnee;

    this.schedule = new TutorSchedule(this);

    this.courses = new Map<string, Course>();

    this._div = null;
    this._courseDiv = null;
  }

  addCourse(course: Course) {
    const schedule = this.schedule;

    if (this.courses.has(course.id)) {
      if (this.courses.get(course.id)!.isOlderThan(course)) {
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

    course.forEveryTime((time) => {
      const errorCode = schedule.addTime(time);
      if (errorCode !== ErrorCodes.success) {
        course.addError(time);
      }
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
    title.innerHTML = `<b>Name: ${this.name} ; Email: ${this.email}</b>`;
    div.append(title);
    div.append(document.createElement("br"));

    const addCourse = document.createElement("button");
    addCourse.innerHTML = "AddCourse";
    addCourse.addEventListener("click", () => {
      CourseEditor.instance!.createNewCourse(this);
    });
    div.append(addCourse);

    this._courseDiv = document.createElement("div");
    this.forEachCourse(course => this._courseDiv!.append(course.getDiv()));
    div.append(this._courseDiv);

    div.append(this.schedule.getDiv());

    const errors = document.createElement("div");
    const errorsTitle = document.createElement("b");
    if (this.hasErrors()) {
      errorsTitle.innerHTML = "Errors:";
      errors.append(errorsTitle);
      this.forEachError(error => errors.append(error.getTutorDiv()));
    } else {
      errorsTitle.innerHTML = `${this.name} Has No Errors`;
      errors.append(errorsTitle);
    }
    div.append(errors);

    return div;
  }
}
