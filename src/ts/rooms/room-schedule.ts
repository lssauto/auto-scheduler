import { Schedule, ErrorCodes } from "../schedule/schedule";
import { TimeBlock, Tags } from "../schedule/time-block";
import { Room } from "./room";
import { Rooms } from "./rooms";
import { Days } from "../enums";

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

  override addTime(time: TimeBlock): ErrorCodes {
    if (!this.range.days.includes(time.day!)) {
      return ErrorCodes.outOfRange;
    }
    if (this.range.start < time.start! || this.range.end < time.end!) {
      return ErrorCodes.outOfRange;
    }

    if (this.sessionCounts.get(time.day!)! >= MAX_SESSIONS_PER_DAY) {
      return ErrorCodes.overBooked;
    }

    let hasConflict = false;
    this.forEachTimeInDay(time.day!, (t) => {
      if (t.conflictsWith(time)) {
        hasConflict = true;
      }
    });
    if (hasConflict) {
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
  }

  override removeTime(time: TimeBlock): TimeBlock | null {
    const index = this.findTimeIndex(time);
    if (index === -1) {
      return null;
    }
    return this.removeTimeAt(time.day!, index);
  }

  override removeTimeAt(day: Days, index: number): TimeBlock | null {
    if (index < 0 || index >= this.week.get(day)!.length) {
      return null;
    }
    const time = this.week.get(day)!.splice(index, 1)[0];
    time.setRoom(null);
    return time;
  }

  protected override buildDiv(): HTMLDivElement {
    const div = document.createElement("div");

    this.forEachDay((day, times) => {
      const title = document.createElement("p");
      title.innerHTML = `<b>${day}</b>`;
      div.append(title);
      times.forEach((time) => {
        div.append(time.getRoomDiv());
      });
    });

    return div;
  }
}