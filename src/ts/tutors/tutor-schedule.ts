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
    time.setTutor(null);
    return time;
  }

  protected override buildDiv(): HTMLDivElement {
    const div = document.createElement("div");

    const title = document.createElement("p");
    title.innerHTML = "<b>Schedule:</b>";
    div.append(title);

    this.forEachDay((day, times) => {
      const title = document.createElement("p");
      title.innerHTML = `<b>${day}</b>`;
      div.append(title);
      times.forEach((time) => {
        div.append(time.getTutorDiv());
      });
    });

    return div;
  }
}