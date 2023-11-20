import { TimeBlock } from "./time-block";
import { Days } from "../enums";

export enum ErrorCodes {
  conflict,
  overBooked,
  invalidSession,
  outOfRange,
  success,
}

export abstract class Schedule {
  week: Map<Days, TimeBlock[]>;
  div: HTMLDivElement | null;

  constructor() {
    this.week = new Map<Days, TimeBlock[]>();
    this.week.set(Days.mon, []);
    this.week.set(Days.tue, []);
    this.week.set(Days.wed, []);
    this.week.set(Days.thu, []);
    this.week.set(Days.fri, []);
    this.week.set(Days.sat, []);
    this.week.set(Days.sun, []);
    this.div = null;
  }

  forEachTime(action: (time: TimeBlock) => void): void {
    this.week.forEach((times) => {
      times.forEach(action);
    });
  }

  forEachTimeInOrder(order: Days[], action: (time: TimeBlock) => void): void {
    for (const day of order) {
      this.week.get(day)!.forEach(action);
    }
  }

  forEachTimeInDay(day: Days, action: (time: TimeBlock) => void): void {
    this.week.get(day)!.forEach(action);
  }

  forEachDay(action: (day: Days, times: TimeBlock[]) => void): void {
    for (const day of this.week) {
      action(day[0], day[1]);
    }
  }

  protected insertTime(time: TimeBlock) {
    const times = this.week.get(time.day!)!;
    for (let i = 0; i < times.length; i++) {
      if (times[i].start! > time.start!) {
        times.splice(i, 0, time);
        return;
      }
    }
  }

  abstract addTime(time: TimeBlock): ErrorCodes;

  abstract pushTime(time: TimeBlock): void;

  abstract removeTime(time: TimeBlock): TimeBlock | null;

  abstract removeTimeAt(day: Days, index: number): TimeBlock | null;

  findTimeIndex(time: TimeBlock): number {
    const times = this.week.get(time.day!)!;
    for (let i = 0; i < times.length; i++) {
      if (times[i] === time) {
        return i;
      }
    }
    return -1;
  }

  findTimeByCoords(row: number, col: number): TimeBlock | null {
    let result = null;
    this.forEachTime((time) => {
      if (time.coords!.row === row && time.coords!.col === col) {
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
