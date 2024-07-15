import { TimeBlock, TimeBlockMatcher } from "./time-block";
import { Days } from "../days";

/**
 * Returned by `schedule.addTime(timeBlock)`, says if the time was added to the schedule,
 * and why if it failed to. 
 */
export enum ErrorCodes {
  conflict = "conflict",
  overBooked = "over-booked",
  invalidSession = "invalid session time",
  outOfRange = "outside open hours",
  success = "success",
}

/**
 * `div` - the HTML container for each day's times.
 * 
 * `times` - the array of TimeBlocks that are on this day.
 */
export interface Day {
  div: HTMLDivElement | null;
  times: TimeBlock[];
}

/**
 * basic functionality for schedules, inherited by room and tutor schedule classes.
 * Maps lists of times to days.
 */
export abstract class Schedule implements Iterable<TimeBlock> {
  protected week: Map<Days, Day>;
  div: HTMLDivElement | null;

  constructor() {
    this.week = new Map<Days, Day>();
    this.week.set(Days.mon, {div: null, times: []});
    this.week.set(Days.tue, {div: null, times: []});
    this.week.set(Days.wed, {div: null, times: []});
    this.week.set(Days.thu, {div: null, times: []});
    this.week.set(Days.fri, {div: null, times: []});
    this.week.set(Days.sat, {div: null, times: []});
    this.week.set(Days.sun, {div: null, times: []});
    this.div = null;
  }

  forEachTime(action: (time: TimeBlock) => void): void {
    this.week.forEach((day) => {
      day.times.forEach(action);
    });
  }

  [Symbol.iterator](): Iterator<TimeBlock> {
    const days = [Days.mon, Days.tue, Days.wed, Days.thu, Days.sat, Days.sun];
    let curDay = 0;
    let ind = 0;
    return {
      next: () => {
        while (ind >= (this.week.get(days[curDay])?.times.length ?? 0) && curDay < days.length) {
          curDay++;
          ind = 0;
        }
        const time = this.week.get(days[curDay])?.times[ind];
        ind++;
        return {
          done: time === undefined,
          value: time!
        };
      }
    };
  }

  forEachTimeInOrder(order: Days[], action: (time: TimeBlock) => void): void {
    for (const day of order) {
      this.week.get(day)!.times.forEach(action);
    }
  }

  forEachTimeInDay(day: Days, action: (time: TimeBlock) => void): void {
    this.week.get(day)!.times.forEach(action);
  }

  forEachDay(action: (key: Days, day: Day) => void): void {
    for (const day of this.week) {
      action(day[0], day[1]);
    }
  }

  /**
   * Returns the number of time blocks in this schedule.
   */
  get count(): number {
    let sum = 0;
    for (const day of this.week) {
      sum += day[1].times.length;
    }
    return sum;
  }

  /**
   * Returns true if there are no time blocks in this schedule.
   */
  get isEmpty(): boolean {
    return this.count === 0;
  }

  protected abstract insertTime(time: TimeBlock): number;

  /**
   * Try to add a time to this schedule. Will perform a series of checks to see 
   * if the insertion is valid. If it is not, then the time will not be inserted, 
   * and an error code other than `ErrorCodes.success` will be returned.
   */
  abstract addTime(time: TimeBlock): ErrorCodes;

  /**
   * Insert a time into this schedule. Does not perform any of the checks done by 
   * addTime().
   */
  abstract pushTime(time: TimeBlock): void;

  abstract removeTime(time: TimeBlock): TimeBlock | null;
  
  abstract removeTimeAt(day: Days, index: number): TimeBlock | null;
  
  /**
   * Use to move a time from one day's list to another.
   * Assumes the new day has been set in the time block. 
   * prevDay argument used to find the old position of the time.
   */
  updateTime(time: TimeBlock, prevDay: Days): void {
    // find old position of the time
    const times = this.getTimes(prevDay);
    let index = -1;
    for (let i = 0; i < times.length; i++) {
      if (times[i] === time) {
        index = i;
      }
    }

    // remove it
    if (index !== -1) {
      times.splice(index, 1);
    }

    // add it to the correct list
    this.insertTime(time);
  }

  /**
   * Returns true if the given time conflicts with any times in this schedule.
   * Use the `ignore` argument to avoid comparing against a specific time.
   */
  hasConflictWith(time: TimeBlock | {day: Days, start: number, end: number}, ignore?: TimeBlock): boolean {
    let hasConflict = false;
    this.forEachTimeInDay(time.day, (t) => {
      if (t === time || t === ignore) {
        return;
      }
      if (t.conflictsWith(time)) {
        hasConflict = true;
      }
    });
    return hasConflict;
  }

  /**
   * Finds the index of a time block in this schedule.
   * Returns -1 if the time block can't be found.
   */
  findTimeIndex(time: TimeBlock | TimeBlockMatcher): number {
    const times = this.getTimes(time.day);
    for (let i = 0; i < times.length; i++) {
      if (times[i] === time || times[i].isEqual(time)) {
        return i;
      }
    }
    return -1;
  }

  hasTime(time: TimeBlock | TimeBlockMatcher): boolean {
    return this.findTimeIndex(time) !== -1;
  }

  findTime(time: TimeBlockMatcher): TimeBlock | null {
    return this.getTimeAt(time.day, this.findTimeIndex(time));
  }

  getTimeAt(day: Days, index: number): TimeBlock | null {
    const times = this.week.get(day)!.times;
    if (index < 0 || times.length <= index) {
      return null;
    }
    return times[index];
  }

  getTimes(day: Days): TimeBlock[] {
    return this.week.get(day)!.times;
  }

  getDayDiv(day: Days): HTMLDivElement | null {
    return this.week.get(day)!.div;
  }

  // not really useful
  findTimeByCoords(row: number, col: number): TimeBlock | null {
    let result = null;
    this.forEachTime((time) => {
      if (time.coords.row === row && time.coords.col === col) {
        result = time;
      }
    });
    return result;
  }

  setDiv(div: HTMLDivElement): Schedule {
    this.div = div;
    return this;
  }

  getDiv(): HTMLDivElement {
    if (this.div === null) {
      this.div = this.buildDiv();
    }
    return this.div;
  }

  protected abstract buildDiv(): HTMLDivElement;
}
