import { Schedule, ErrorCodes } from "../schedule/schedule";
import { TimeBlock, Tags } from "../schedule/time-block";
import { Tutor } from "./tutor";
import { Days } from "../enums";
import { isValidSessionTime } from "../utils/session-times";

export class TutorSchedule extends Schedule {
  tutor: Tutor;

  constructor(tutor: Tutor) {
    super();
    this.tutor = tutor;
  }

  protected insertTime(time: TimeBlock): number {
    const times = this.week.get(time.day!)!.times;
    if (times.length === 0) {
      times.push(time);
      this.week.get(time.day!)!.div!.append(time.getTutorDiv());
      return 0;
    }
    for (let i = 0; i < times.length; i++) {
      if (times[i].start! > time.start!) {
        this.week.get(time.day!)!.div!.insertBefore(times[i].getTutorDiv(), time.getTutorDiv());
        times.splice(i, 0, time);
        return i;
      }
    }
    return -1;
  }

  override addTime(time: TimeBlock): ErrorCodes {
    if (time.tag === Tags.session && !isValidSessionTime(time)) {
      return ErrorCodes.invalidSession;
    }

    let hasConflict = false;
    this.forEachTimeInDay(time.day!, (t) => {
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
    const ind = this.insertTime(time);
    if (this.getTimes(time.day!).length >= 1) {
      this.getDayDiv(time.day!)!.insertBefore(this.getTimeAt(time.day!, ind + 1)!.getTutorDiv(), time.getTutorDiv());
    } else {
      this.getDayDiv(time.day!)!.append(time.getTutorDiv());
    }
    time.setTutor(this.tutor.email);
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
    time.setTutor(null);
    return time;
  }

  protected override buildDiv(): HTMLDivElement {
    const div = document.createElement("div");

    const title = document.createElement("p");
    title.innerHTML = "<b>Schedule:</b>";
    div.append(title);

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