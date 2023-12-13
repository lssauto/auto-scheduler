import { Schedule, ErrorCodes } from "../schedule/schedule";
import { TimeBlock, Tags } from "../schedule/time-block";
import { Room } from "./room";
import { Rooms } from "./rooms";
import { Days } from "../enums";
import { TimeEditor } from "../elements/editors/time-editor";

export interface AvailableRange {
  days: Days[];
  start: number;
  end: number;
}

export const MAX_SESSIONS_PER_DAY = 4;

export class RoomSchedule extends Schedule {
  room: Room;
  range: AvailableRange;
  sessionCounts: Map<Days, number>;

  constructor(room: Room) {
    super();
    this.room = room;
    this.range = Rooms.defaultRange;
    this.sessionCounts = new Map<Days, number>();
    this.sessionCounts.set(Days.mon, 0);
    this.sessionCounts.set(Days.tue, 0);
    this.sessionCounts.set(Days.wed, 0);
    this.sessionCounts.set(Days.thu, 0);
    this.sessionCounts.set(Days.fri, 0);
    this.sessionCounts.set(Days.sat, 0);
    this.sessionCounts.set(Days.sun, 0);
  }

  setRange(range: AvailableRange) {
    this.range = range;
  }

  isInRange(time: TimeBlock | {day: Days, start?: number, end?: number}): boolean {
    if (!this.range.days.includes(time.day!)) {
      return false;
    }
    if (time.start === undefined || time.end === undefined) {
      return true;
    }

    if (time.start < this.range.start || this.range.end < time.end) {
      return false;
    }
    return true;
  }

  protected insertTime(time: TimeBlock): number {
    const times = this.week.get(time.day!)!.times;
    if (times.length === 0) {
      times.push(time);
      this.week.get(time.day!)!.div!.append(time.getRoomDiv());
      return 0;
    }
    for (let i = 0; i < times.length; i++) {
      if (times[i].start! > time.start!) {
        this.week.get(time.day!)!.div!.insertBefore(times[i].getRoomDiv(), time.getRoomDiv());
        times.splice(i, 0, time);
        return i;
      }
    }
    times.push(time);
    this.week.get(time.day!)!.div!.append(time.getRoomDiv());
    return times.length - 1;
  }

  override addTime(time: TimeBlock): ErrorCodes {
    if (!this.isInRange(time)) {
      return ErrorCodes.outOfRange;
    }

    if (this.sessionCounts.get(time.day!)! >= MAX_SESSIONS_PER_DAY) {
      return ErrorCodes.overBooked;
    }

    if (this.hasConflictWith(time)) {
      return ErrorCodes.conflict;
    }

    this.insertTime(time);
    time.setRoom(this.room.name);

    if (time.tag === Tags.session) {
      this.sessionCounts.set(time.day!, this.sessionCounts.get(time.day!)! + 1);
    }

    return ErrorCodes.success;
  }

  override pushTime(time: TimeBlock): void {
    this.insertTime(time);
    time.setRoom(this.room.name);
    if (time.tag === Tags.session) {
      this.sessionCounts.set(time.day!, this.sessionCounts.get(time.day!)! + 1);
    }
  }

  override updateTime(time: TimeBlock, prevDay?: Days): void {
    if (prevDay !== undefined) {
      const times = this.getTimes(prevDay);
      let index = -1;
      for (let i = 0; i < times.length; i++) {
        if (times[i] === time) {
          index = i;
        }
      }

      if (index !== -1) {
        times.splice(index, 1);
      }
    }

    if (time.roomSchedule === this) {
      this.pushTime(time);
    }
  }

  override removeTime(time: TimeBlock): TimeBlock | null {
    const index = this.findTimeIndex(time);
    if (index === -1) {
      return null;
    }
    return this.removeTimeAt(time.day!, index);
  }

  override removeTimeAt(day: Days, index: number): TimeBlock | null {
    if (index < 0 || index >= this.getTimes(day).length) {
      return null;
    }
    const time = this.getTimes(day).splice(index, 1)[0];
    time.setRoom(null);
    return time;
  }

  protected override buildDiv(): HTMLDivElement {
    const div = document.createElement("div");

    const title = document.createElement("p");
    title.innerHTML = "<b>Schedule:</b>";
    div.append(title);

    const addTime = document.createElement("button");
    addTime.innerHTML = "Add Time";
    addTime.addEventListener("click", () => {
      TimeEditor.createNewTime(this);
    });
    div.append(addTime);

    this.forEachDay((day, dayObj) => {
      dayObj.div = document.createElement("div");
      const title = document.createElement("p");
      title.innerHTML = `<b>${day}:</b>`;
      dayObj.div.append(title);
      dayObj.times.forEach((time) => {
        dayObj.div!.append(time.getRoomDiv());
      });
      div.append(dayObj.div);
    });

    return div;
  }
}