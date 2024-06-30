import { Days } from "../days";
import { Messages } from "../elements/messages/messages";
import { Position, Positions } from "../positions";
import { Tags, TimeBlock } from "../schedule/time-block";
import { StatusOptions } from "../status-options";
import { Course } from "../tutors/course";
import { Tutor } from "../tutors/tutor";
import { Tutors } from "../tutors/tutors";

import { defaultScheduler } from "./default-scheduler";

export enum ScheduledState {
  noSession,
  request,
  scheduled,
  tutorScheduled,
}

export type SchedulerStrat = (time: TimeBlock, counts: SessionCounts) => ScheduledState;

export interface SessionCounts {
  readonly position: Position;
  count: number;
  requests: number;
}

export class Scheduler {

  public static scheduleAll() {
    const tutors = Tutors.instance!;

    Messages.clear();
    Messages.output(Messages.info, "creating schedules...");

    const completed = new Map<Tutor, boolean>();

    // tutors with building preferences
    tutors.forEachTutor((tutor) => {
      // check for building preference
      let hasPref = false;
      tutor.forEachCourse((course) => {
        if (course.preference !== Course.noPref) {
          hasPref = true;
        }
      });
      if (!hasPref) {
        return;
      }

      // set even tutors with errors as complete to prevent repeat checks
      completed.set(tutor, true);

      // skip tutors with errors
      if (tutor.hasErrors()) {
        Messages.output(
          Messages.info,
          `skipping ${tutor.name} (${tutor.email}) because they have errors`
        );
        return;
      }

      this.scheduleTutor(tutor);
    });

    // schedule everyone else but writing tutors
    tutors.forEachTutor((tutor) => {
      if (completed.get(tutor)) {
        return;
      }

      if (tutor.hasPosition(Positions.wr)) {
        return;
      }

      completed.set(tutor, true);

      // skip tutors with errors
      if (tutor.hasErrors()) {
        Messages.output(
          Messages.info,
          `skipping ${tutor.name} (${tutor.email}) because they have errors`
        );
        return;
      }

      this.scheduleTutor(tutor);
    });

    //schedule writing tutors
    tutors.forEachPositionList(Positions.wr, (tutor) => {
      // skip tutors with errors
      if (tutor.hasErrors()) {
        Messages.output(
          Messages.info,
          `skipping ${tutor.name} (${tutor.email}) because they have errors`
        );
        return;
      }

      this.scheduleTutor(tutor);
    });

    Messages.output(Messages.success, "finished scheduling");
  }

  private static scheduleTutor(tutor: Tutor) {
    Messages.output(
      Messages.info,
      `creating schedule for: ${tutor.name} (${tutor.email})`
    );

    let sessions = 0; // number of sessions assigned to this tutor
    let maxSessions = 0; // maximum number of sessions assigned to this tutor
    // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
    const sessionCounts: { [keys: string]: SessionCounts } = {}; // max sessions for each course
    // calc max sessions
    tutor.forEachCourse((course) => {
      maxSessions += course.position.sessionLimit;
      sessionCounts[course.id] = {
        position: course.position,
        count: 0,
        requests: 0,
      };
    });

    this.shuffle(this.dayOrder);
    Messages.output(Messages.info, `order used: ${this.dayOrderStr}`);

    for (const day of this.dayOrder) {
      if (sessions >= maxSessions) {
        break;
      }

      let sessionsThisDay = 0;
      tutor.schedule.forEachTimeInDay(day, (time) => {
        // max of 2 sessions per day
        if (sessionsThisDay >= 2) {
          return;
        }

        if (time.tag !== Tags.session) {
          return;
        }
        if (!StatusOptions.isProgressStatus(time.getCourse()?.status ?? StatusOptions.inProgress)) {
          return;
        }
        console.log(time.courseID);
        console.log(sessionCounts);
        
        
        if (sessionCounts[time.courseID!].count >= (time.getCourse()?.position.sessionLimit ?? 3)) {
          return;
        }

        Messages.output(Messages.info, `finding space for ${time.getDayAndStartStr()} supporting ${time.courseID}`);

        let result = ScheduledState.noSession;
        if (time.hasRoomAssigned()) {
          result = ScheduledState.scheduled;
        } else {
          result = time.getCourse()?.position.scheduler(time, sessionCounts[time.courseID!]) ??
                    defaultScheduler(time, sessionCounts[time.courseID!]);
        }

        switch (result) {
          case ScheduledState.scheduled:
          case ScheduledState.tutorScheduled:
            sessionsThisDay++;
            sessions++;
            sessionCounts[time.courseID!].count++;
            time.onEditedDispatch();
            break;
          
          case ScheduledState.request:
            sessionsThisDay++;
            sessions++;
            sessionCounts[time.courseID!].count++;
            sessionCounts[time.courseID!].requests++;
            time.onEditedDispatch();
            break;
          
          case ScheduledState.noSession:
          default:
            break;
        }
      });
    }

    // set course statuses to scheduled
    tutor.forEachCourse((course) => {
      if (StatusOptions.isProgressStatus(course.status)) {
        course.setStatus(StatusOptions.scheduled);
        course.onEditedDispatch();
      }
    });

    Messages.output(Messages.success, `finished scheduling sessions for ${tutor.name} (${tutor.email})`);
  }

  private static dayOrder: Days[] = [
    Days.mon,
    Days.tue,
    Days.wed,
    Days.thu,
    Days.fri,
    Days.sat,
    Days.sun,
  ];

  private static get dayOrderStr(): string {
    let str = "";
    for (let i = 0; i < this.dayOrder.length; i++) {
      str += this.dayOrder[i];
      if (i < this.dayOrder.length - 1) {
        str += ", ";
      }
    }
    return str;
  }

  private static shuffle(array: Days[]) {
    let currentIndex = array.length,
      randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex > 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
  }
}
