import { TutorSchedule } from "./tutor-schedule";
import { Status } from "../status-options";
import { Course } from "./course";
import { ErrorCodes } from "../schedule/schedule";
import { TimeBlock } from "../schedule/time-block";

export class Tutor {
  readonly email: string;
  readonly name: string;
  readonly returnee: boolean;

  readonly schedule: TutorSchedule;

  readonly courses: Map<string, Course>;

  div: HTMLDivElement | null;

  constructor(email: string, name: string, returnee: boolean) {
    this.email = email;
    this.name = name;
    this.returnee = returnee;

    this.schedule = new TutorSchedule(this);

    this.courses = new Map<string, Course>();

    this.div = null;
  }

  addCourse(course: Course) {
    const schedule = this.schedule;

    if (this.courses.has(course.id)) {
      if (this.courses.get(course.id)!.isOlderThan(course)) {
        course.forEachTime(time => {
          schedule.removeTime(time);
        });
      } else {
        return;
      }
    }

    this.courses.set(course.id, course);

    course.forEachTime((time) => {
      const errorCode = schedule.addTime(time);
      if (errorCode !== ErrorCodes.success) {
        course.addError(time);
      }
    });
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
      if (course.errors.length > 0) {
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
    if (this.div === null) {
      this.div = this.buildDiv();
    }
    return this.div;
  }

  private buildDiv(): HTMLDivElement {
    const div = document.createElement("div");

    const title = document.createElement("p");
    title.innerHTML = `<b>Name: ${this.name} ; Email: ${this.email}</b>`;
    div.append(title);
    div.append(document.createElement("br"));

    this.forEachCourse(course => div.append(course.getDiv()));

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
