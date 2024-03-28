import { Messages } from "../elements/messages/messages";
import { Rooms } from "../rooms/rooms";
import { Tags } from "../schedule/time-block";
import { Tutors } from "../tutors/tutors";

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

  static copyTutorSchedules() {
    const tutors = Tutors.instance!;

    let output = "";

    tutors.forEachTutor((tutor) => {
      // skip tutors with errors
      if (tutor.hasErrors()) return;

      output += "Tutor\t";
      output += tutor.name + " (" + tutor.email + ")\n";

      output += "Courses\t";
      tutor.forEachCourse((course) => {
        output += `${course.id} (${course.position.title}): ${course.status.title}\t`;
      });
      output += "\n";

      tutor.schedule.forEachDay((dayName, dayObj) => {
        output += dayName + "\t";

        for (const time of dayObj.times) {
          if (time.tag !== Tags.session && time.tag !== Tags.discord) continue;
          if (!time.hasRoomAssigned()) continue;
          output += `${time.courseID} , ${time.hasRoomAssigned() ? (time.roomName + " , ") : ""} ${time.getStartToEndStr()}\t`;
        }

        output += "\n";
      });
    });

    void navigator.clipboard.writeText(output);

    Messages.output(Messages.success, {
      message: "Successfully copied tutor schedules to clipboard.",
      warning: "This is just useful output. To actually save your work, use the 'Copy Response Table' button, and save the output somewhere."
    });
  }

  static copyRoomSchedules() {
    const rooms = Rooms.instance!;

    let output = "";

    rooms.forAllRooms((room) => {
      output += "Room\t";
      output += room.name + "\n";

      room.schedule.forEachDay((dayName, dayObj) => {
        output += dayName + "\t";

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

  static copyRequestRoomSchedules() {
    const rooms = Rooms.instance!;

    let output = "";

    rooms.forEachRequestRoom((room) => {
      output += "Room\t";
      output += room.name + "\n";

      room.schedule.forEachDay((dayName, dayObj) => {
        output += dayName + "\t";

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
