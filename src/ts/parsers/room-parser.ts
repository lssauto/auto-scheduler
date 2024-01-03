import { Days } from "../days";
import { Messages } from "../elements/messages/messages";
import { Room } from "../rooms/room";
import { Rooms } from "../rooms/rooms";
import { Tags, TimeBlock } from "../schedule/time-block";
import { Course } from "../tutors/course";
import { Tutors } from "../tutors/tutors";
import * as timeConvert from "../utils/time-convert";

export function parseRooms(input: string) {
  Messages.clear();
  Messages.output(Messages.info, "parsing rooms table...");
  const matrix = splitString(input);
  buildRooms(matrix);
  Messages.output(Messages.success, "Rooms successfully parsed!");
}

function splitString(input: string): string[][] {
  const rows = input.split("\n");
  const matrix: string[][] = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].startsWith("\t")) {
      rows.splice(i, 1);
      i--;
      continue;
    }
    matrix.push(rows[i].split("\t"));
    for (let j = 0; j < matrix[i].length; j++) {
      matrix[i][j] = matrix[i][j].trim();
    }
  }
  return matrix;
}

function buildRooms(matrix: string[][]) {
  let curRoom: Room | null = null;

  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r];
    if (row[0].toLowerCase() === "room") {
      if (curRoom !== null) {
        Rooms.instance!.addRoom(curRoom);
      }
      curRoom = Rooms.instance!.getRoom(row[1]) ?? new Room(row[1]);
      continue;
    }

    // add times to the current room's schedule
    const dayStr = row[0].trim();
    if (dayStr.match(/(M|Tu|W|Th|F|Sat|Sun)/) === null) {
      Messages.output(Messages.warn, {
        message: `'${dayStr}' could not be recognized as a valid day (M/Tu/W/Th/F/Sat/Sun). Skipping row.`,
        row: r + 1
      });
      continue;
    }
    const day = dayStr as Days;

    for (let c = 1; c < row.length; c++) {
      if (row[c] === "") continue;

      const fields = row[c].split(",");
      if (fields.length < 3) {
        Messages.output(Messages.warn, {
          message: `A time in ${curRoom!.name}'s schedule is missing the needed fields. Skipping time.`,
          expects: "COURSE ID , name[optional] (email) , ##:## [AM/PM] - ##:## [AM/PM]",
          cell: `(row: ${r + 1} , col: ${c + 1})`
        });
        continue;
      }

      const course = Course.formatID(fields[0].trim());
      const parsedEmail = fields[1].split("(")[1].replace(")", "").trim(); // just get the email
      const tutorEmail = parsedEmail === "" ? null : parsedEmail;
      const timeStr =fields[2].trim();

      const timeObj = timeConvert.parseTimeStr(timeStr);
      if (timeObj) {
        const find = tutorEmail ? Tutors.instance!.getTutor(tutorEmail)?.findTime({
          courseID: course,
          tag: Tags.session,
          day: day,
          start: timeObj.start,
          end: timeObj.end,
          roomName: curRoom!.name,
          tutorEmail: tutorEmail
        }) : null;
        if (find) {
          curRoom!.pushTime(find);
        } else {
          curRoom!.pushTime(TimeBlock.buildTimeBlock({
            coords: {row: -1, col: -1},
            day: day,
            start: timeObj.start,
            end: timeObj.end,
            tag: Tags.session,
            scheduleByLSS: true,
            tutorEmail: tutorEmail,
            courseID: course,
            roomName: curRoom!.name
          }));
        }
      } else {
        Messages.output(
          Messages.warn,
          `The time at (row: ${r + 1} , col: ${c + 1}) could not be parsed properly. Time will be skipped.`
        );
      }
    }
  }
}
