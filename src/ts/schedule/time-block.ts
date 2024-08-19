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

/**
 * Identifier for a time block's type.
 */
export enum Tags {
  session = "session",
  lecture = "lecture",
  officeHours = "office-hours",
  discord = "discord-support",
  conflict = "conflict",
  reserve = "reservation",
}

/**
 * Styling for different time block tags.
 */
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

/**
 * Config object for time blocks. Construct new time blocks with 
 * `TimeBlock.buildTimeBlock(config)`.
 */
export interface TimeBlockConfig {
  readonly coords: { row: number; col: number };
  readonly tag: Tags;
  readonly day: Days;
  readonly start: number;
  readonly end: number;
  readonly scheduleByLSS: boolean;
  readonly isVirtual: boolean;
  readonly tutorEmail: string | null;
  readonly roomName: string | null;
  readonly courseID: string | null;
}

/**
 * Used to match a time block to an object that might not be another 
 * TimeBlock instance. Given to `timeBlock.isEqual(matcher)`.
 */
export interface TimeBlockMatcher {
  readonly tag: Tags;
  readonly day: Days;
  readonly start: number;
  readonly end: number;
  readonly courseID: string | null;
  readonly tutorEmail: string | null;
  readonly roomName: string | null;
}

/**
 * Class used to represent a block of time in either a tutor's or room's schedule.
 * A tutor and room can reference the same time block instance.
 */
export class TimeBlock {
  // The schedules the time block is in
  tutorSchedule: TutorSchedule | null;
  roomSchedule: RoomSchedule | null;

  // Coordinates of this time in the response table. Might not be useful now.
  coords: { row: number; col: number };

  tag: Tags; // The type of time block
  error: ErrorCodes; // Assigned if the tutor's schedule marked it as erroneous
  
  // The actual time of the time block
  day: Days;
  start: number;
  end: number;

  // If this is a session, then who is responsible for scheduling it
  scheduleByLSS: boolean;

  // If the session is virtual, a zoom link is required
  isVirtual: boolean;

  // These are strings because their actual instances might not exist
  // Use as keys to get the actual instances from Tutors and Rooms singletons
  tutorEmail: string | null;
  roomName: string | null;
  courseID: string | null;

  // HTML elements
  tutorDiv: HTMLDivElement | null;
  tutorDivContent: VariableElement | null;
  roomDiv: HTMLDivElement | null;
  roomDivContent: VariableElement | null;

  // Events
  onEdited: NotifyEvent = new NotifyEvent("onEdited");
  onDeleted: NotifyEvent = new NotifyEvent("onDeleted");

  // just sets default values. Use TimeBlock.buildTimeBlock(config) instead.
  constructor() {
    this.coords = {row: -1, col: -1};
    this.tag = Tags.reserve;
    this.day = Days.mon;
    this.start = 0;
    this.end = 0;
    this.scheduleByLSS = true;
    this.isVirtual = false;
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

  // * Setters & Getters ============================

  // ! Do not trigger onEdited event in setters,
  // ! the update method triggers this event, and is used by the TimeEditor
  // ! adding onEdited triggers to the setters would cause the event to be dispatched twice

  setCoords(row: number, col: number): TimeBlock {
    this.coords = { row: row, col: col };
    return this;
  }

  /**
   * Sets the time block's tag, and updates its styling.
   */
  setTag(tag: Tags): TimeBlock {
    this.tag = tag;
    let colors: {backgroundColor: string, borderColor: string};
    // Use error colors if this time is an error
    if (this.hasError()) {
      colors = tagColors.get(Tags.conflict)!;
    } else {
      colors = tagColors.get(this.tag)!;
    }
    // style tutor div
    if (this.tutorDiv) {
      this.tutorDiv.style.backgroundColor = colors.backgroundColor;
      this.tutorDiv.style.borderColor = colors.borderColor;
    }
    // style room div
    if (this.roomDiv) {
      this.roomDiv.style.backgroundColor = colors.backgroundColor;
      this.roomDiv.style.borderColor = colors.borderColor;
    }
    return this;
  }

  /**
   * Should only be used by tutors. Mark the time block as being erroneous.
   */
  setError(error: ErrorCodes): TimeBlock {
    this.error = error;
    let colors: {backgroundColor: string, borderColor: string};
    if (this.hasError()) {
      colors = tagColors.get(Tags.conflict)!;
      this.setRoom(null); // remove room assignments from erroneous times
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

  setVirtual(virtual: boolean): TimeBlock {
    this.isVirtual = virtual;
    return this;
  }

  /**
   * Assign this time block to a tutor, or remove its assignment by providing null.
   * If the time block is no longer assigned to any room or tutor, it will delete its 
   * HTML elements.
   */
  setTutor(tutorEmail: string | null): TimeBlock {
    // If this is a new tutor assignment
    if (tutorEmail && tutorEmail !== this.tutorEmail) {
      // Try to cache the tutor's schedule
      const tutor = Tutors.instance!.getTutor(tutorEmail);
      this.tutorSchedule = tutor?.schedule ?? null;
    
    // If the assignment is being removed
    } else if (tutorEmail === null) {
      // delete HTML elements
      this.tutorDivContent?.destroy();
      this.tutorDiv?.remove();
      this.tutorDiv = null;
      this.tutorSchedule = null;
      // dispatch deleted event if the block is no longer attached to anything
      if (this.roomName === null) {
        this.onDeletedDispatch();
      }
    }
    this.tutorEmail = tutorEmail;
    return this;
  }

  getTutor(): Tutor | null {
    // use tutorEmail as a key to retrieve the tutor from the Tutors list
    if (
      this.tutorEmail !== null &&
      Tutors.instance!.hasTutor(this.tutorEmail)
    ) {
      return Tutors.instance!.getTutor(this.tutorEmail)!;
    }
    return null;
  }

  /**
   * Assign this time block to a room, or remove its assignment by providing null.
   * If the time block is no longer assigned to any room or tutor, it will delete its 
   * HTML elements.
   */
  setRoom(roomName: string | null): TimeBlock {
    // If this is a new assignment
    if (roomName && roomName !== this.roomName) {
      // Try to cache room schedule, 
      // and start listening to its deleted event
      const room = Rooms.instance!.getRoom(roomName);
      if (room) {
        this.roomSchedule = room.schedule;
        room.addDeletedListener(this, () => {
          this.setRoom(null);
          this.onEditedDispatch();
        });
      }
    
    // If removing the assignment
    } else if (roomName === null) {
      // remove self from the room's deleted listeners
      this.getRoom()?.removeDeletedListener(this);
      // delete HTML elements
      this.roomDivContent?.destroy();
      this.roomDiv?.remove();
      this.roomDiv = null;
      this.roomSchedule = null;
      // dispatch deleted event if this time is no longer attached to anything
      if (this.tutorEmail === null) {
        this.onDeletedDispatch();
      }
    }
    this.roomName = roomName;
    return this;
  }

  getRoom(): Room | null {
    // Try to access room using roomName as a key to the Rooms list
    if (this.roomName !== null && Rooms.instance!.hasRoom(this.roomName)) {
      return Rooms.instance!.getRoom(this.roomName)!;
    }
    return null;
  }

  hasRoomAssigned(): boolean {
    return this.roomName != null;
  }

  /**
   * Assigns this time block to a course. The course ID can be any generic string, 
   * although it will usually be used to access the specific course instance attached to 
   * the assigned tutor.
   */
  setCourse(id: string | null): TimeBlock {
    // Remove time from previously assigned course
    if (id === null || id !== this.courseID) {
      if (this.getCourse()) {
        this.getCourse()!.removeTime(this);
        this.getCourse()!.removeEditedListener(this);
        this.getCourse()!.removeDeletedListener(this);
      }
    }
    this.courseID = id;
    // If this course ID connects to an actual course instance
    const course = this.getCourse();
    if (course && !course.hasTime(this)) {
      // Add this time to the course
      course.addTime(this);
      course.addEditedListener(this, (event) => {
        const course = event as Course;
        this.courseID = course.id;
        this.onEditedDispatch();
      });
      course.addDeletedListener(this, () => {
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

  // * ====================================================

  // * HTML Building ======================================

  // general styling for a time block's HTML div
  private buildTimeDiv(): HTMLDivElement {
    const div: HTMLDivElement = document.createElement("div");

    // styling
    div.style.display = "block";
    div.style.maxWidth = "600px";
    div.style.padding = "4px";
    div.style.paddingBottom = "6px";
    div.style.borderStyle = "solid";
    div.style.borderWidth = "1px";
    div.style.margin = "3px";
    div.style.borderRadius = "5px";

    // use red if the time has an error
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

    //styling
    edit.style.display = "block";
    edit.style.float = "right";
    edit.style.marginLeft = "3px";
    edit.innerHTML = "Edit";

    // open time in editor on click
    edit.addEventListener("click", () => {
      this.editTime(this.getTutor()!.schedule);
    });

    return edit;
  }

  private buildTutorDeleteButton(): HTMLButtonElement {
    const button: HTMLButtonElement = document.createElement("button");

    // styling
    button.style.display = "block";
    button.style.float = "right";
    button.style.marginLeft = "3px";
    button.innerHTML = "Delete";

    // delete the time completely
    button.addEventListener("click", () => {
      this.delete();
    });
    return button;
  }

  private buildRoomEditButton(): HTMLButtonElement {
    const edit: HTMLButtonElement = document.createElement("button");

    // styling
    edit.style.display = "block";
    edit.style.float = "right";
    edit.style.marginLeft = "3px";
    edit.innerHTML = "Edit";

    // open the time in the editor
    edit.addEventListener("click", () => {
      this.editTime(this.getRoom()!.schedule);
    });
    return edit;
  }

  private buildRoomDeleteButton(): HTMLButtonElement {
    const button: HTMLButtonElement = document.createElement("button");

    // styling
    button.style.display = "block";
    button.style.float = "right";
    button.style.marginLeft = "3px";
    button.innerHTML = "Remove";

    // remove the time from the room, not completely delete
    button.addEventListener("click", () => {
      this.roomSchedule?.removeTime(this);
      this.onEditedDispatch();
    });
    return button;
  }

  // removes the time from any assignments
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

    // styling
    const text: HTMLElement = document.createElement("p");
    text.style.display = "inline-block";
    text.style.margin = "0px";
    text.style.width = "80%";
    div.append(text);

    // update text when the time is edited
    this.tutorDivContent = new VariableElement(text, this.onEdited, () => {
      text.innerHTML = `<b>${
        (this.isVirtual ? "virtual " : "") +
        this.tag
      }:</b> ${this.courseID}`;
      if (this.hasRoomAssigned()) {
        text.innerHTML += ` / <b>${this.roomName}</b>`;
      }
      text.innerHTML += ` / ${this.getTimeStr()}`;
      if (this.hasError()) {
        text.innerHTML += ` / <b>Error: ${this.error}</b>`;
      }
    });

    // add buttons
    div.append(this.buildTutorDeleteButton());
    div.append(this.buildTutorEditButton());

    // adds bar between text and buttons
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

    // styling
    const text: HTMLElement = document.createElement("p");
    text.style.display = "inline-block";
    text.style.margin = "0px";
    text.style.width = "80%";
    div.append(text);

    // update text when the time is edited
    this.roomDivContent = new VariableElement(text, this.onEdited, () => {
      text.innerHTML = `<b>${
        (this.isVirtual ? "virtual " : "") +
        this.tag
      }:</b> ${this.courseID}`;
      let tutorName = "";
      if (this.getTutor()) {
        tutorName = `(${this.getTutor()!.name})`;
      }
      if (this.tutorEmail) {
        text.innerHTML += ` / ${this.tutorEmail} ${tutorName}`;
      }
      text.innerHTML += ` / ${this.getTimeStr()}`;
    });

    // add buttons
    div.append(this.buildRoomDeleteButton());
    div.append(this.buildRoomEditButton());

    // add bar between text and buttons
    const spacer = document.createElement("p");
    spacer.style.float = "right";
    spacer.style.margin = "0px";
    spacer.innerHTML = " | ";
    div.append(spacer);

    return div;
  }

  // * ===================================================

  // called by edit buttons, passes the schedule that the button pressed was from.
  // if the tutor's edit button was pressed, then the passed schedule will be the tutor's schedule.
  editTime(schedule: Schedule) {
    TimeEditor.instance!.editTime(schedule, this);
  }

  // * String Builders ===================================

  /**
   * Returns start as "##:## [AM/PM]"
   */
  getStartStr(): string {
    return timeConvert.intToStr(this.start);
  }

  /**
   * Returns end as "##:## [AM/PM]"
   */
  getEndStr(): string {
    return timeConvert.intToStr(this.end);
  }

  /**
   * Returns "[start] - [end]"
   */
  getStartToEndStr(): string {
    return `${this.getStartStr()} - ${this.getEndStr()}`;
  }

  /**
   * Returns "[day] [start]"
   */
  getDayAndStartStr(): string {
    return `${this.day} ${this.getStartStr()}`;
  }

  /**
   * Returns "[day] [start] - [end]"
   */
  getTimeStr(): string {
    return `${this.day} ${this.getStartToEndStr()}`;
  }

  // * ===================================================

  // * Comparisons =======================================

  /**
   * Returns true if the given time block or time object overlaps 
   * with this time block.
   */
  conflictsWith(other: TimeBlock | {day: Days, start: number, end: number}): boolean {
    if (this.day !== other.day) {
      return false;
    }
    if (this.start <= other.start && other.start < this.end) {
      return true;
    }
    if (this.start < other.end && other.end <= this.end) {
      return true;
    }
    return false;
  }

  /**
   * Returns true if the given time block or matcher object represents 
   * the same time. Used by time editor, and can be used to check for duplicate times.
   */
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

  // * ====================================================

  /**
   * Replaces state of this time. Used by time editor to update a time after editing.
   * Triggers the onEdited event.
   */
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
    if (config.isVirtual !== this.isVirtual) {
      this.setVirtual(config.isVirtual);
    }
    this.onEditedDispatch();
  }

  // * Events =============================================

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

  // * ====================================================

  // * Statics ============================================

  /**
   * Use to build a new time block with provided values.
   */
  static buildTimeBlock(config: TimeBlockConfig): TimeBlock {
    const newTime = new TimeBlock();
    newTime
      .setCoords(config.coords.row, config.coords.col)
      .setDay(config.day)
      .setStart(config.start)
      .setEnd(config.end)
      .setTag(config.tag)
      .setScheduleByLSS(config.scheduleByLSS)
      .setVirtual(config.isVirtual)
      .setTutor(config.tutorEmail)
      .setRoom(config.roomName)
      .setCourse(config.courseID);

    return newTime;
  }
}
