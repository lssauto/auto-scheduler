import * as timeConvert from "../utils/time-convert";
import { Days } from "../enums";
import { Tutors } from "../tutors/tutors";
import { Tutor } from "../tutors/tutor";
import { Rooms } from "../rooms/rooms";
import { Room } from "../rooms/room";
import { Course } from "../tutors/course";
import { TutorSchedule } from "../tutors/tutor-schedule";
import { RoomSchedule } from "../rooms/room-schedule";
import { TimeEditor } from "../elements/editors/time-editor";
import { Schedule } from "./schedule";
import { NotifyEvent } from "../events/notify";
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
  tutorSchedule?: TutorSchedule;
  roomSchedule?: RoomSchedule;
  coords?: { row: number; col: number };
  tag?: Tags;
  day?: Days;
  start?: number;
  end?: number;
  scheduleByLSS: boolean;
  tutorEmail?: string;
  roomName?: string;
  courseID?: string | null;
}

export class TimeBlock {
  tutorSchedule: TutorSchedule | null;
  roomSchedule: RoomSchedule | null;
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
  tutorDivContent: VariableElement | null;
  roomDiv: HTMLDivElement | null;
  roomDivContent: VariableElement | null;

  onEdited: NotifyEvent = new NotifyEvent("onEdited");

  constructor(tutorSchedule?: TutorSchedule, roomSchedule?: RoomSchedule) {
    if (tutorSchedule) {
      this.tutorSchedule = tutorSchedule;
    } else {
      this.tutorSchedule = null;
    }
    if (roomSchedule) {
      this.roomSchedule = roomSchedule;
    } else {
      this.roomSchedule = null;
    }
    this.hasConflict = false;
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

  setTutor(tutorEmail: string | null): TimeBlock {
    if (tutorEmail) {
      const tutor = Tutors.instance!.getTutor(tutorEmail);
      this.tutorSchedule = tutor ? tutor.schedule : null;
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
    if (roomName) {
      const room = Rooms.instance!.getRoom(roomName);
      this.roomSchedule = room ? room.schedule : null;
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

  private buildTutorEditButton(): HTMLButtonElement {
    const edit: HTMLButtonElement = document.createElement("button");
    edit.innerHTML = "Edit Time";
    edit.addEventListener("click", () => {
      this.editTime(this.getTutor()!.schedule);
    });
    return edit;
  }

  private buildRoomEditButton(): HTMLButtonElement {
    const edit: HTMLButtonElement = document.createElement("button");
    edit.style.display = "inline-block";
    edit.innerHTML = "Edit Time";
    edit.addEventListener("click", () => {
      this.editTime(this.getRoom()!.schedule);
    });
    return edit;
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
    text.style.display = "inline";
    text.innerHTML = `${this.courseID}`;
    if (this.hasRoomAssigned()) {
      text.innerHTML += ` / <b>${this.roomName}</b>`;
    }
    text.innerHTML += ` / ${this.getTimeStr()} | `;
    div.append(text);

    this.tutorDivContent = new VariableElement(text, this.onEdited, () => {
      text.innerHTML = `${this.courseID}`;
      if (this.hasRoomAssigned()) {
        text.innerHTML += ` / <b>${this.roomName}</b>`;
      }
      text.innerHTML += ` / ${this.getTimeStr()} | `;
    });

    div.append(this.buildTutorEditButton());

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
    text.style.display = "inline";
    let tutorName = "";
    if (this.getTutor()) {
      tutorName = `(${this.getTutor()!.name})`;
    }
    text.innerHTML = `${this.courseID} / ${
      this.tutorEmail
    } ${tutorName} / ${this.getTimeStr()} | `;
    div.append(text);

    this.roomDivContent = new VariableElement(text, this.onEdited, () => {
      let tutorName = "";
      if (this.getTutor()) {
        tutorName = `(${this.getTutor()!.name})`;
      }
      text.innerHTML = `${this.courseID} / ${
        this.tutorEmail
      } ${tutorName} / ${this.getTimeStr()} | `;
    });

    div.append(this.buildRoomEditButton());

    return div;
  }

  editTime(schedule: Schedule) {
    TimeEditor.editTime(schedule, this);
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
    this.setDay(config.day!)
      .setStart(config.start!)
      .setEnd(config.end!)
      .setTag(config.tag!)
      .setCourse(config.courseID!)
      .setTutor(config.tutorEmail!)
      .setRoom(config.roomName!);
    this.onEditedDispatch();
  }

  addEditedListener(subscriber: object, action: () => void) {
    this.onEdited.addListener(subscriber, action);
  }

  removeEditedListener(subscriber: object) {
    this.onEdited.removeListener(subscriber);
  }

  onEditedDispatch() {
    this.onEdited.dispatch();
  }

  // statics =================================================

  static buildTimeBlock(config: TimeBlockConfig): TimeBlock {
    const newTime = new TimeBlock(config.tutorSchedule, config.roomSchedule);
    if (config.coords !== undefined) {
      newTime.setCoords(config.coords.row, config.coords.col);
    }
    newTime
      .setDay(config.day!)
      .setStart(config.start!)
      .setEnd(config.end!)
      .setTag(config.tag!)
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
