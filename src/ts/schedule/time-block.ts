import * as timeConvert from "../utils/time-convert";
import { Days } from "../days";
import { Tutors } from "../tutors/tutors";
import { Tutor } from "../tutors/tutor";
import { Rooms } from "../rooms/rooms";
import { Room } from "../rooms/room";
import { Course } from "../tutors/course";
import { TutorSchedule } from "../tutors/tutor-schedule";
import { RoomSchedule } from "../rooms/room-schedule";
import { TimeEditor } from "../elements/editors/time-editor";
import { ErrorCodes, Schedule } from "./schedule";
import { Notify, NotifyEvent } from "../events/notify";
import { VariableElement } from "../events/var-elem";

export enum Tags {
  session = "session",
  lecture = "lecture",
  officeHours = "office-hours",
  discord = "discord-support",
  conflict = "conflict",
  reserve = "reservation",
}

export const tagColors = new Map<
  Tags,
  { backgroundColor: string; borderColor: string }
>();
tagColors.set(Tags.session, {
  backgroundColor: "#A4D0F1",
  borderColor: "#2583C7",
});
tagColors.set(Tags.lecture, {
  backgroundColor: "#FFBEEC",
  borderColor: "#A83E89",
});
tagColors.set(Tags.officeHours, {
  backgroundColor: "#CEB6EB",
  borderColor: "#753ABC",
});
tagColors.set(Tags.discord, {
  backgroundColor: "#EBD5B6",
  borderColor: "#F39B1E",
});
tagColors.set(Tags.conflict, {
  backgroundColor: "#E6BBC1",
  borderColor: "#D31F38",
});
tagColors.set(Tags.reserve, {
  backgroundColor: "#a3f0e9",
  borderColor: "#569c96",
});

export interface TimeBlockConfig {
  readonly coords: { row: number; col: number };
  readonly tag: Tags;
  readonly day: Days;
  readonly start: number;
  readonly end: number;
  readonly scheduleByLSS: boolean;
  readonly tutorEmail: string | null;
  readonly roomName: string | null;
  readonly courseID: string | null;
}

export interface TimeBlockMatcher {
  readonly tag: Tags;
  readonly day: Days;
  readonly start: number;
  readonly end: number;
  readonly courseID: string | null;
  readonly tutorEmail: string | null;
  readonly roomName: string | null;
}

export class TimeBlock {
  tutorSchedule: TutorSchedule | null;
  roomSchedule: RoomSchedule | null;
  coords: { row: number; col: number };

  tag: Tags;
  error: ErrorCodes;
  day: Days;
  start: number;
  end: number;
  scheduleByLSS: boolean;

  tutorEmail: string | null;
  roomName: string | null;
  courseID: string | null;

  tutorDiv: HTMLDivElement | null;
  tutorDivContent: VariableElement | null;
  roomDiv: HTMLDivElement | null;
  roomDivContent: VariableElement | null;

  onEdited: NotifyEvent = new NotifyEvent("onEdited");
  onDeleted: NotifyEvent = new NotifyEvent("onDeleted");

  constructor() {
    this.coords = {row: -1, col: -1};
    this.tag = Tags.reserve;
    this.day = Days.mon;
    this.start = 0;
    this.end = 0;
    this.scheduleByLSS = true;
    this.tutorSchedule = null;
    this.roomSchedule = null;
    this.error = ErrorCodes.success;
    this.tutorEmail = null;
    this.roomName = null;
    this.courseID = null;
    this.tutorDiv = null;
    this.tutorDivContent = null;
    this.roomDiv = null;
    this.roomDivContent = null;
  }

  setCoords(row: number, col: number): TimeBlock {
    this.coords = { row: row, col: col };
    return this;
  }

  setTag(tag: Tags): TimeBlock {
    this.tag = tag;
    let colors: {backgroundColor: string, borderColor: string};
    if (this.hasError()) {
      colors = tagColors.get(Tags.conflict)!;
    } else {
      colors = tagColors.get(this.tag)!;
    }
    if (this.tutorDiv) {
      this.tutorDiv.style.backgroundColor = colors.backgroundColor;
      this.tutorDiv.style.borderColor = colors.borderColor;
    }
    if (this.roomDiv) {
      this.roomDiv.style.backgroundColor = colors.backgroundColor;
      this.roomDiv.style.borderColor = colors.borderColor;
    }
    return this;
  }

  setError(error: ErrorCodes): TimeBlock {
    this.error = error;
    let colors: {backgroundColor: string, borderColor: string};
    if (this.hasError()) {
      colors = tagColors.get(Tags.conflict)!;
      this.setRoom(null);
    } else {
      colors = tagColors.get(this.tag)!;
    }
    if (this.tutorDiv) {
      this.tutorDiv.style.backgroundColor = colors.backgroundColor;
      this.tutorDiv.style.borderColor = colors.borderColor;
    }
    if (this.roomDiv) {
      this.roomDiv.style.backgroundColor = colors.backgroundColor;
      this.roomDiv.style.borderColor = colors.borderColor;
    }
    return this;
  }

  hasError(): boolean {
    return this.error !== ErrorCodes.success;
  }

  setDay(day: Days): TimeBlock {
    this.day = day;
    return this;
  }

  setStart(start: number): TimeBlock {
    this.start = start;
    return this;
  }

  setEnd(end: number): TimeBlock {
    this.end = end;
    return this;
  }

  setScheduleByLSS(scheduleByLSS: boolean): TimeBlock {
    this.scheduleByLSS = scheduleByLSS;
    return this;
  }

  setTutor(tutorEmail: string | null): TimeBlock {
    if (tutorEmail && tutorEmail !== this.tutorEmail) {
      const tutor = Tutors.instance!.getTutor(tutorEmail);
      this.tutorSchedule = tutor?.schedule ?? null;
      
    } else if (tutorEmail === null) {
      this.tutorDivContent?.destroy();
      this.tutorDiv?.remove();
      this.tutorDiv = null;
      this.tutorSchedule = null;
      if (this.roomName === null) {
        this.onDeletedDispatch();
      }
    }
    this.tutorEmail = tutorEmail;
    return this;
  }

  getTutor(): Tutor | null {
    if (
      this.tutorEmail !== null &&
      Tutors.instance!.hasTutor(this.tutorEmail)
    ) {
      return Tutors.instance!.getTutor(this.tutorEmail)!;
    }
    return null;
  }

  setRoom(roomName: string | null): TimeBlock {
    if (roomName && roomName !== this.roomName) {
      const room = Rooms.instance!.getRoom(roomName);
      if (room) {
        this.roomSchedule = room.schedule;
        room.addDeletedListener(this, () => {
          this.setRoom(null);
          this.onEditedDispatch();
        });
      }
    } else if (roomName === null) {
      this.getRoom()?.removeDeletedListener(this);
      this.roomDivContent?.destroy();
      this.roomDiv?.remove();
      this.roomDiv = null;
      this.roomSchedule = null;
      if (this.tutorEmail === null) {
        this.onDeletedDispatch();
      }
    }
    this.roomName = roomName;
    return this;
  }

  getRoom(): Room | null {
    if (this.roomName !== null && Rooms.instance!.hasRoom(this.roomName)) {
      return Rooms.instance!.getRoom(this.roomName)!;
    }
    return null;
  }

  hasRoomAssigned(): boolean {
    return this.roomName != null;
  }

  setCourse(id: string | null): TimeBlock {
    if (id === null || id !== this.courseID) {
      if (this.getCourse()) {
        this.getCourse()!.removeTime(this);
        this.getCourse()!.removeEditedListener(this);
        this.getCourse()!.removeDeletedListener(this);
      }
    }
    this.courseID = id;
    if (this.getCourse()) {
      this.getCourse()!.addTime(this);
      this.getCourse()!.addEditedListener(this, (event) => {
        const course = event as Course;
        this.courseID = course.id;
        this.onEditedDispatch();
      });
      this.getCourse()!.addDeletedListener(this, () => {
        this.delete();
      });
    }
    return this;
  }

  getCourse(): Course | null {
    const tutor = this.getTutor();
    if (
      tutor !== null &&
      this.courseID !== null &&
      tutor.hasCourse(this.courseID)
    ) {
      return tutor.getCourse(this.courseID)!;
    }
    return null;
  }

  private buildTimeDiv(): HTMLDivElement {
    const div: HTMLDivElement = document.createElement("div");
    div.style.display = "block";
    div.style.maxWidth = "600px";
    div.style.padding = "4px";
    div.style.paddingBottom = "6px";
    div.style.borderStyle = "solid";
    div.style.borderWidth = "1px";
    div.style.margin = "3px";
    div.style.borderRadius = "5px";
    if (this.hasError()) {
      div.style.backgroundColor = tagColors.get(Tags.conflict)!.backgroundColor;
      div.style.borderColor = tagColors.get(Tags.conflict)!.borderColor;
    } else {
      div.style.backgroundColor = tagColors.get(this.tag)!.backgroundColor;
      div.style.borderColor = tagColors.get(this.tag)!.borderColor;
    }
    return div;
  }

  private buildTutorEditButton(): HTMLButtonElement {
    const edit: HTMLButtonElement = document.createElement("button");
    edit.style.display = "block";
    edit.style.float = "right";
    edit.style.marginLeft = "3px";
    edit.innerHTML = "Edit";
    edit.addEventListener("click", () => {
      this.editTime(this.getTutor()!.schedule);
    });
    return edit;
  }

  private buildTutorDeleteButton(): HTMLButtonElement {
    const button: HTMLButtonElement = document.createElement("button");
    button.style.display = "block";
    button.style.float = "right";
    button.style.marginLeft = "3px";
    button.innerHTML = "Delete";
    button.addEventListener("click", () => {
      this.delete();
    });
    return button;
  }

  private buildRoomEditButton(): HTMLButtonElement {
    const edit: HTMLButtonElement = document.createElement("button");
    edit.style.display = "block";
    edit.style.float = "right";
    edit.style.marginLeft = "3px";
    edit.innerHTML = "Edit";
    edit.addEventListener("click", () => {
      this.editTime(this.getRoom()!.schedule);
    });
    return edit;
  }

  private buildRoomDeleteButton(): HTMLButtonElement {
    const button: HTMLButtonElement = document.createElement("button");
    button.style.display = "block";
    button.style.float = "right";
    button.style.marginLeft = "3px";
    button.innerHTML = "Delete";
    button.addEventListener("click", () => {
      this.roomSchedule?.removeTime(this);
      this.onEditedDispatch();
    });
    return button;
  }

  private delete() {
    this.tutorSchedule?.removeTime(this);
    this.roomSchedule?.removeTime(this);
    if (this.hasError()) {
      this.getCourse()?.removeError(this);
      this.tutorDiv?.remove();
    }
    this.onDeletedDispatch();
  }

  getTutorDiv(): HTMLDivElement {
    if (this.tutorDiv == null) {
      this.tutorDiv = this.buildTutorDiv();
    }
    return this.tutorDiv;
  }

  private buildTutorDiv(): HTMLDivElement {
    const div: HTMLDivElement = this.buildTimeDiv();

    const text: HTMLElement = document.createElement("p");
    text.style.display = "inline-block";
    text.style.margin = "0px";
    text.style.width = "80%";
    div.append(text);

    this.tutorDivContent = new VariableElement(text, this.onEdited, () => {
      text.innerHTML = `<b>${this.tag}:</b> ${this.courseID}`;
      if (this.hasRoomAssigned()) {
        text.innerHTML += ` / <b>${this.roomName}</b>`;
      }
      text.innerHTML += ` / ${this.getTimeStr()}`;
      if (this.hasError()) {
        text.innerHTML += ` / <b>Error: ${this.error}</b>`;
      }
    });

    div.append(this.buildTutorDeleteButton());
    div.append(this.buildTutorEditButton());
    const spacer = document.createElement("p");
    spacer.style.float = "right";
    spacer.style.margin = "0px";
    spacer.innerHTML = " | ";
    div.append(spacer);

    return div;
  }

  getRoomDiv(): HTMLDivElement {
    if (this.roomDiv == null) {
      this.roomDiv = this.buildRoomDiv();
    }
    return this.roomDiv;
  }

  private buildRoomDiv(): HTMLDivElement {
    const div: HTMLDivElement = this.buildTimeDiv();

    const text: HTMLElement = document.createElement("p");
    text.style.display = "inline-block";
    text.style.margin = "0px";
    text.style.width = "80%";
    div.append(text);

    this.roomDivContent = new VariableElement(text, this.onEdited, () => {
      text.innerHTML = `<b>${this.tag}:</b> ${this.courseID}`;
      let tutorName = "";
      if (this.getTutor()) {
        tutorName = `(${this.getTutor()!.name})`;
      }
      if (this.tutorEmail) {
        text.innerHTML += ` / ${this.tutorEmail} ${tutorName}`;
      } 
      text.innerHTML += ` / ${this.getTimeStr()}`;
    });

    div.append(this.buildRoomDeleteButton());
    div.append(this.buildRoomEditButton());
    const spacer = document.createElement("p");
    spacer.style.float = "right";
    spacer.style.margin = "0px";
    spacer.innerHTML = " | ";
    div.append(spacer);

    return div;
  }

  editTime(schedule: Schedule) {
    TimeEditor.instance!.editTime(schedule, this);
  }

  getStartStr(): string {
    return timeConvert.intToStr(this.start);
  }

  getEndStr(): string {
    return timeConvert.intToStr(this.end);
  }

  getStartToEndStr(): string {
    return `${this.getStartStr()} - ${this.getEndStr()}`;
  }

  getDayAndStartStr(): string {
    return `${this.day} ${this.getStartStr()}`;
  }

  getTimeStr(): string {
    return `${this.day} ${this.getStartToEndStr()}`;
  }

  conflictsWith(other: TimeBlock | {day: Days, start: number, end: number}): boolean {
    if (this.day !== other.day) {
      return false;
    }
    if (this.start < other.start && other.start < this.end) {
      return true;
    }
    if (this.start < other.end && other.end < this.end) {
      return true;
    }
    return false;
  }

  isEqual(other: TimeBlock | TimeBlockMatcher): boolean {
    if (this.courseID !== other.courseID) return false;
    if (this.tag !== other.tag) return false;
    if (this.day !== other.day) return false;
    if (this.start !== other.start) return false;
    if (this.end !== other.end) return false;
    if (this.tutorEmail !== other.tutorEmail) return false;
    if (this.roomName !== other.roomName) return false;
    return true;
  }

  update(config: TimeBlockConfig) {
    this.setCoords(config.coords.row, config.coords.col);
    if (config.day !== this.day) {
      this.setDay(config.day);
    }
    if (config.start !== this.start) {
      this.setStart(config.start);
    }
    if (config.end !== this.end) {
      this.setEnd(config.end);
    }
    if (config.tag !== this.tag) {
      this.setTag(config.tag);
    }
    if (config.courseID !== this.courseID) {
      this.setCourse(config.courseID);
    }
    if (config.tutorEmail !== this.tutorEmail) {
      this.setTutor(config.tutorEmail);
    }
    if (config.roomName !== this.roomName) {
      this.setRoom(config.roomName);
    }
    if (config.scheduleByLSS !== this.scheduleByLSS) {
      this.setScheduleByLSS(config.scheduleByLSS);
    }
    this.onEditedDispatch();
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

  // statics =================================================

  static buildTimeBlock(config: TimeBlockConfig): TimeBlock {
    const newTime = new TimeBlock();
    newTime
      .setCoords(config.coords.row, config.coords.col)
      .setDay(config.day)
      .setStart(config.start)
      .setEnd(config.end)
      .setTag(config.tag)
      .setScheduleByLSS(config.scheduleByLSS)
      .setTutor(config.tutorEmail)
      .setRoom(config.roomName)
      .setCourse(config.courseID);

    return newTime;
  }
}
