import { Schedule, ErrorCodes } from "../schedule/schedule";
import { TimeBlock, Tags } from "../schedule/time-block";
import { Tutor } from "./tutor";
import { Days } from "../enums";
import { isValidSessionTime } from "../utils/session-times";
import { TimeEditor } from "../elements/editors/time-editor";

export class TutorSchedule extends Schedule {
  tutor: Tutor;

  constructor(tutor: Tutor) {
    super();
    this.tutor = tutor;
  }

  protected insertTime(time: TimeBlock): number {
    const times = this.week.get(time.day)!.times;
    if (times.length === 0) {
      times.push(time);
      this.week.get(time.day)!.div!.append(time.getTutorDiv());
      return 0;
    }
    for (let i = 0; i < times.length; i++) {
      if (times[i].start > time.start) {
        this.week.get(time.day)!.div!.insertBefore(times[i].getTutorDiv(), time.getTutorDiv());
        times.splice(i, 0, time);
        return i;
      }
    }
    times.push(time);
    this.week.get(time.day)!.div!.append(time.getRoomDiv());
    return times.length - 1;
  }

  override addTime(time: TimeBlock): ErrorCodes {
    if (time.tag === Tags.session && !isValidSessionTime(time)) {
      return ErrorCodes.invalidSession;
    }

    let hasConflict = false;
    this.forEachTimeInDay(time.day, (t) => {
      if (t.tag === Tags.session && t.conflictsWith(time)) {
        hasConflict = true;
      }
    });
    if (hasConflict) {
      time.setHasConflict(true);
      return ErrorCodes.conflict;
    }

    this.insertTime(time);
    time.setTutor(this.tutor.email);

    return ErrorCodes.success;
  }

  override pushTime(time: TimeBlock): void {
    this.insertTime(time);
    time.setTutor(this.tutor.email);
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

    if (time.tutorSchedule === this) {
      this.pushTime(time);
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
    time.setTutor(null);
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
      TimeEditor.instance!.createNewTime(this);
    });
    div.append(addTime);

    this.forEachDay((day, dayObj) => {
      dayObj.div = document.createElement("div");
      const title = document.createElement("p");
      title.innerHTML = `<b>${day}:</b>`;
      dayObj.div.append(title);
      dayObj.times.forEach((time) => {
        dayObj.div!.append(time.getTutorDiv());
      });
      div.append(dayObj.div);
    });

    return div;
  }
}