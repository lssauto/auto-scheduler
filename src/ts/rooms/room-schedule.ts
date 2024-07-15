import { Schedule, ErrorCodes } from "../schedule/schedule";
import { TimeBlock, Tags } from "../schedule/time-block";
import { Room } from "./room";
import { Rooms } from "./rooms";
import { Building } from "./building";
import { Days } from "../days";
import { TimeEditor } from "../elements/editors/time-editor";

/**
 * The time range a building is open for. Used by room schedules to 
 * determine if a time can be scheduled in it.
 */
export interface AvailableRange {
  days: Days[];
  start: number;
  end: number;
}

/**
 * The max number of sessions a room can have assigned per day.
 */
export const MAX_SESSIONS_PER_DAY = 4;

export class RoomSchedule extends Schedule {
  room: Room;

  // tracks the number of sessions a room has to compare against MAX_SESSIONS_PER_DAY
  sessionCounts: Map<Days, number>;

  constructor(room: Room) {
    super();
    this.room = room;
    this.sessionCounts = new Map<Days, number>();
    this.sessionCounts.set(Days.mon, 0);
    this.sessionCounts.set(Days.tue, 0);
    this.sessionCounts.set(Days.wed, 0);
    this.sessionCounts.set(Days.thu, 0);
    this.sessionCounts.set(Days.fri, 0);
    this.sessionCounts.set(Days.sat, 0);
    this.sessionCounts.set(Days.sun, 0);
  }

  getBuilding(): Building | null {
    return this.room.getBuilding();
  }

  get range(): AvailableRange {
    return this.getBuilding()?.range ?? Rooms.defaultRange;
  }

  /**
   * Returns true if the given time is within this room's open time range.
   */
  isInRange(time: TimeBlock | {day: Days, start?: number, end?: number}): boolean {
    if (this.getBuilding()) {
      return this.getBuilding()!.isInRange(time);
    }
    
    if (!this.range.days.includes(time.day)) {
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
    // the time block list this time should be inserted into
    const times = this.week.get(time.day)!.times;

    // add the first time if the list is empty
    if (times.length === 0) {
      times.push(time);
      this.week.get(time.day)!.div?.append(time.getRoomDiv());
      return 0;
    }

    // find the sorted position where the time should be inserted at
    for (let i = 0; i < times.length; i++) {
      if (times[i].start > time.start) {
        this.week.get(time.day)!.div?.insertBefore(time.getRoomDiv(), times[i].getRoomDiv());
        times.splice(i, 0, time);
        return i;
      }
    }

    // if sorted position isn't inside the list, then append to the back
    times.push(time);
    this.week.get(time.day)!.div?.append(time.getRoomDiv());
    return times.length - 1;
  }

  override addTime(time: TimeBlock): ErrorCodes {
    if (!this.isInRange(time)) {
      return ErrorCodes.outOfRange;
    }

    if (this.sessionCounts.get(time.day)! >= MAX_SESSIONS_PER_DAY && !this.room.isRequestRoom) {
      return ErrorCodes.overBooked;
    }

    if (this.hasConflictWith(time)) {
      return ErrorCodes.conflict;
    }

    this.insertTime(time);
    time.setRoom(this.room.name);

    if (time.tag === Tags.session) {
      this.sessionCounts.set(time.day, this.sessionCounts.get(time.day)! + 1);
    }

    return ErrorCodes.success;
  }

  override pushTime(time: TimeBlock): void {
    this.insertTime(time);
    time.setRoom(this.room.name);
    if (time.tag === Tags.session) {
      this.sessionCounts.set(time.day, this.sessionCounts.get(time.day)! + 1);
    }
  }

  override removeTime(time: TimeBlock): TimeBlock | null {
    const index = this.findTimeIndex(time);
    if (index === -1) {
      return null;
    }
    return this.removeTimeAt(time.day, index);
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

    // add time button styling
    const addTime = document.createElement("button");
    addTime.style.backgroundColor = "#f8f8f8";
    addTime.style.border = "1px solid #565656";
    addTime.style.borderRadius = "2px";
    addTime.addEventListener("mouseover", () => {
      addTime.style.backgroundColor = "#e8e8e8";
    });
    addTime.addEventListener("mouseout", () => {
      addTime.style.backgroundColor = "#f8f8f8";
    });
    addTime.innerHTML = "Add Time";

    // add time button calls time editor
    addTime.addEventListener("click", () => {
      TimeEditor.instance!.createNewTime(this);
    });
    div.append(addTime);

    // build each time block's div
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