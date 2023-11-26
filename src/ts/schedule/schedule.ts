import { TimeBlock } from "./time-block";
import { Days } from "../enums";

export enum ErrorCodes {
  conflict,
  overBooked,
  invalidSession,
  outOfRange,
  success,
}

export interface Day {
  div: HTMLDivElement | null;
  times: TimeBlock[];
}

export abstract class Schedule {
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

  protected insertTime(time: TimeBlock): number {
    const times = this.week.get(time.day!)!.times;
    if (times.length === 0) {
      times.push(time);
      return 0;
    }
    for (let i = 0; i < times.length; i++) {
      if (times[i].start! > time.start!) {
        times.splice(i, 0, time);
        return i;
      }
    }
    return -1;
  }

  abstract addTime(time: TimeBlock): ErrorCodes;

  abstract pushTime(time: TimeBlock): void;

  abstract removeTime(time: TimeBlock): TimeBlock | null;

  abstract removeTimeAt(day: Days, index: number): TimeBlock | null;

  findTimeIndex(time: TimeBlock): number {
    const times = this.week.get(time.day!)!.times;
    for (let i = 0; i < times.length; i++) {
      if (times[i] === time) {
        return i;
      }
    }
    return -1;
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
