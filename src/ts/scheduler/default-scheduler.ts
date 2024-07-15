import { Days } from "../days";
import { Messages } from "../elements/messages/messages";
import { Positions } from "../positions";
import { Rooms } from "../rooms/rooms";
import { ErrorCodes } from "../schedule/schedule";
import { Tags, TimeBlock } from "../schedule/time-block";
import { Course } from "../tutors/course";
import { Tutor } from "../tutors/tutor";
import { Tutors } from "../tutors/tutors";
import { ScheduledState, SessionCounts } from "./scheduler";

export function defaultScheduler(session: TimeBlock, counts: SessionCounts): ScheduledState {
  const tutor = session.getTutor()!;
  const course = session.getCourse()!;
  const tutors = Tutors.instance!;
  const rooms = Rooms.instance!;

  // check for conflicts with already scheduled sessions
  if (session.day !== Days.sat && session.day !== Days.sun) {
    for (const time of tutor.schedule) {
      if (time.tag !== Tags.session || !time.hasRoomAssigned()) continue;

      // if the session is for the same course
      // check if that session has the same start time, can be on different days
      if (time.courseID === session.courseID) {
        if (time.start === session.start) {
          Messages.output(
            Messages.info,
            "time taken on a different day " + time.getDayAndStartStr()
          );
          return ScheduledState.noSession;
        }

      // if this is a session for a different course, check for conflict
      } else {
        if (time.conflictsWith(session)) {
          Messages.output(
            Messages.info,
            "conflicts with a session for another course " + time.getDayAndStartStr()
          );
          return ScheduledState.noSession;
        }
      }
    }
  }

  // check if another tutor with the same position supporting the same class conflicts
  for (const otherTutor of tutors.getPositionList(course.position)) {
    if (tutor === otherTutor) continue;

    for (const time of otherTutor.schedule) {
      if (time.tag !== Tags.session) continue;
      if (time.courseID !== course.id) continue;

      if (time.conflictsWith(session) && time.hasRoomAssigned()) {
        Messages.output(Messages.info, `time taken by another tutor: ${otherTutor.name} (${otherTutor.email})`);
        return ScheduledState.noSession;
      }
    }
  }

  // check if tutor wants this session scheduled
  if (!session.scheduleByLSS) {
    Messages.output(Messages.info, `tutor scheduling session: ${session.getDayAndStartStr()}`);
    session.setRoom(Tutor.tutorScheduled);
    return ScheduledState.tutorScheduled;
  }

  // check if session should default to registrar request/self-scheduled
  if (counts.count - counts.requests >= counts.position.requestLimit) {
    
    if (!session.isVirtual && rooms.getBuilding(Rooms.registrarRequest)!.isInRange(session)) {
      Messages.output(Messages.info, `no space for: ${session.getDayAndStartStr()}, defaulting to ${Rooms.registrarRequest}`);
      rooms.getRoom(Rooms.registrarRequest)?.pushTime(session);
      return ScheduledState.request;

    // virtual sessions default to self-scheduled
    } else if (session.isVirtual) {
      Messages.output(Messages.info, `no space for: ${session.getDayAndStartStr()}, defaulting to tutor scheduled virtual session.`);
      session.setRoom(Tutor.tutorScheduled);
      return ScheduledState.tutorScheduled;
    }
  }

  // schedule for preferred building
  if (course.preference !== Course.noPref) {
    const building = rooms.getBuilding(course.preference);
    if (building) {
      Messages.output(Messages.info, `searching for rooms in ${building.name}`);

      // check if time is in building range
      if (!building.isInRange(session)) {
        Messages.output(Messages.info, `${session.getStartToEndStr()} is not inside ${building.name}'s open time`);
      } else {
        // if preference requires a registrar request
        if (building.requestRoom) {
          Messages.output(Messages.info, `session assigned to ${building.requestRoom.name}`);
          building.requestRoom.pushTime(session);
          return ScheduledState.request;
        }
      }
      
      // if the tutor is an SI leader, first look through SI rooms
      // TODO: move this into its own strategy if SI gets more specific stuff
      if (course.position === Positions.si) {
        // search through building's rooms
        for (const room of building.rooms) {
          // no more sessions to assign, will default to registrar request
          if (counts.count - counts.requests >= course.position.requestLimit &&
            session.day !== Days.sun && rooms.getBuilding(Rooms.registrarRequest)!.isInRange(session)) {
            break;
          }

          // check for only si rooms first
          if (room.type !== Positions.si) {
            continue;
          }

          // try to add time
          const result = room.addTime(session);

          if (result === ErrorCodes.success) {
            Messages.output(Messages.info, `session assigned to room: ${room.name}`);
            return ScheduledState.scheduled;
          }
        }
      }

      // search through building's rooms
      for (const room of building.rooms) {
        // no more sessions to assign, will default to registrar request
        if (counts.count - counts.requests >= course.position.requestLimit &&
          session.day !== Days.sun && rooms.getBuilding(Rooms.registrarRequest)!.isInRange(session)) {
          break;
        }

        // only assign tutors to rooms that match their position
        // if the session is virtual only schedule in SGT rooms
        if (
          !session.isVirtual ? !course.position.roomFilter.includes(room.type.title) :
          !Positions.sgt.roomFilter.includes(room.type.title)
        ) {
          continue;
        }

        // try to add time
        const result = room.addTime(session);

        if (result === ErrorCodes.success) {
          Messages.output(Messages.info, `session assigned to room: ${room.name}`);
          return ScheduledState.scheduled;
        }
      }

      Messages.output(Messages.info, `no space found in ${building.name}`);
    }
  }

  if (course.position === Positions.si) {
    // search through building's rooms
    for (const room of rooms) {
      // no more sessions to assign, will default to registrar request
      if (counts.count - counts.requests >= course.position.requestLimit &&
        session.day !== Days.sun && rooms.getBuilding(Rooms.registrarRequest)!.isInRange(session)) {
        break;
      }

      // check for only si rooms first
      if (room.type !== Positions.si) {
        continue;
      }

      // try to add time
      const result = room.addTime(session);

      if (result === ErrorCodes.success) {
        Messages.output(Messages.info, `session assigned to room: ${room.name}`);
        return ScheduledState.scheduled;
      }
    }
  }

  // for each room without preference
  for (const room of rooms) {
    // no more sessions to assign, will default to registrar request
    if (counts.count - counts.requests >= course.position.requestLimit &&
      session.day !== Days.sun && rooms.getBuilding(Rooms.registrarRequest)!.isInRange(session)) {
      break;
    }

    // only assign tutors to rooms that match their position
    // if the session is virtual only schedule in SGT rooms
    if (
      !session.isVirtual ? !course.position.roomFilter.includes(room.type.title) :
      !Positions.sgt.roomFilter.includes(room.type.title)
    ) {
      continue;
    }

    const result = room.addTime(session);

    if (result === ErrorCodes.success) {
      Messages.output(Messages.info, `session assigned to room: ${room.name}`);
      return ScheduledState.scheduled;
    }
  }

  // registrar requests
  if (!session.isVirtual && rooms.getBuilding(Rooms.registrarRequest)!.isInRange(session)) {
    Messages.output(Messages.info, `no space for: ${session.getDayAndStartStr()}, defaulting to ${Rooms.registrarRequest}`);
    rooms.getRoom(Rooms.registrarRequest)!.pushTime(session);
    return ScheduledState.request;
    
  // if the session is virtual, then default to self scheduled
  } else if (session.isVirtual) {
    Messages.output(Messages.info, `no space for: ${session.getDayAndStartStr()}, defaulting to tutor scheduled virtual session.`);
    session.setRoom(Tutor.tutorScheduled);
    return ScheduledState.tutorScheduled;
  }

  Messages.output(Messages.info, "session could not be scheduled");
  return ScheduledState.noSession;
}
