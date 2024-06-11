/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

// ! A bunch of linting is disabled because serialized tutor JSON haven't
// ! been made type-safe

import { Days } from "../days";
import { SchedulerName } from "../elements/header/scheduler-name";
import { Messages } from "../elements/messages/messages";
import { Position, Positions } from "../positions";
import { Rooms } from "../rooms/rooms";
import { ErrorCodes } from "../schedule/schedule";
import { Tags, TimeBlock } from "../schedule/time-block";
import { Status, StatusOptions } from "../status-options";
import { Course } from "../tutors/course";
import { Tutor } from "../tutors/tutor";
import { Tutors } from "../tutors/tutors";
import * as timeConvert from "../utils/time-convert";

/**
 * sub strings used to identify each submission form column
 */
export enum Titles {
  timestamp = "timestamp",
  email = "email address",
  name = "your name",
  resubmission = "resubmission",
  returnee = "have you worked for lss",
  courseID = "what class are you submitting this availability form for",
  position = "lss position",
  lectures = "class meeting days and times",
  officeHours = "office hours",
  discord = "discord support",
  comments = "anything else you want to let lss know",
  sessionOption = "session option",
  scheduler = "scheduler",
  status = "status",
}

/**
 * keys used in the serialized tutor JSON object.
 */
enum EncodingTitles {
  name = "name",
  email = "email",
  returnee = "returnee",
  courses = "courses",
  times = "times",
  errors = "errors",
  position = "pos",
  status = "status",
  preference = "pref",
  timestamp = "timestamp",
  comments = "comments",
  scheduler = "scheduler",
  tag = "tag",
  day = "d",
  start = "s",
  end = "e",
  scheduleByLSS = "byLSS",
  room = "room",
  courseID = "id",
  zoomLink = "zoom",
  isVirtual = "virtual"
}

/**
 * sub strings used to identify whether or not a tutor wants a time scheduled by LSS
 */
export enum RoomResponses {
  scheduleByLSS = "lss will book me space",
  scheduleByTutor = "i'll book my own space",
  assignedToTutor = "scheduled by tutor" // might not be useful anymore
}

/**
 * object structure response table rows will be parsed into 
 * to make operating on the data easier.
 */
export interface Response {
  row: number;
  encoding: string;
  timestamp: string;
  email: string;
  name: string;
  resubmission: boolean;
  returnee: boolean;
  courseID: string;
  position: Position;
  lectures: TimeBlock[];
  officeHours: TimeBlock[];
  discord: TimeBlock[];
  times: TimeBlock[];
  comments: string;
  status: Status;
  scheduler: string;
  zoomLink: string;
}

/**
 * Responsible for deconstructing and reconstructing the response table.
 */
export class ResponseTableMaker {

  /**
   * Concat to the beginning of a tutor's serialized JSON string 
   * to easily recognize the string as a tutor serialization.
   */
  public static readonly encodingHeader = "TE:";

  private static _instance: ResponseTableMaker | null = null;
  public static get instance(): ResponseTableMaker | null {
    return ResponseTableMaker._instance;
  }

  // the column titles of the response table
  private _columnTitles: string[];
  public get columnTitles(): string[] {
    return this._columnTitles;
  }

  // the data matrix for the the response table
  private _responseMatrix: string[][];
  public get responseMatrix(): string[][] {
    return this._responseMatrix;
  }

  // the parsed response objects for each row of the matrix
  private _responses: Response[];
  public get responses(): Response[] {
    return this._responses;
  }
  
  constructor() {
    if (
      ResponseTableMaker.instance !== null &&
      ResponseTableMaker.instance !== this
    ) {
      console.error("Singleton ResponseTableMaker class instantiated twice");
    }
    ResponseTableMaker._instance = this;

    this._columnTitles = [];
    this._responseMatrix = [];
    this._responses = [];
  }

  setColumnTitles(titles: string[]) {
    this._columnTitles = titles;
  }

  setOriginalMatrix(matrix: string[][]) {
    this._responseMatrix = matrix;
    console.log("response matrix:", matrix);
    this.buildResponses();
  }

  // use the response matrix to build the Response objects
  buildResponses() {
    this._responses = [];
    const matrix = this._responseMatrix;
    const tutors = Tutors.instance!;

    // ? displayed row number is +2 to account for column titles row, and 0 indexing
    // ? displayed column number is +1 to account for 0 indexing

    // for each row in the response matrix
    for (let r = 0; r < matrix.length; r++) {

      // start at default values
      const response: Response = {
        row: r + 2,
        encoding: "",
        timestamp: timeConvert.stampToStr(1),
        email: "",
        name: "",
        resubmission: false,
        returnee: false,
        courseID: Course.na,
        position: Positions.defaultPosition,
        lectures: [],
        officeHours: [],
        discord: [],
        times: [],
        comments: "",
        status: StatusOptions.inProgress,
        scheduler: "",
        zoomLink: "", // TODO: add parsing for zoom link
      };
      this._responses.push(response);

      // for each column in this row
      for (let c = 0; c < this.columnTitles.length; c++) {
        // get this column's title
        const title = this.columnTitles[c].trim().toLowerCase();

        // * Timestamp ================
        if (title.includes(Titles.timestamp)) {
          // timestamp can contain response timestamp, or the tutor's encoding
          if (matrix[r][c].includes(ResponseTableMaker.encodingHeader)) {
            response.encoding = matrix[r][c];
            continue;
          } else {
            response.timestamp = matrix[r][c];
          }
        
        // * Email ====================
        } else if (title.includes(Titles.email)) {
          // check if provided email is an expected response
          if (!tutors.hasTutor(matrix[r][c])) {
            Messages.output(Messages.warn, {
              message: `"${matrix[r][c]}" is not a recognized email in the tutor list.`,
              row: r + 2
            });
            response.status = StatusOptions.missing;
          }
          response.email = matrix[r][c];
        
        // * Name =====================
        } else if (title.includes(Titles.name)) {
          response.name = matrix[r][c];

        // * Resubmission =============
        } else if (title.includes(Titles.resubmission)) {
          response.resubmission = (matrix[r][c] === "Yes" || matrix[r][c] === "yes");
        
        // * Returnee =================
        } else if (title.includes(Titles.returnee)) {
          response.returnee = (matrix[r][c] === "Yes" || matrix[r][c] === "yes");
        
        // * Course ID ================
        } else if (title.includes(Titles.courseID)) {
          // format the id
          const id = Course.formatID(matrix[r][c]);

          // and check if the tutor is assigned to this course
          if (tutors.hasTutor(response.email) && !tutors.getTutor(response.email)?.hasCourse(id)) {
            const tutor = tutors.getTutor(response.email)!;
            Messages.output(Messages.warn, {
              message: `"${matrix[r][c]}" is not a recognized course for ${tutor.name} (${tutor.email}), or is incorrectly formatted. 
              Submission will be labeled as '${StatusOptions.wrongCourse.title}'.`,
              row: r + 2
            });
            response.status = StatusOptions.wrongCourse;
          }
          response.courseID = id;

        // * Position =================
        } else if (title.includes(Titles.position)) {
          // just use the position assigned to the course already loaded into the program
          if (tutors.getTutor(response.email)?.hasCourse(response.courseID)) {
            response.position = tutors.getTutor(response.email)!.getCourse(response.courseID)!.position;
          } else {
            response.position = Positions.match(matrix[r][c]);
          }
        
        // * Lecture Times ============
        } else if (title.includes(Titles.lectures)) {
          // if the class isn't async
          if (!matrix[r][c].includes("asynchronous") && !matrix[r][c].includes("N/A")) {
            // break the lecture times string into TimeBlock instances
            response.lectures = this.parseTimeSets({
              input: matrix[r][c],
              row: r,
              col: c,
              email: response.email,
              roomName: null,
              courseID: response.courseID,
              tag: Tags.lecture,
              scheduleByLSS: true,
              isVirtual: false
            });
          }
        
        // * Office Hours =============
        } else if (title.includes(Titles.officeHours)) {
          if (!(matrix[r][c] === "") && !matrix[r][c].includes("N/A")) {
            // break office hours string into TimeBlock instances
            response.officeHours = this.parseTimeSets({
              input: matrix[r][c],
              row: r,
              col: c,
              email: response.email,
              roomName: null,
              courseID: response.courseID,
              tag: Tags.officeHours,
              scheduleByLSS: true,
              isVirtual: false
            });
          }
        
        // * Discord Support ==========
        } else if (title.includes(Titles.discord)) {
          if (!(matrix[r][c] === "") && !matrix[r][c].includes("N/A")) {
            // break discord support times into TimeBlock instances
            response.discord = this.parseTimeSets({
              input: matrix[r][c],
              row: r,
              col: c,
              email: response.email,
              roomName: null,
              courseID: response.courseID,
              tag: Tags.discord,
              scheduleByLSS: true,
              isVirtual: true
            });
          }

        // * Comments =================
        } else if (title.includes(Titles.comments)) {
          response.comments = matrix[r][c];

        // * Scheduler ================
        } else if (title.includes(Titles.scheduler)) {
          response.scheduler = matrix[r][c];

        // * Status ===================
        } else if (title.includes(Titles.status)) {
          // only replace the status if another error wasn't encountered earlier in parsing
          // if the status is empty, then this is a new submission
          if (response.status === StatusOptions.inProgress) {
            if (matrix[r][c] === "") continue;
            response.status = StatusOptions.match(matrix[r][c]);

          } else if (matrix[r][c] !== "") {
            Messages.output(Messages.warn, {
              message: `Status of "${matrix[r][c]}" found in data, but an error was encountered 
              at a different cell, so status will be replaced with "${response.status.title}".`,
              row: r + 2
            });
          }

        // * Session Times ============
        } else if (title.includes(Titles.sessionOption)) {
          // skip empty times
          if (matrix[r][c] === "" || matrix[r][c].includes("N/A")) {
            c++;
            continue;
          }
          // string containing day and start time (sessions are assumed 1hr)
          const timeStr = matrix[r][c];
          // string containing whether or not the tutor wants the session scheduled by lss
          const roomStr = matrix[r][c + 1].toLowerCase();

          // parse the time string into an easier to operate on object
          const timeObj = timeConvert.parseTimeStr(timeStr);
          // skip time if parsing failed
          if (timeObj === null) {
            Messages.output(Messages.warn, {
              message: `The time "${timeStr}" could not be parsed properly.`,
              expected: "[M/Tu/W/Th/F/Sat/Sun] ##:## [AM/PM] - ##:## [AM/PM]",
              solution: "This time can be manually added to the tutor's schedule using the 'Add Time' button.",
              cell: `(row: ${r + 2}, col: ${Messages.getColumnName(c + 1)})` 
            });
            c++;
            continue;
          }

          // convert roomStr into a bool
          const scheduleByLSS = roomStr.includes(RoomResponses.scheduleByLSS) || 
                                  Positions.isSelfSchedulable(response.position);
          
          // not useful anymore ?
          let roomName: string | null = null;
          if (roomStr.includes(Tutor.tutorScheduled.toLowerCase())) {
            roomName = Tutor.tutorScheduled;
          } else if (
            !roomStr.includes(RoomResponses.scheduleByLSS) && 
            !roomStr.includes(RoomResponses.scheduleByTutor)
          ) {
            roomName = matrix[r][c + 1];
          }

          // add new TimeBlock instance representing the parsed submission
          response.times.push(TimeBlock.buildTimeBlock({
            coords: {row: r, col: c},
            tag: Tags.session,
            day: timeObj.days[0],
            start: timeObj.start,
            end: timeObj.end,
            scheduleByLSS: scheduleByLSS,
            isVirtual: false, // TODO: add virtual session parsing
            tutorEmail: response.email,
            roomName: roomName,
            courseID: response.courseID
          }));
          c++;
        }
      }
    }

    console.log("response objs:", this._responses);
  }

  /**
   * Use to parse complicated time range strings into a list of TimeBlock instances.
   * Expects the format "[M/Tu/W/Th/F/Sat/Sun] HH:MM [AM/PM] - HH:MM [AM/PM], ...".
   */
  parseTimeSets(args: {
    input: string, 
    row: number, 
    col: number, 
    email: string,
    roomName: string | null,
    courseID: string,
    tag: Tags, 
    scheduleByLSS: boolean,
    isVirtual: boolean
  }): TimeBlock[] {
    // split string into groups of time ranges
    const sets = args.input.split(",");
    const times: TimeBlock[] = [];

    for (const set of sets) {
      // try to parse the individual time range
      const timeObj = timeConvert.parseTimeStr(set);
      if (timeObj === null) {
        Messages.output(Messages.warn, {
          message: `failed to parse time: "${set}".`,
          expected: "[M/Tu/W/Th/F/Sat/Sun] ##:## [AM/PM] - ##:## [AM/PM]",
          solution: "This time can be manually added to the tutor's schedule using the 'Add Time' button.",
          cell: `(row: ${args.row + 2}, col: ${Messages.getColumnName(args.col + 1)})`
        });
        continue;
      }
      // create a new TimeBlock for each day in the parsed time object
      for (const day of timeObj.days) {
        times.push(TimeBlock.buildTimeBlock({
          coords: {row: args.row, col: args.col},
          tag: args.tag,
          day: day,
          start: timeObj.start,
          end: timeObj.end,
          scheduleByLSS: args.scheduleByLSS,
          isVirtual: args.isVirtual,
          tutorEmail: args.email,
          roomName: args.roomName,
          courseID: args.courseID
        }));
      }
    }
    return times;
  }

  copyResponseTable() {
    const tutors = Tutors.instance!;

    let output = "";
    output += this.columnTitles.join("\t") + "\n";

    for (let r = 0; r < this.responseMatrix.length; r++) {
      const rowObj = this.responses[r];

      // If tutor was deleted
      if (!tutors.hasTutor(rowObj.email) || !(tutors.getTutor(rowObj.email)?.hasCourse(rowObj.courseID) ?? true)) {
        for (let c = 0; c < this.columnTitles.length; c++) {
          const title = this.columnTitles[c].trim().toLowerCase();

          if (title.includes(Titles.timestamp)) {
            this.responseMatrix[r][c] = rowObj.timestamp;

          } else if (title.includes(Titles.status)) {
            this.responseMatrix[r][c] = StatusOptions.pastSubmission.title;

          } else if (title.includes(Titles.scheduler)) {
            this.responseMatrix[r][c] = rowObj.scheduler == "" ? SchedulerName.name : rowObj.scheduler;
          }
        }

      } else {
        const tutor = tutors.getTutor(rowObj.email)!;

        // replace timestamp with encoding
        this.responseMatrix[r][0] = ResponseTableMaker.encodeTutor(tutor);

        // set status and scheduler
        for (let c = 0; c < this.columnTitles.length; c++) {
          const title = this.columnTitles[c].trim().toLowerCase();

          if (title.includes(Titles.status)) {
            this.responseMatrix[r][c] = tutor.getCourse(rowObj.courseID)!.status.title;

          } else if (title.includes(Titles.scheduler)) {
            this.responseMatrix[r][c] = rowObj.scheduler == "" ? SchedulerName.name : rowObj.scheduler;
          }
        }

        output += this.responseMatrix[r].join("\t") + "\n";
      }
    }
    // add to clipboard
    void navigator.clipboard.writeText(output);
  
    Messages.output(Messages.success, "New response table copied to clipboard.");
  }

  /**
   * Returns the tutor as a serialized JSON string. 
   * Use to save the program state in the response table copy out.
   */
  static encodeTutor(tutor: Tutor): string {
    const tutorObj: any = {};
    tutorObj[EncodingTitles.name] = tutor.name;
    tutorObj[EncodingTitles.email] = tutor.email;
    tutorObj[EncodingTitles.returnee] = tutor.returnee;

    // encode each course
    tutorObj[EncodingTitles.courses] = {};
    tutor.forEachCourse((course) => {
      tutorObj[EncodingTitles.courses][course.id] = {};
      tutorObj[EncodingTitles.courses][course.id][EncodingTitles.position] = course.position.title;
      tutorObj[EncodingTitles.courses][course.id][EncodingTitles.status] = course.status.title;
      tutorObj[EncodingTitles.courses][course.id][EncodingTitles.preference] = course.preference;
      tutorObj[EncodingTitles.courses][course.id][EncodingTitles.timestamp] = timeConvert.stampToStr(course.timestamp);
      tutorObj[EncodingTitles.courses][course.id][EncodingTitles.comments] = course.comments;
      tutorObj[EncodingTitles.courses][course.id][EncodingTitles.scheduler] = course.scheduler;
      tutorObj[EncodingTitles.courses][course.id][EncodingTitles.zoomLink] = course.zoomLink;
    });

    tutorObj[EncodingTitles.times] = [];

    // encode each time
    tutor.forEachTime((time) => {
      const timeObj: any = {};
      timeObj[EncodingTitles.tag] = time.tag;
      timeObj[EncodingTitles.day] = time.day;
      timeObj[EncodingTitles.start] = time.start;
      timeObj[EncodingTitles.end] = time.end;
      timeObj[EncodingTitles.scheduleByLSS] = time.scheduleByLSS;
      timeObj[EncodingTitles.isVirtual] = time.isVirtual;
      timeObj[EncodingTitles.room] = time.roomName ?? "null";
      timeObj[EncodingTitles.courseID] = time.courseID ?? "null";
      tutorObj[EncodingTitles.times].push(timeObj);
    });

    // encode errors separately
    tutorObj[EncodingTitles.errors] = [];
    tutor.forEachError((error) => {
      const timeObj: any = {};
      timeObj[EncodingTitles.tag] = error.tag;
      timeObj[EncodingTitles.day] = error.day;
      timeObj[EncodingTitles.start] = error.start;
      timeObj[EncodingTitles.end] = error.end;
      timeObj[EncodingTitles.scheduleByLSS] = error.scheduleByLSS;
      timeObj[EncodingTitles.room] = error.roomName ?? "null";
      timeObj[EncodingTitles.courseID] = error.courseID ?? "null";
      tutorObj[EncodingTitles.errors].push(timeObj);
    });

    // add encoding header to string
    return ResponseTableMaker.encodingHeader + JSON.stringify(tutorObj);
  }

  /**
   * Deserializes a JSON encoding of a tutor, and returns a reconstructed tutor instance.
   * It will attach the tutor to time blocks that match the serialization, if they can be found.
   */
  static decodeTutor(encoding: string): Tutor | null {
    if (!encoding.includes(ResponseTableMaker.encodingHeader)) {
      return null;
    }
    const jsonStr = encoding.slice(ResponseTableMaker.encodingHeader.length);
    const tutorObj = JSON.parse(jsonStr);

    // delete the existing instance of this tutor so that it can be replaced
    Tutors.instance!.getTutor(tutorObj[EncodingTitles.email] as string)?.delete();

    const tutor = new Tutor(
      tutorObj[EncodingTitles.email] as string, 
      tutorObj[EncodingTitles.name] as string,
      tutorObj[EncodingTitles.returnee] as boolean
    );
    
    // replaces old tutor instance
    Tutors.instance!.addTutor(tutor);

    // add courses to new tutor
    const courses = tutorObj[EncodingTitles.courses];
    for (const courseID in courses) {
      tutor.addCourse(Course.buildCourse({
        tutor: tutor,
        id: courseID,
        position: Positions.match(courses[courseID][EncodingTitles.position] as string),
        status: StatusOptions.match(courses[courseID][EncodingTitles.status] as string),
        preference: courses[courseID][EncodingTitles.preference] as string,
        row: 0,
        timestamp: courses[courseID][EncodingTitles.timestamp] as string,
        comments: courses[courseID][EncodingTitles.comments] as string,
        scheduler: courses[courseID][EncodingTitles.scheduler] as string,
        zoomLink: (courses[courseID][EncodingTitles.zoomLink] ?? "") as string
      }));
    }

    // add times to new tutor
    const times = tutorObj[EncodingTitles.times];
    for (const time of times) {

      // if the same time can be found on a room, use that instead of creating a new time block
      const room = Rooms.instance!.getRoom(time[EncodingTitles.room] as string);
      const find = room?.schedule.findTime({
        tag: time[EncodingTitles.tag] as Tags,
        day: time[EncodingTitles.day] as Days,
        start: time[EncodingTitles.start] as number,
        end: time[EncodingTitles.end] as number,
        courseID: time[EncodingTitles.courseID] === "null" ? null : time[EncodingTitles.courseID] as string,
        roomName: time[EncodingTitles.room] === "null" ? null : time[EncodingTitles.room] as string,
        tutorEmail: tutor.email
      });

      // if the time couldn't be found on a room, then just make a new one
      const newTime = find ?? TimeBlock.buildTimeBlock({
        coords: { row: -1, col: -1 },
        tag: time[EncodingTitles.tag] as Tags,
        day: time[EncodingTitles.day] as Days,
        start: time[EncodingTitles.start] as number,
        end: time[EncodingTitles.end] as number,
        scheduleByLSS: time[EncodingTitles.scheduleByLSS] as boolean,
        isVirtual: time[EncodingTitles.isVirtual] as boolean,
        tutorEmail: tutor.email,
        roomName: time[EncodingTitles.room] === "null" ? null : time[EncodingTitles.room] as string,
        courseID: time[EncodingTitles.courseID] === "null" ? null : time[EncodingTitles.courseID] as string
      });

      tutor.addTime(newTime);

      // if the time did have a room assignment, but the time wasn't found on the room,
      // add the time to the room
      if (room && !room.schedule.hasTime(newTime)) {
        const errorCode = room.addTime(newTime);

        if (errorCode !== ErrorCodes.success) {
          newTime.setRoom(null);
          newTime.onEditedDispatch();
          Messages.output(Messages.error, {
            message: `${tutor.name}'s ${newTime.tag} at ${
              newTime.getDayAndStartStr()
            } cannot be assigned to ${
              room.name
            } because the room returned this error: "${errorCode}". This assignment is being removed.`,
            solution: "This time can be rescheduled in a new room, or manually assigned a room by clicking on its 'Edit' button."
          });
        }
      }
    }

    // add the errors
    const errors = tutorObj[EncodingTitles.errors];
    for (const time of errors) {
      tutor.addError(TimeBlock.buildTimeBlock({
        coords: { row: -1, col: -1 },
        tag: time[EncodingTitles.tag] as Tags,
        day: time[EncodingTitles.day] as Days,
        start: time[EncodingTitles.start] as number,
        end: time[EncodingTitles.end] as number,
        scheduleByLSS: time[EncodingTitles.scheduleByLSS] as boolean,
        isVirtual: time[EncodingTitles.isVirtual] as boolean,
        tutorEmail: tutor.email,
        roomName: time[EncodingTitles.room] == "null" ? null : time[EncodingTitles.room] as string,
        courseID: time[EncodingTitles.courseID] == "null" ? null : time[EncodingTitles.courseID] as string
      }).setError(ErrorCodes.conflict));
    }

    return tutor;
  }
}
