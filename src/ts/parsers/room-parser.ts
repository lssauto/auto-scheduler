import { Days } from "../days";
import { Messages } from "../elements/messages/messages";
import { Room } from "../rooms/room";
import { Rooms } from "../rooms/rooms";
import { Tags, TimeBlock } from "../schedule/time-block";
import { Course } from "../tutors/course";
import { Tutors } from "../tutors/tutors";
import * as timeConvert from "../utils/time-convert";

// Procedure to parse room schedules table,
// expects the raw copy & pasted string google sheets

export function parseRooms(input: string) {
  Messages.clear();
  Messages.output(Messages.info, "parsing rooms table...");
  const matrix = splitString(input);
  buildRooms(matrix);
  Messages.output(Messages.success, "Rooms successfully parsed!");
}

// split raw string into matrix of rows and columns
function splitString(input: string): string[][] {
  // split string into rows
  const rows = input.split("\n");

  const matrix: string[][] = [];

  // iterate through each row to split it by columns
  for (let i = 0; i < rows.length; i++) {
    // remove empty rows, might be able to just skip instead?
    if (rows[i].startsWith("\t")) {
      rows.splice(i, 1);
      i--;
      continue;
    }
    // split rows by tabs
    matrix.push(rows[i].split("\t"));
    // clean up each cell's string
    for (let j = 0; j < matrix[i].length; j++) {
      matrix[i][j] = matrix[i][j].trim();
    }
  }
  return matrix;
}

// build actual room instances with table matrix
function buildRooms(matrix: string[][]) {
  // the current room being constructed
  let curRoom: Room | null = null;

  // for each row in the matrix
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r];

    // if this is a new room
    if (row[0].toLowerCase() === "room") {
      // add the previously build room to the rooms list
      // ! this might be an error since addRoom() doesn't handle rooms that already exist in the rooms list
      if (curRoom !== null) {
        Rooms.instance!.addRoom(curRoom);
      }
      // start a new room, or update an existing room
      curRoom = Rooms.instance!.getRoom(row[1]) ?? new Room(row[1]);
      continue;
    }

    // add times to the current room's schedule

    // determine which day this row is for
    const dayStr = row[0].trim();
    if (dayStr.match(/(M|Tu|W|Th|F|Sat|Sun)/) === null) {
      Messages.output(Messages.warn, {
        message: `'${dayStr}' could not be recognized as a valid day (M/Tu/W/Th/F/Sat/Sun). Skipping row.`,
        row: r + 1
      });
      continue;
    }
    const day = dayStr as Days;

    // for each time in the day's row
    for (let c = 1; c < row.length; c++) {
      if (row[c] === "") continue;

      // split up course, tutor, and time block fields
      const fields = row[c].split(",");
      if (fields.length < 3) {
        Messages.output(Messages.warn, {
          message: `A time in ${curRoom!.name}'s schedule is missing the needed fields. Skipping time.`,
          expects: "COURSE ID , name[optional] (email) , ##:## [AM/PM] - ##:## [AM/PM]",
          cell: `(row: ${r + 1} , col: ${c + 1})`
        });
        continue;
      }

      // parse course field
      const courseField = fields[0].trim();
      let course = Course.formatID(courseField);
      if (course === Course.na && (courseField !== Course.na && courseField !== "")) {
        course = courseField;
      }

      // parse tutor field
      const parsedEmail = fields[1].split("(")[1].replace(")", "").trim(); // just get the email
      const tutorEmail = parsedEmail === "" ? null : parsedEmail;

      // parse time block field
      const timeStr = fields[2].trim();
      const timeObj = timeConvert.parseTimeStr(timeStr);

      // if time was successfully parsed
      if (timeObj) {
        // try to find a matching time if it is assigned to a tutor
        const find = tutorEmail ? Tutors.instance!.getTutor(tutorEmail)?.findTime({
          courseID: course,
          tag: Tags.session,
          day: day,
          start: timeObj.start,
          end: timeObj.end,
          roomName: curRoom!.name,
          tutorEmail: tutorEmail
        }) : null;

        // if a time block was found, use the existing time block
        if (find) {
          curRoom!.pushTime(find);

        // otherwise create a new time block
        } else {
          curRoom!.pushTime(TimeBlock.buildTimeBlock({
            coords: {row: -1, col: -1},
            day: day,
            start: timeObj.start,
            end: timeObj.end,
            tag: Tags.session,
            scheduleByLSS: true,
            isVirtual: false,
            tutorEmail: tutorEmail,
            courseID: course,
            roomName: curRoom!.name
          }));
        }
      
      // if the time was not parsed successfully
      } else {
        Messages.output(
          Messages.warn,
          `The time at (row: ${r + 1} , col: ${c + 1}) could not be parsed properly. Time will be skipped.`
        );
      }
    }
  }

  // add in last room in the list
  if (curRoom !== null) {
    Rooms.instance!.addRoom(curRoom);
  }
}
