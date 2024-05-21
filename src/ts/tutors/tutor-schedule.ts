import { Schedule, ErrorCodes } from "../schedule/schedule";
import { TimeBlock, Tags } from "../schedule/time-block";
import { Tutor } from "./tutor";
import { Days } from "../days";
import { isValidSessionTime } from "../utils/session-times";
import { TimeEditor } from "../elements/editors/time-editor";

export class TutorSchedule extends Schedule {
  tutor: Tutor;

  constructor(tutor: Tutor) {
    super();
    this.tutor = tutor;
  }

  protected insertTime(time: TimeBlock): number {
    // the list of times this time should be inserted into
    const times = this.week.get(time.day)!.times;

    // if list is empty
    if (times.length === 0) {
      times.push(time);
      this.week.get(time.day)!.div?.append(time.getTutorDiv());
      return 0;
    }

    // find sorted position to insert the time
    for (let i = 0; i < times.length; i++) {
      if (times[i].start > time.start) {
        this.week.get(time.day)!.div?.insertBefore(time.getTutorDiv(), times[i].getTutorDiv());
        times.splice(i, 0, time);
        return i;
      }
    }

    // otherwise append to the end of the list
    times.push(time);
    this.week.get(time.day)!.div?.append(time.getTutorDiv());
    return times.length - 1;
  }

  override addTime(time: TimeBlock): ErrorCodes {
    // check if session matches a valid session time
    if (time.tag === Tags.session && !isValidSessionTime(time)) {
      time.setError(ErrorCodes.invalidSession);
      return ErrorCodes.invalidSession;
    }

    // check if a session conflicts with any other sessions
    if (time.tag === Tags.session) {
      for(const t of this.week.get(time.day)!.times) {
        // check for conflicts if the other time isn't a session, or if it's a session for the same class
        // allows for the same time to be submitted for different classes supported
        if (t.courseID === time.courseID && t.conflictsWith(time)) {
          time.setError(ErrorCodes.conflict);
          return ErrorCodes.conflict;
        }
      }

    // otherwise, check to see if any sessions need to be kicked off the schedule
    // other times like lectures and office hours take priority over sessions
    } else {
      for (const t of this.week.get(time.day)!.times) {
        // if a session is found, remove it from the schedule, mark it as an error, 
        // and tell the tutor instance that the time is now an error
        if (t.tag === Tags.session && t.courseID === time.courseID && t.conflictsWith(time)) {
          this.removeTime(t);
          t.setError(ErrorCodes.conflict);
          this.tutor.addError(t);
        }
      }
    }

    this.insertTime(time);
    time.setTutor(this.tutor.email);
    time.setError(ErrorCodes.success);
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

    // add time buttons calls time editor
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
        dayObj.div!.append(time.getTutorDiv());
      });
      div.append(dayObj.div);
    });

    return div;
  }
}