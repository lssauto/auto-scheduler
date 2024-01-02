import { Messages } from "../elements/messages/messages";
import { Position, Positions } from "../positions";
import { Tags, TimeBlock } from "../schedule/time-block";
import { Status, StatusOptions } from "../status-options";
import { Course } from "../tutors/course";
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

export enum RoomResponses {
  scheduleByLSS = "lss will book me space",
  scheduleByTutor = "i'll book my own space",
  assignedToTutor = "scheduled by tutor"
}

export interface Response {
  row: number;
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
    this.buildResponses();
  }

  buildResponses() {
    this._responses = [];
    const matrix = this._responseMatrix;
    const tutors = Tutors.instance!;

    for (let r = 0; r < matrix.length; r++) {
      const response: Response = {
        row: r + 2,
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

      for (let c = 0; c < this.columnTitles.length; c++) {
        const title = this.columnTitles[c].toLowerCase();

        if (title.includes(Titles.timestamp)) {
          response.timestamp = matrix[r][c];

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
          const id = Course.formatID(matrix[c][r]);
          if (!tutors.getTutor(response.email)?.hasCourse(id)) {
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
        }
      }
    }
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
}
