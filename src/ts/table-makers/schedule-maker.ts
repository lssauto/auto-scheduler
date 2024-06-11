import { Messages } from "../elements/messages/messages";
import { Rooms } from "../rooms/rooms";
import { Tags } from "../schedule/time-block";
import { Tutors } from "../tutors/tutors";

/**
 * Builds the tutor and room schedule table copy outs.
 */
export class ScheduleTableMaker {
  private static _instance: ScheduleTableMaker | null = null;
  public static get instance(): ScheduleTableMaker | null {
    return ScheduleTableMaker._instance;
  }

  constructor() {
    if (
      ScheduleTableMaker.instance !== null &&
      ScheduleTableMaker.instance !== this
    ) {
      console.error("Singleton ScheduleTableMaker class instantiated twice");
    }
    ScheduleTableMaker._instance = this;
  }

  /**
   * Builds human readable tutor schedules, and copies it to the user's clipboard.
   * !Only useful as output, do not use as serialization!
   */
  static copyTutorSchedules() {
    const tutors = Tutors.instance!;

    let output = "";

    tutors.forEachTutor((tutor) => {
      // skip tutors with errors
      if (tutor.hasErrors()) return;

      // name row
      output += "Tutor\t";
      output += tutor.name + " (" + tutor.email + ")\n";

      // courses row
      output += "Courses\t";
      tutor.forEachCourse((course) => {
        output += `${course.id} (${course.position.title}): ${course.status.title}\t`;
      });
      output += "\n";

      // zoom links for each course
      if (tutor.hasZoomLinks()) {        
        output += "Zoom Links:\t";
        tutor.forEachCourse((course) => {
          output += `${course.id}: ${course.zoomLink}\t`;
        });
        output += "\n";
      }

      // schedule rows
      tutor.schedule.forEachDay((dayName, dayObj) => {
        // each row is a day
        output += dayName + "\t";

        // followed by the times in the day
        for (const time of dayObj.times) {
          if (time.tag !== Tags.session && time.tag !== Tags.discord) continue;
          if (!time.hasRoomAssigned()) continue;
          output += `${time.courseID} , ${time.hasRoomAssigned() ? (time.roomName + " , ") : ""} ${time.getStartToEndStr()}\t`;
        }

        output += "\n";
      });
      output += "\n";
    });

    void navigator.clipboard.writeText(output);

    Messages.output(Messages.success, {
      message: "Successfully copied tutor schedules to clipboard.",
      warning: "This is just useful output. To actually save your work, use the 'Copy Response Table' button, and save the output somewhere."
    });
  }

  /**
   * Builds room schedules table, and copies it to the user's clipboard.
   * This is used for serialization.
   */
  static copyRoomSchedules() {
    const rooms = Rooms.instance!;

    let output = "";

    rooms.forAllRooms((room) => {
      // room name row
      output += "Room\t";
      output += room.name + "\n";

      // schedule rows
      room.schedule.forEachDay((dayName, dayObj) => {
        // each day is a row
        output += dayName + "\t";

        // followed by the times in that day
        for (const time of dayObj.times) {
          output += `${time.courseID} , ${
            time.getTutor() !== null ? 
              time.getTutor()!.name + "(" + time.tutorEmail + ") ," :
              "(" + time.tutorEmail + ") ,"
          } ${time.getStartToEndStr()}\t`;
        }

        output += "\n";
      });
    });

    void navigator.clipboard.writeText(output);

    Messages.output(Messages.success, "Successfully copied room schedules to clipboard.");
  }

  /**
   * Builds only request room schedules table, and copies it to the user's clipboard.
   * This can be used for serialization, but is redundant since copyRoomSchedules() 
   * includes request rooms.
   */
  static copyRequestRoomSchedules() {
    const rooms = Rooms.instance!;

    let output = "";

    rooms.forEachRequestRoom((room) => {
      // name row
      output += "Room\t";
      output += room.name + "\n";

      // schedule rows
      room.schedule.forEachDay((dayName, dayObj) => {
        // each day is a row
        output += dayName + "\t";

        // followed by the times in that day
        for (const time of dayObj.times) {
          output += `${time.courseID} , ${
            time.getTutor() !== null ? 
              time.getTutor()!.name + "(" + time.tutorEmail + ") ," :
              "(" + time.tutorEmail + ") ,"
          } ${time.getStartToEndStr()}\t`;
        }

        output += "\n";
      });
    });

    void navigator.clipboard.writeText(output);

    Messages.output(Messages.success, "Successfully copied room schedules to clipboard.");
  }
}
