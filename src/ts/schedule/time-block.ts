import { Schedule } from "./schedule";
import * as timeConvert from "../utils/time-convert";
import { Days } from "../enums";
import { Tutors } from "../tutors/tutors";
import { Tutor } from "../tutors/tutor";
import { Rooms } from "../rooms/rooms";
import { Room } from "../rooms/room";
import { Course } from "../tutors/course";

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
  schedule: Schedule;
  coords?: { row: number; col: number };
  tag: Tags;
  day: Days;
  start: number;
  end: number;
  scheduleByLSS: boolean;
  tutorEmail?: string | null;
  roomName?: string | null;
  courseID?: string | null;
}

export class TimeBlock {
  schedule: Schedule;
  coords?: { row: number; col: number };

  tag?: Tags;
  hasConflict: boolean;
  day?: Days;
  start?: number;
  end?: number;
  scheduleByLSS?: boolean;

  tutorEmail: string | null;
  roomName: string | null;
  courseID: string | null;

  tutorDiv: HTMLDivElement | null;
  roomDiv: HTMLDivElement | null;

  constructor(schedule: Schedule) {
    this.schedule = schedule;
    this.hasConflict = false;
    this.tutorEmail = null;
    this.roomName = null;
    this.courseID = null;
    this.tutorDiv = null;
    this.roomDiv = null;
  }

  setCoords(row: number, col: number): TimeBlock {
    this.coords = { row: row, col: col };
    return this;
  }

  setTag(tag: Tags): TimeBlock {
    this.tag = tag;
    return this;
  }

  setHasConflict(mode: boolean): TimeBlock {
    this.hasConflict = mode;
    return this;
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

  setTutor(email: string | null): TimeBlock {
    this.tutorEmail = email;
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

  setRoom(name: string | null): TimeBlock {
    this.roomName = name;
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
    this.courseID = id;
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
    div.style.display = "inline-block";
    div.style.padding = "3px";
    div.style.borderStyle = "solid";
    div.style.borderWidth = "1px";
    div.style.margin = "2px";
    div.style.borderRadius = "5px";
    if (this.hasConflict) {
      div.style.backgroundColor = tagColors.get(Tags.conflict)!.backgroundColor;
      div.style.borderColor = tagColors.get(Tags.conflict)!.borderColor;
    } else {
      div.style.backgroundColor = tagColors.get(this.tag!)!.backgroundColor;
      div.style.borderColor = tagColors.get(this.tag!)!.borderColor;
    }
    return div;
  }

  private buildEditButton(): HTMLButtonElement {
    const edit: HTMLButtonElement = document.createElement("button");
    edit.innerHTML = "Edit Time";
    edit.addEventListener("click", () => {
      this.editTime();
    });
    return edit;
  }

  setTutorDiv(elem: HTMLDivElement) {
    this.tutorDiv = elem;
    return this;
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
    text.innerHTML = `${this.courseID}`;
    if (this.hasRoomAssigned()) {
      text.innerHTML += ` / <b>${this.roomName}</b>`;
    }
    text.innerHTML += ` / ${this.getTimeStr()}`;
    div.append(text);

    div.append(this.buildEditButton());

    return div;
  }

  setRoomDiv(elem: HTMLDivElement) {
    this.roomDiv = elem;
    return this;
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
    // TODO: get tutor name
    text.innerHTML = `${this.courseID} / ${
      this.tutorEmail
    } / ${this.getTimeStr()}`;
    div.append(text);

    div.append(this.buildEditButton());

    return div;
  }

  editTime() {
    console.log("edit time");
    //TODO: add call to time edit window
  }

  getStartStr(): string {
    return timeConvert.intToStr(this.start!);
  }

  getEndStr(): string {
    return timeConvert.intToStr(this.end!);
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
    if (this.start! < other.start! && other.start! < this.end!) {
      return true;
    }
    if (this.start! < other.end! && other.end! < this.end!) {
      return true;
    }
    return false;
  }

  isEqual(other: TimeBlock): boolean {
    if (this.courseID != other.courseID) return false;
    if (this.tag != other.tag) return false;
    if (this.day != other.day) return false;
    if (this.start != other.start) return false;
    if (this.end != other.end) return false;
    return true;
  }

  update(config: TimeBlockConfig) {
    this.setDay(config.day)
      .setStart(config.start)
      .setEnd(config.end)
      .setTag(config.tag)
      .setCourse(config.courseID!)
      .setTutor(config.tutorEmail!)
      .setRoom(config.roomName!);
  }

  // statics =================================================

  static buildTimeBlock(config: TimeBlockConfig): TimeBlock {
    const newTime = new TimeBlock(config.schedule);
    if (config.coords !== undefined) {
      newTime.setCoords(config.coords.row, config.coords.col);
    }
    newTime
      .setDay(config.day)
      .setStart(config.start)
      .setEnd(config.end)
      .setTag(config.tag)
      .setScheduleByLSS(config.scheduleByLSS);

    if (config.tutorEmail !== undefined) {
      newTime.setTutor(config.tutorEmail);
    }
    if (config.roomName !== undefined) {
      newTime.setRoom(config.roomName);
    }
    if (config.courseID !== undefined) {
      newTime.setCourse(config.courseID);
    }

    return newTime;
  }
}
