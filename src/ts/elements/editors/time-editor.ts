import {
  TimeBlock,
  Tags,
  tagColors,
  TimeBlockConfig,
} from "../../schedule/time-block";
import { Days } from "../../days.ts";
import { Schedule } from "../../schedule/schedule";
import { Course } from "../../tutors/course";
import { Tutors } from "../../tutors/tutors";
import { Rooms } from "../../rooms/rooms";
import * as timeConvert from "../../utils/time-convert";
import { TutorSchedule } from "../../tutors/tutor-schedule";
import { RoomSchedule } from "../../rooms/room-schedule";
import { isValidSessionTime } from "../../utils/session-times";
import { Editor } from "./editor";
import * as fields from "./menu-field.ts";

export class TimeEditor extends Editor {
  private static _instance: TimeEditor | null = null;
  public static get instance(): TimeEditor | null {
    return TimeEditor._instance;
  }

  curTime: TimeBlock | null = null;
  client: Schedule | null = null;

  // * Rows ======================
  static readonly courseRow = 0;
  static readonly ownerRow = 1;
  static readonly timeRow = 2;
  // * ===========================

  // * Titles ====================
  static readonly tag = "Type";
  static readonly courseID = "Course ID";
  static readonly email = "Tutor Email";
  static readonly room = "Room Name";
  static readonly day = "Day";
  static readonly start = "Start";
  static readonly end = "End";
  // * ===========================

  constructor() {
    super("Time Editor");
    if (TimeEditor.instance !== null && TimeEditor.instance !== this) {
      console.error("Singleton TimeEditor class instantiated twice");
    }
    TimeEditor._instance = this;

    this.buildCourseRow();
    this.buildOwnerRow();
    this.buildTimeRow();
  }

  private buildCourseRow() {
    this.addRow();
    
    // tags
    const options: string[] = Object.values(Tags);
    this.addSelectField(
      TimeEditor.courseRow,
      TimeEditor.tag,
      options,
      (value: string) => {
        if (value === fields.MenuSelectField.emptyOption) {
          this.setColor(Editor.blankColor);
          return false;
        }
        this.setColor(tagColors.get(value as Tags)!);
        return true;
      },
      () => {
        this.getField(TimeEditor.day)!.validate();
      },
      (field: fields.MenuSelectField) => {
        field.setNotice("time must have a type selected");
      }
    );

    // course id
    this.addInputField(
      TimeEditor.courseRow,
      TimeEditor.courseID,
      (input: string) => {
        if (input === "") {
          return false;
        }

        const formatted = Course.formatID(input);
        if (formatted !== Course.na) {
          this.getField(TimeEditor.courseID)!.setValue(formatted);
        }

        if (this.getValue(TimeEditor.tag) as Tags === Tags.reserve) {
          return true;
        }

        const result = Tutors.instance!.getTutor(this.getValue(TimeEditor.email));
        if (result === undefined) {
          return true;
        }
        if (result.hasCourse(formatted)) {
          return true;
        }
        return false;
      },
      (field: fields.MenuInputField) => {
        const formatted = Course.formatID(field.getValue());
        if (formatted === Course.na) {
          field.setNotice("could not format course ID");
          return;
        }
        const result = Tutors.instance!.getTutor(this.getValue(TimeEditor.email));
        if (result === undefined) {
          field.setNotice("");
          return;
        }
        field.setNotice(result.getCourse(field.getValue())!.position.title);
        return;
      },
      (field: fields.MenuInputField) => {
        if (field.getValue() === "") {
          field.setNotice("times must have a course ID");
          return;
        }
        const result = Tutors.instance!.getTutor(this.getValue(TimeEditor.email));
        if (result === undefined) {
          field.setNotice("");
          return;
        }
        let str = `${result.name} is not assigned to this course.</br>${result.name}'s courses:</br>`;
        result.forEachCourse(course => {
          str += `${course.id}: ${course.position.title}</br>`;
        });
        field.setNotice(str);
      }
    );
  }

  private buildOwnerRow() {
    this.addRow();

    this.addInputField(
      TimeEditor.ownerRow,
      TimeEditor.email,
      (input: string) => {
        if (this.client instanceof TutorSchedule) {
          this.getField(TimeEditor.email)!.setValue(this.client.tutor.email);
          return true;
        }
        if (input === "") {
          return true;
        }
        const result = Tutors.instance!.match(input);
        if (result !== null) {
          this.getField(TimeEditor.email)!.setValue(result.email);
        }
        return true;
      },
      (field: fields.MenuInputField) => {
        if (field.getValue() === "") {
          field.setNotice("");
          this.getField(TimeEditor.courseID)!.validate();
          return;
        }
        const result = Tutors.instance!.match(field.getValue());
        if (result !== null) {
          field.setNotice(result.name);
          this.getField(TimeEditor.courseID)!.validate();
        } else {
          field.setNotice("email/name was not found in tutors list");
        }
        return;
      },
      () => {
        return;
      }
    );

    this.addInputField(
      TimeEditor.ownerRow,
      TimeEditor.room,
      (input: string) => {
        if (this.client instanceof RoomSchedule) {
          this.getField(TimeEditor.room)!.setValue(this.client.room.name);
          return true;
        }
        if (input === "") {
          return true;
        }
        const result = Rooms.instance!.match(input);
        if (result !== null) {
          this.getField(TimeEditor.room)!.setValue(result.name);
        }
        return true;
      },
      (field: fields.MenuInputField) => {
        if (field.getValue() === "") {
          field.setNotice("");
          return;
        }

        const result = Rooms.instance!.match(field.getValue());
        if (result !== null) {
          let days = "";
          result.schedule.range.days.forEach(day => {
            days += day + " ";
          });
          field.setNotice(`open on: ${days}</br>from ${
            timeConvert.intToStr(result.schedule.range.start)
          } to ${
            timeConvert.intToStr(result.schedule.range.end)
          }`);
        } else {
          field.setNotice("name was not found in the Rooms list");
        }
        return;
      },
      () => {
        return;
      }
    );
  }

  private buildTimeRow() {
    this.addRow();

    const options = Object.values(Days);
    this.addSelectField(
      TimeEditor.timeRow,
      TimeEditor.day,
      options,
      (input: string) => {
        if (input === fields.MenuSelectField.emptyOption) {
          return false;
        }
        return this.validateTime();
      },
      (field: fields.MenuSelectField) => {
        field.setNotice("");
      },
      (field: fields.MenuSelectField) => {
        if (field.getValue() === fields.MenuSelectField.emptyOption) {
          field.setNotice("a day must be selected");
        } else {
          field.setNotice("");
        }
      }
    );

    this.addTimeField(
      TimeEditor.timeRow,
      TimeEditor.start,
      (input: number) => {
        if (input === 0) {
          return false;
        }
        return this.validateTime();
      },
      (field: fields.MenuTimeField) => {
        field.setNotice("");
      },
      (field: fields.MenuTimeField) => {
        if (field.getTime() === 0) {
          field.setNotice("a start time must be selected");
        }
        field.setNotice("");
      }
    );

    this.addTimeField(
      TimeEditor.timeRow,
      TimeEditor.end,
      (input: number) => {
        if (input === 0) {
          return false;
        }
        return this.validateTime();
      },
      (field: fields.MenuTimeField) => {
        field.setNotice("");
      },
      (field: fields.MenuTimeField) => {
        if (field.getTime() === 0) {
          field.setNotice("an end time must be selected");
        }
        field.setNotice("");
      }
    );
  }

  validateTime(): boolean {
    if (this.getValue(TimeEditor.day) === fields.MenuSelectField.emptyOption) {
      return false;
    }

    const time = {
      day: this.getValue(TimeEditor.day) as Days,
      start: (this.getField(TimeEditor.start)! as fields.MenuTimeField).getTime(),
      end: (this.getField(TimeEditor.end)! as fields.MenuTimeField).getTime()
    };

    if (time.start === 0 || time.end === 0) {
      return false;
    }

    if (Tutors.instance!.hasTutor(this.getValue(TimeEditor.email))) {
      const tutor = Tutors.instance!.getTutor(this.getValue(TimeEditor.email))!;
      if (tutor.schedule.hasConflictWith(time, this.curTime!)) {
        this.setRowNotice(TimeEditor.timeRow, "time conflicts with tutor's current schedule");
        return false;
      }
    }

    if (Rooms.instance!.hasRoom(this.getValue(TimeEditor.room))) {
      const room = Rooms.instance!.getRoom(this.getValue(TimeEditor.room))!;
      if (room.schedule.hasConflictWith(time, this.curTime!)) {
        this.setRowNotice(TimeEditor.timeRow, "time conflicts with room's current schedule");
        return false;
      }
      if (!room.schedule.isInRange(time)) {
        this.setRowNotice(TimeEditor.timeRow, "time is outside the room's open time range");
        return false;
      }
    }

    if (this.getValue(TimeEditor.tag) as Tags === Tags.session && !isValidSessionTime(time)) {
      this.setRowNotice(
        TimeEditor.timeRow, 
        "time is not within a valid block for a session</br><a href='https://registrar.ucsc.edu/soc/archive/html/fall2020/schedule_planner1.pdf' target='_blank'>view time blocks</a>"
      );
      return false;
    }

    if (time.end < time.start) {
      this.setRowNotice(TimeEditor.timeRow, "start must be before end");
      return false;
    }
    this.setRowNotice(TimeEditor.timeRow, "");
    return true;
  }

  override applyChanges() {
    const changes: TimeBlockConfig = {
      coords: this.curTime?.coords ?? {row: -1, col: -1},
      scheduleByLSS: this.curTime?.scheduleByLSS ?? true,
      tag: this.getValue(TimeEditor.tag) as Tags,
      courseID: this.getValue(TimeEditor.courseID),
      tutorEmail: this.getValue(TimeEditor.email) !== "" ? this.getValue(TimeEditor.email) : null,
      roomName: this.getValue(TimeEditor.room) !== "" ? this.getValue(TimeEditor.room) : null,
      day: this.getValue(TimeEditor.day) as Days,
      start: (this.getField(TimeEditor.start)! as fields.MenuTimeField).getTime(),
      end: (this.getField(TimeEditor.end)! as fields.MenuTimeField).getTime()
    };
    if (this.curTime) {
      if (changes.tutorEmail !== this.curTime.tutorEmail) {
        this.curTime.tutorSchedule?.removeTime(this.curTime);
        if (changes.tutorEmail) {
          Tutors.instance!.getTutor(changes.tutorEmail)?.schedule.addTime(this.curTime);
        }
      }
      if (changes.roomName !== this.curTime.roomName) {
        this.curTime.roomSchedule?.removeTime(this.curTime);
        if (changes.roomName) {
          Rooms.instance!.getRoom(changes.roomName)?.schedule.addTime(this.curTime);
        }
      }
      this.curTime.update(changes);
    } else {
      const newTime = TimeBlock.buildTimeBlock(changes);
      if (changes.tutorEmail) {
        Tutors.instance!.getTutor(changes.tutorEmail)?.schedule.addTime(newTime);
      }
      if (changes.roomName) {
        Rooms.instance!.getRoom(changes.roomName)?.schedule.addTime(newTime);
      }
    }
  }

  createNewTime(client: Schedule) {
    this.openMenu();
    this.client = client;
    if (this.client instanceof TutorSchedule) {
      this.getField(TimeEditor.email)!.setValue(this.client.tutor.email);
      this.getField(TimeEditor.email)!.setNotice(this.client.tutor.name);
    } else if (this.client instanceof RoomSchedule) {
      this.getField(TimeEditor.room)!.setValue(this.client.room.name);
      let days = "";
      this.client.range.days.forEach(day => {
        days += day + " ";
      });
      this.getField(TimeEditor.room)!.setNotice(`open on: ${days}</br>from ${
        timeConvert.intToStr(this.client.range.start)
      } to ${
        timeConvert.intToStr(this.client.range.end)
      }`);
    }
    this.curTime = null;
  }

  editTime(client: Schedule, time: TimeBlock) {
    this.openMenu();
    this.createNewTime(client);
    this.curTime = time;
    this.getField(TimeEditor.tag)!.setValue(this.curTime.tag);
    this.setColor(tagColors.get(this.curTime.tag)!);
    this.getField(TimeEditor.courseID)!.setValue(this.curTime.courseID ?? "");
    this.getField(TimeEditor.email)!.setValue(this.curTime.tutorEmail ?? "");
    this.getField(TimeEditor.room)!.setValue(this.curTime.roomName ?? "");
    this.getField(TimeEditor.day)!.setValue(this.curTime.day);
    this.getField(TimeEditor.start)!.setValue(timeConvert.intTo24hr(this.curTime.start));
    this.getField(TimeEditor.end)!.setValue(timeConvert.intTo24hr(this.curTime.end));
  }
}
