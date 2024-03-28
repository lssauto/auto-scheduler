/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Days } from "../days";
import { Messages } from "../elements/messages/messages";
import { Position, Positions } from "../positions";
import { Rooms } from "../rooms/rooms";
import { Tags, TimeBlock } from "../schedule/time-block";
import { Status, StatusOptions } from "../status-options";
import { Course } from "../tutors/course";
import { Tutor } from "../tutors/tutor";
import { Tutors } from "../tutors/tutors";
import * as timeConvert from "../utils/time-convert";

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
  courseID = "id"
}

export enum RoomResponses {
  scheduleByLSS = "lss will book me space",
  scheduleByTutor = "i'll book my own space",
  assignedToTutor = "scheduled by tutor"
}

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
}

export class ResponseTableMaker {

  public static readonly encodingHeader = "TE:";

  private static _instance: ResponseTableMaker | null = null;
  public static get instance(): ResponseTableMaker | null {
    return ResponseTableMaker._instance;
  }

  private _columnTitles: string[];
  public get columnTitles(): string[] {
    return this._columnTitles;
  }

  private _responseMatrix: string[][];
  public get responseMatrix(): string[][] {
    return this._responseMatrix;
  }

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

  buildResponses() {
    this._responses = [];
    const matrix = this._responseMatrix;
    const tutors = Tutors.instance!;

    for (let r = 0; r < matrix.length; r++) {
      const response: Response = {
        row: r + 2,
        encoding: "",
        timestamp: timeConvert.fromTimestamp(1),
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
        scheduler: ""
      };
      this._responses.push(response);

      for (let c = 0; c < this.columnTitles.length; c++) {
        const title = this.columnTitles[c].trim().toLowerCase();

        if (title.includes(Titles.timestamp)) {
          if (matrix[r][c].includes(ResponseTableMaker.encodingHeader)) {
            response.encoding = matrix[r][c];
            continue;
          } else {
            response.timestamp = matrix[r][c];
          }

        } else if (title.includes(Titles.email)) {
          if (!tutors.hasTutor(matrix[r][c])) {
            Messages.output(Messages.warn, {
              message: `"${matrix[r][c]}" is not a recognized email in the tutor list.`,
              row: r + 2
            });
            response.status = StatusOptions.missing;
          }
          response.email = matrix[r][c];

        } else if (title.includes(Titles.name)) {
          response.name = matrix[r][c];

        } else if (title.includes(Titles.resubmission)) {
          response.resubmission = (matrix[r][c] === "Yes" || matrix[r][c] === "yes");

        } else if (title.includes(Titles.returnee)) {
          response.returnee = (matrix[r][c] === "Yes" || matrix[r][c] === "yes");

        } else if (title.includes(Titles.courseID)) {
          const id = Course.formatID(matrix[r][c]);
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

        } else if (title.includes(Titles.position)) {
          if (tutors.getTutor(response.email)?.hasCourse(response.courseID)) {
            response.position = tutors.getTutor(response.email)!.getCourse(response.courseID)!.position;
          } else {
            response.position = Positions.match(matrix[r][c]);
          }

        } else if (title.includes(Titles.lectures)) {
          if (!matrix[r][c].includes("asynchronous")) {
            response.lectures = this.parseTimeSets({
              input: matrix[r][c],
              row: r,
              col: c,
              email: response.email,
              roomName: null,
              courseID: response.courseID,
              tag: Tags.lecture,
              scheduleByLSS: true
            });
          }

        } else if (title.includes(Titles.officeHours)) {
          if (!(matrix[r][c] === "") && !matrix[r][c].includes("N/A")) {
            response.lectures = this.parseTimeSets({
              input: matrix[r][c],
              row: r,
              col: c,
              email: response.email,
              roomName: null,
              courseID: response.courseID,
              tag: Tags.officeHours,
              scheduleByLSS: true
            });
          }

        } else if (title.includes(Titles.discord)) {
          if (!(matrix[r][c] === "") && !matrix[r][c].includes("N/A")) {
            response.discord = this.parseTimeSets({
              input: matrix[r][c],
              row: r,
              col: c,
              email: response.email,
              roomName: null,
              courseID: response.courseID,
              tag: Tags.discord,
              scheduleByLSS: true
            });
          }

        } else if (title.includes(Titles.comments)) {
          response.comments = matrix[r][c];

        } else if (title.includes(Titles.scheduler)) {
          response.scheduler = matrix[r][c];

        } else if (title.includes(Titles.status)) {
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

        } else if (title.includes(Titles.sessionOption)) {
          if (matrix[r][c] === "" || matrix[r][c].includes("N/A")) {
            c++;
            continue;
          }
          const timeStr = matrix[r][c];
          const roomStr = matrix[r][c + 1].toLowerCase();

          const timeObj = timeConvert.parseTimeStr(timeStr);
          if (timeObj === null) {
            Messages.output(Messages.warn, {
              message: `The time "${timeStr}" could not be parsed properly.`,
              expected: "[M/Tu/W/Th/F/Sat/Sun] ##:## [AM/PM] - ##:## [AM/PM]",
              solution: "This time can be manually added to the tutor's schedule using the 'Add Time' button.",
              cell: `(row: ${r + 2}, col: ${c + 1})` 
            });
            c++;
            continue;
          }

          const scheduleByLSS = roomStr.includes(RoomResponses.scheduleByLSS) || 
                                  Positions.isSelfSchedulable(response.position);
          
          let roomName: string | null = null;
          if (
            roomStr.includes(RoomResponses.assignedToTutor) || 
            (!roomStr.includes(RoomResponses.scheduleByLSS) && 
            !roomStr.includes(RoomResponses.scheduleByTutor))
          ) {
            roomName = matrix[r][c + 1];
          }

          response.times.push(TimeBlock.buildTimeBlock({
            coords: {row: r, col: c},
            tag: Tags.session,
            day: timeObj.days[0],
            start: timeObj.start,
            end: timeObj.end,
            scheduleByLSS: scheduleByLSS,
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

  parseTimeSets(args: {
    input: string, 
    row: number, 
    col: number, 
    email: string,
    roomName: string | null,
    courseID: string,
    tag: Tags, 
    scheduleByLSS: boolean
  }): TimeBlock[] {
    const sets = args.input.split(",");
    const times: TimeBlock[] = [];

    for (const set of sets) {
      const timeObj = timeConvert.parseTimeStr(set);
      if (timeObj === null) {
        Messages.output(Messages.warn, {
          message: `failed to parse time: "${set}".`,
          expected: "[M/Tu/W/Th/F/Sat/Sun] ##:## [AM/PM] - ##:## [AM/PM]",
          solution: "This time can be manually added to the tutor's schedule using the 'Add Time' button.",
          cell: `(row: ${args.row + 2}, col: ${args.col + 1})`
        });
        continue;
      }
      for (const day of timeObj.days) {
        times.push(TimeBlock.buildTimeBlock({
          coords: {row: args.row, col: args.col},
          tag: args.tag,
          day: day,
          start: timeObj.start,
          end: timeObj.end,
          scheduleByLSS: args.scheduleByLSS,
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
            this.responseMatrix[r][c] = rowObj.scheduler == "" ? "scheduler" : rowObj.scheduler; // TODO: replace with scheduler name
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
            this.responseMatrix[r][c] = rowObj.scheduler == "" ? "scheduler" : rowObj.scheduler; // TODO: replace with scheduler name
          }
        }

        output += this.responseMatrix[r].join("\t") + "\n";
      }
    }
    // add to clipboard
    void navigator.clipboard.writeText(output);
  
    Messages.output(Messages.success, "New response table copied to clipboard.");
  }

  static encodeTutor(tutor: Tutor): string {
    const tutorObj: any = {};
    tutorObj[EncodingTitles.name] = tutor.name;
    tutorObj[EncodingTitles.email] = tutor.email;
    tutorObj[EncodingTitles.returnee] = tutor.returnee;

    tutorObj[EncodingTitles.courses] = {};
    tutor.forEachCourse((course) => {
      tutorObj[EncodingTitles.courses][course.id] = {};
      tutorObj[EncodingTitles.courses][course.id][EncodingTitles.position] = course.position.title;
      tutorObj[EncodingTitles.courses][course.id][EncodingTitles.status] = course.status.title;
      tutorObj[EncodingTitles.courses][course.id][EncodingTitles.preference] = course.preference;
      tutorObj[EncodingTitles.courses][course.id][EncodingTitles.timestamp] = timeConvert.fromTimestamp(course.timestamp);
      tutorObj[EncodingTitles.courses][course.id][EncodingTitles.comments] = course.comments;
      tutorObj[EncodingTitles.courses][course.id][EncodingTitles.scheduler] = course.scheduler;
    });

    tutorObj[EncodingTitles.times] = [];

    tutor.forEachTime((time) => {
      const timeObj: any = {};
      timeObj[EncodingTitles.tag] = time.tag;
      timeObj[EncodingTitles.day] = time.day;
      timeObj[EncodingTitles.start] = time.start;
      timeObj[EncodingTitles.end] = time.end;
      timeObj[EncodingTitles.scheduleByLSS] = time.scheduleByLSS;
      timeObj[EncodingTitles.room] = time.roomName ?? "null";
      timeObj[EncodingTitles.courseID] = time.courseID ?? "null";
      tutorObj[EncodingTitles.times].push(timeObj);
    });

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

    return ResponseTableMaker.encodingHeader + JSON.stringify(tutorObj);
  }

  static decodeTutor(encoding: string): Tutor | null {
    if (!encoding.includes(ResponseTableMaker.encodingHeader)) {
      return null;
    }
    const jsonStr = encoding.slice(ResponseTableMaker.encodingHeader.length);
    const tutorObj = JSON.parse(jsonStr);

    Tutors.instance!.getTutor(tutorObj[EncodingTitles.email] as string)?.delete();

    const tutor = new Tutor(
      tutorObj[EncodingTitles.email] as string, 
      tutorObj[EncodingTitles.name] as string,
      tutorObj[EncodingTitles.returnee] as boolean
    );

    Tutors.instance!.addTutor(tutor);

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
        scheduler: courses[courseID][EncodingTitles.scheduler] as string
      }));
    }

    const times = tutorObj[EncodingTitles.times];
    for (const time of times) {
      const newTime = TimeBlock.buildTimeBlock({
        coords: { row: -1, col: -1 },
        tag: time[EncodingTitles.tag] as Tags,
        day: time[EncodingTitles.day] as Days,
        start: time[EncodingTitles.start] as number,
        end: time[EncodingTitles.end] as number,
        scheduleByLSS: time[EncodingTitles.scheduleByLSS] as boolean,
        tutorEmail: tutor.email,
        roomName: time[EncodingTitles.room] === "null" ? null : time[EncodingTitles.room] as string,
        courseID: time[EncodingTitles.courseID] === "null" ? null : time[EncodingTitles.courseID] as string
      });

      tutor.addTime(newTime);
      if (time[EncodingTitles.room] !== "null") {
        Rooms.instance!.getRoom(time[EncodingTitles.room] as string)?.addTime(newTime);
      }
    }

    const errors = tutorObj[EncodingTitles.errors];
    for (const time of errors) {
      tutor.addError(TimeBlock.buildTimeBlock({
        coords: { row: -1, col: -1 },
        tag: time[EncodingTitles.tag] as Tags,
        day: time[EncodingTitles.day] as Days,
        start: time[EncodingTitles.start] as number,
        end: time[EncodingTitles.end] as number,
        scheduleByLSS: time[EncodingTitles.scheduleByLSS] as boolean,
        tutorEmail: tutor.email,
        roomName: time[EncodingTitles.room] == "null" ? null : time[EncodingTitles.room] as string,
        courseID: time[EncodingTitles.courseID] == "null" ? null : time[EncodingTitles.courseID] as string
      }));
    }

    return tutor;
  }
}
