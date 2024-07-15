import { defaultScheduler } from "./scheduler/default-scheduler";
import { SchedulerStrat } from "./scheduler/scheduler";

/**
 * Defines the structure of position objects. Only one should exist for 
 * each position. Tutors with the same position will reference the same object.
 */
export interface Position {
  readonly title: string;        // position title displayed
  readonly match: string;        // used to str match form responses
  readonly sessionLimit: number; // max number of sessions allowed
  readonly requestLimit: number; // when any remaining sessions will default to registrar requests
  readonly roomFilter: string[]; // what room types this position can be scheduled in
  readonly scheduler: SchedulerStrat; // the scheduling strategy used to find rooms for sessions
}

/**
 * Stores all of the position objects, and provides utility functions 
 * for operating on them.
 */
export class Positions {
  static readonly sgt: Position = {
    title: "SGT",
    match: "small",
    sessionLimit: 3,
    requestLimit: 2,
    roomFilter: ["SGT", "EMB SGT", "N/A"],
    scheduler: defaultScheduler
  };

  static readonly esgt: Position = {
    title: "EMB SGT",
    match: "embedded small",
    sessionLimit: 3,
    requestLimit: 2,
    roomFilter: ["SGT", "EMB SGT", "N/A"],
    scheduler: defaultScheduler
  };

  static readonly lgt: Position = {
    title: "LGT",
    match: "large",
    sessionLimit: 3,
    requestLimit: 2,
    roomFilter: ["LGT", "EMB LGT", "SI", "N/A"],
    scheduler: defaultScheduler
  };

  static readonly elgt: Position = {
    title: "EMB LGT",
    match: "embedded large",
    sessionLimit: 3,
    requestLimit: 2,
    roomFilter: ["LGT", "EMB LGT", "SI", "N/A"],
    scheduler: defaultScheduler
  };

  static readonly si: Position = {
    title: "SI",
    match: "si leader",
    sessionLimit: 3,
    requestLimit: 2,
    roomFilter: ["LGT", "EMB LGT", "SI", "N/A"],
    scheduler: defaultScheduler
  };

  static readonly wr: Position = {
    title: "WR",
    match: "writing",
    sessionLimit: 3,
    requestLimit: 2,
    roomFilter: ["WR", "N/A"],
    scheduler: defaultScheduler
  };

  static readonly na: Position = {
    title: "N/A",
    match: "n/a",
    sessionLimit: 3,
    requestLimit: 2,
    roomFilter: ["N/A", "SGT", "EMB SGT", "LGT", "EMB LGT", "SI", "WR"],
    scheduler: defaultScheduler
  };

  static readonly positions: Position[] = [
    Positions.lgt,
    Positions.sgt,
    Positions.elgt,
    Positions.esgt,
    Positions.si,
    Positions.wr,
    Positions.na
  ];
  
  static readonly defaultPosition: Position = Positions.na;

  static getTitles(): string[] {
    const titles: string[] = [];
    Positions.forEach((position) => {
      titles.push(position.title);
    });
    return titles;
  }

  static forEach(action: (position: Position) => void) {
    Positions.positions.forEach(action);
  }

  /**
   * Searches for any position's matcher or title in the provided string.
   */
  static match(str: string): Position {
    let pos = Positions.defaultPosition;
    const lower = str.toLowerCase();
    Positions.forEach(p => {
      const regexMatch = new RegExp(`\\b${p.match}\\b`);
      const regexTitle = new RegExp(`\\b${p.title.toLowerCase()}\\b`);
      if (lower.match(regexMatch) !== null || lower.match(regexTitle) !== null) {
        pos = p;
      }
    });
    return pos;
  }


  /**
   * List of positions that don't need to be assigned to a course.
   */
  static readonly courseless: Position[] = [
    Positions.wr,
    Positions.na
  ];

  static isCourseless(position: Position): boolean {
    return Positions.courseless.includes(position);
  }

  /**
   * List of positions that allow students to schedule their own sessions.
   */
  static readonly selfSchedulable: Position[] = [
    Positions.wr,
    Positions.esgt,
    Positions.sgt,
    Positions.na
  ];

  static isSelfSchedulable(position: Position): boolean {
    return Positions.selfSchedulable.includes(position);
  }
}
