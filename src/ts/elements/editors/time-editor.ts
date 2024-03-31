import {
  TimeBlock,
  Tags,
  tagColors,
  TimeBlockConfig,
} from "../../schedule/time-block";
import { Days } from "../../days.ts";
import { ErrorCodes, Schedule } from "../../schedule/schedule";
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

  // the current time being edited
  curTime: TimeBlock | null = null;

  // the schedule that requested this time edit,
  // if the edit button was clicked on a tutor's schedule, then that schedule will be the client
  // and vice versa for rooms
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
        // tag is only invalid if nothing is selected
        if (value === fields.MenuSelectField.emptyOption) {
          this.setColor(Editor.blankColor);
          return false;
        }
        this.setColor(tagColors.get(value as Tags)!);
        return true;
      },
      () => {
        // if the tag changed to or from "session", then the time validation will change
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

        // try to format the course id
        const formatted = Course.formatID(input);
        if (formatted !== Course.na) {
          this.getField(TimeEditor.courseID)!.setValue(formatted);
        }

        // a reservation doesn't need a valid course id
        if (this.getValue(TimeEditor.tag) as Tags === Tags.reserve) {
          return true;
        }

        // check if tutor has this course
        const result = Tutors.instance!.getTutor(this.getValue(TimeEditor.email));

        // accept if no tutor is given yet
        if (result === undefined) {
          return true;
        }
        // accept if tutor does have this course
        if (result.hasCourse(formatted)) {
          return true;
        }
        // otherwise this is an invalid course id
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

        // display the tutor's position for this course if it's valid
        } else if (result.hasCourse(field.getValue())) {
          field.setNotice(result.getCourse(field.getValue())!.position.title);
        
        // display course options for this tutor
        } else {
          let str = `${result.name} is not assigned to this course.</br>${result.name}'s courses:</br>`;
          result.forEachCourse(course => {
            str += `${course.id}: ${course.position.title}</br>`;
          });
          field.setNotice(str);
        }
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

        // display course options for this tutor
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

    // tutor email
    this.addInputField(
      TimeEditor.ownerRow,
      TimeEditor.email,
      (input: string) => {
        // if the client is a tutor, then the email can't change
        if (this.client instanceof TutorSchedule) {
          this.getField(TimeEditor.email)!.setValue(this.client.tutor.email);
          return true;
        }

        // times can have no tutor assignment
        if (input === "") {
          return true;
        }

        // if the tutor can be found, then replace the field's value with their accurate email
        const result = Tutors.instance!.match(input);
        if (result !== null) {
          this.getField(TimeEditor.email)!.setValue(result.email);
        }

        // even if the tutor isn't in the tutors list, they are still a valid value
        // this is for special time blocks where they are reserved under lss's email
        return true;
      },
      (field: fields.MenuInputField) => {
        // revalidate the course id since different tutors will have different courses
        if (field.getValue() === "") {
          field.setNotice("");
          this.getField(TimeEditor.courseID)!.validate();
          return;
        }
        const result = Tutors.instance!.match(field.getValue());
        if (result !== null) {
          field.setNotice(result.name);
          this.getField(TimeEditor.courseID)!.validate();

        // tell the user the email was not recognized from the tutors list
        } else {
          field.setNotice("email/name was not found in tutors list");
        }
        return;
      },
      // there'll never be an invalid email value given
      () => {
        return;
      }
    );

    // room name
    this.addInputField(
      TimeEditor.ownerRow,
      TimeEditor.room,
      (input: string) => {
        // if the client is a room, then the room name cannot change
        if (this.client instanceof RoomSchedule) {
          this.getField(TimeEditor.room)!.setValue(this.client.room.name);
          return true;
        }

        // time blocks can have no room assignment
        if (input === "") {
          return true;
        }

        // try to find the exact room
        const result = Rooms.instance!.match(input);
        if (result !== null) {
          this.getField(TimeEditor.room)!.setValue(result.name);
        }

        // all values are valid
        return true;
      },
      (field: fields.MenuInputField) => {
        if (field.getValue() === "") {
          field.setNotice("");
          return;
        }

        // display the room's open times
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

    // ? all validation is done with the validateTime() method

    // day
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

    // start time
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

    // end time
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
    // times must have a day selected
    if (this.getValue(TimeEditor.day) === fields.MenuSelectField.emptyOption) {
      return false;
    }

    // turn the field values into an easier to operate on object
    const time = {
      day: this.getValue(TimeEditor.day) as Days,
      start: (this.getField(TimeEditor.start)! as fields.MenuTimeField).getTime(),
      end: (this.getField(TimeEditor.end)! as fields.MenuTimeField).getTime()
    };

    // a start and end time must be selected
    if (time.start === 0 || time.end === 0) {
      return false;
    }

    // check if the tutor's schedule conflicts with the new time
    // use this.curTime to prevent checking for conflicts with the time being edited
    if (Tutors.instance!.hasTutor(this.getValue(TimeEditor.email))) {
      const tutor = Tutors.instance!.getTutor(this.getValue(TimeEditor.email))!;
      if (tutor.schedule.hasConflictWith(time, this.curTime!)) {
        this.setRowNotice(TimeEditor.timeRow, "time conflicts with tutor's current schedule");
        return false;
      }
    }

    // check if the room's schedule conflicts with the new time
    // or is not in its building's open range
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

    // check if the session is in a valid session time block
    if (this.getValue(TimeEditor.tag) as Tags === Tags.session && !isValidSessionTime(time)) {
      this.setRowNotice(
        TimeEditor.timeRow, 
        "time is not within a valid block for a session</br><a href='https://registrar.ucsc.edu/soc/archive/html/fall2020/schedule_planner1.pdf' target='_blank'>view time blocks</a>"
      );
      return false;
    }

    // ensure the time starts before it ends
    if (time.end < time.start) {
      this.setRowNotice(TimeEditor.timeRow, "start must be before end");
      return false;
    }
    this.setRowNotice(TimeEditor.timeRow, "");
    return true;
  }

  override applyChanges() {
    const changes: TimeBlockConfig = {
      coords: this.curTime?.coords ?? {row: -1, col: -1}, // might not be important anymore
      scheduleByLSS: this.curTime?.scheduleByLSS ?? true, // default times to be scheduled by LSS
      tag: this.getValue(TimeEditor.tag) as Tags,
      courseID: this.getValue(TimeEditor.courseID),
      tutorEmail: this.getValue(TimeEditor.email) !== "" ? this.getValue(TimeEditor.email) : null,
      roomName: this.getValue(TimeEditor.room) !== "" ? this.getValue(TimeEditor.room) : null,
      day: this.getValue(TimeEditor.day) as Days,
      start: (this.getField(TimeEditor.start)! as fields.MenuTimeField).getTime(),
      end: (this.getField(TimeEditor.end)! as fields.MenuTimeField).getTime()
    };

    // * if editor was making changes to an existing time
    if (this.curTime) {
      // the result of any edited time should have no errors, so remove them from any errors lists
      if (this.curTime.hasError()) {
        this.curTime.getCourse()?.removeError(this.curTime);
        this.curTime.getCourse()?.addTime(this.curTime);
        if (changes.tutorEmail) {
          Tutors.instance!.getTutor(changes.tutorEmail)?.addTime(this.curTime);
        }
        this.curTime.setError(ErrorCodes.success);
      }

      // check if the time has changed tutor or room assignment, 
      // if it has then the time will have to be removed from its old assignment
      let sameTutor = false;
      let sameRoom = false;
      const prevDay = this.curTime.day; // in case the day has changed

      // remove from old tutor assignment
      if (changes.tutorEmail !== this.curTime.tutorEmail) {
        this.curTime.tutorSchedule?.removeTime(this.curTime);
        // and add the time to the new tutor
        if (changes.tutorEmail) {
          Tutors.instance!.getTutor(changes.tutorEmail)?.addTime(this.curTime);
        }
      } else {
        sameTutor = true;
      }

      // remove from old room assignment
      if (changes.roomName !== this.curTime.roomName) {
        this.curTime.roomSchedule?.removeTime(this.curTime);
        // and add the time to the new room
        if (changes.roomName) {
          Rooms.instance!.getRoom(changes.roomName)?.addTime(this.curTime);
        }
      } else {
        sameRoom = true;
      }

      // apply changes to the time
      this.curTime.update(changes);

      // if there was not a reassignment
      // move the time from its previous day list, to the new day list
      if (sameTutor) {
        this.curTime.tutorSchedule?.updateTime(this.curTime, prevDay);
      }
      if (sameRoom) {
        this.curTime.roomSchedule?.updateTime(this.curTime, prevDay);
      }

    // * or if the editor was creating a new time
    } else {
      const newTime = TimeBlock.buildTimeBlock(changes);

      // add the time to tutor and room schedules if it has been assigned
      if (changes.tutorEmail) {
        Tutors.instance!.getTutor(changes.tutorEmail)?.schedule.addTime(newTime);
      }
      if (changes.roomName) {
        Rooms.instance!.getRoom(changes.roomName)?.schedule.addTime(newTime);
      }
    }
  }

  /**
   * Starts building a new time block. Provide the schedule this new time block will be tethered to.
   */
  createNewTime(client: Schedule) {
    this.openMenu();
    this.client = client;

    // set the values and notices on the owner row based on the type of 
    // schedule the client is
    if (this.client instanceof TutorSchedule) {
      this.getField(TimeEditor.email)!.setValue(this.client.tutor.email);
      this.getField(TimeEditor.email)!.setNotice(this.client.tutor.name);
    } else if (this.client instanceof RoomSchedule) {
      this.getField(TimeEditor.room)!.setValue(this.client.room.name);
      // display the open time range for the room's building
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

  /**
   * Loads a given time into the time editor. 
   * Uses the provided schedule as a tether for the time block.
   */
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
