import { Messages } from "../elements/messages/messages";
import { Tutors } from "../tutors/tutors";
import { ResponseTableMaker, Titles } from "../table-makers/response-maker";
import { ErrorCodes } from "../schedule/schedule";

// Procedure for parsing tutor response table, 
// expects the raw copy & pasted string from the google sheets

export function parseResponses(input: string) {
  Messages.clear();
  Messages.output(Messages.info, "Parsing response table...");
  // separate column titles from response data
  const ind = parseColumnTitles(input);
  if (ind === -1) { // -1 if columns were formatted incorrectly, error messages sent in parse function
    return;
  }
  // parse actual response data, starts from the string index the column titles ended on
  const result = parseMatrix(input, ind);
  if (!result) {
    return;
  }
  // use parsed responses to build actual Tutor, Course, and TimeBlock objects
  addResponseData();
  Messages.output(Messages.success, "Responses successfully parsed!");
}

function parseColumnTitles(input: string): number {
  const columnTitles: string[] = [];
  let buffer = "";
  let i = 0;
  while (i <= input.length) {
    if (i === input.length) {
      Messages.output(Messages.error, "Failed to parse column titles. ");
      return -1;
    }

    // scheduler is always the last column
    if (input[i] === "\n" && buffer.toLowerCase().includes(Titles.scheduler)) {
      columnTitles.push(buffer);
      buffer = "";
      i++;
      break;
    }

    // next column
    if (input[i] === "\t") {
      if (buffer === "\t") break;
      columnTitles.push(buffer);
      buffer = "";
      i++;
    }
    buffer += input[i];
    i++;
  }

  // flush buffer
  if (buffer !== "" && buffer !== "\t") {
    columnTitles.push(buffer);
  }

  // ensure no empty strings are in column titles
  for (let j = 0; j < columnTitles.length; j++) {
    if (columnTitles[j] === "\t" || columnTitles[j] === "") {
      columnTitles.splice(j, 1);
      j--;
    }
  }

  // store titles for later use
  ResponseTableMaker.instance!.setColumnTitles(columnTitles);

  return i;
}

function parseMatrix(input: string, i: number): boolean {
  const matrix: string[][] = [];
  const rows: string[] = [];
  let buffer = "";
  let columnCount = 1;
  let rowCount = 1;

  // use titles to ensure responses have the right number of rows
  const titles = ResponseTableMaker.instance!.columnTitles;

  // split rows, i starts at the character after the column titles
  while (i < input.length) {
    // push next row
    if (input[i] === "\n" && columnCount >= titles.length) {
      rows.push(buffer);
      buffer = "";
      columnCount = 1;
      rowCount++;
      i++;
    }

    // track column count to make sure they match the titles
    if (input[i] === "\t") {
      if (buffer === "") break; // exit if next row is empty
      columnCount++;
    }

    // if a row has too many columns, exit
    if (columnCount > titles.length) {
      Messages.output(Messages.error, {
        message: `Too many columns counted in row: ${rowCount}.`,
        solution: "A tab character was likely input in a response. Remove the tab, and try again. Multiple empty columns might have also been included."
      });
      return false;
    }

    buffer += input[i];
    i++;
  }
  // flush buffer
  if (buffer !== "" && buffer !== "\t") {
    rows.push(buffer);
  }

  // split rows into cells
  for (const row of rows) {
    matrix.push(row.split("\t"));
    for (let c = 0; c < matrix[matrix.length - 1].length; c++) {
      matrix[matrix.length - 1][c] = matrix[matrix.length - 1][c].trim();
    }
  }

  // save response matrix for rebuilding it for copy & pasting
  // will also construct json objects out of matrix to make the next step easier
  ResponseTableMaker.instance!.setOriginalMatrix(matrix);

  return true;
}

function addResponseData() {
  const responses = ResponseTableMaker.instance!.responses;
  const tutors = Tutors.instance!;

  // iterate through response objects
  for (const response of responses) {
    
    // encoding contains everything needed to reconstruct the tutor
    if (response.encoding.includes(ResponseTableMaker.encodingHeader)) {
      ResponseTableMaker.decodeTutor(response.encoding)!;
      continue;
    }
    
    // if tutor or course can't be found, then this is a bad submission
    const tutor = tutors.getTutor(response.email);
    if (tutor === undefined) continue;
    const course = tutor.getCourse(response.courseID);
    if (course === undefined) continue;

    // skip old submissions
    if (!course.isOlderThan(response.timestamp)) {
      continue;
    }

    course.onDeletedDispatch(); // used to remove all previously loaded times

    // add tutor back to errors event listener
    course.addErrorsListener(tutor, () => {
      tutor.onErrorsDispatch();
    });

    // rebuild course
    course.update({
      tutor: tutor,
      id: course.id,
      position: response.position,
      timestamp: response.timestamp,
      preference: course.preference,
      row: response.row,
      status: response.status,
      comments: response.comments,
      scheduler: response.scheduler
    });

    // add times

    // Lectures
    for (const lecture of response.lectures) {
      // prevent duplicate times, although these should have been removed when the course was reset
      if (tutor.schedule.hasTime(lecture)) {
        course.removeTime(lecture);
        continue;
      }

      const errorCode = tutor.addTime(lecture);

      // add time to errors, but should only happen for sessions
      if (errorCode !== ErrorCodes.success) {
        course.addError(lecture);
      }
      // add room assignment if necessary
      lecture.getRoom()?.addTime(lecture);
    }
    
    // Office Hours
    for (const officeHour of response.officeHours) {
      if (tutor.schedule.hasTime(officeHour)) {
        course.removeTime(officeHour);
        continue;
      }

      const errorCode = tutor.addTime(officeHour);
      if (errorCode !== ErrorCodes.success) {
        course.addError(officeHour);
      }
      officeHour.getRoom()?.addTime(officeHour);
    }

    // Discord tutoring hours
    for (const discord of response.discord) {
      if (tutor.schedule.hasTime(discord)) {
        course.removeTime(discord);
        continue;
      }

      const errorCode = tutor.addTime(discord);
      if (errorCode !== ErrorCodes.success) {
        course.addError(discord);
      }
      discord.getRoom()?.addTime(discord);
    }

    // session times
    for (const time of response.times) {
      if (tutor.schedule.hasTime(time)) {
        course.removeTime(time);
        continue;
      }

      const errorCode = tutor.addTime(time);
      if (errorCode !== ErrorCodes.success) {
        Messages.output(Messages.error, {
          message: `"${errorCode}" error encountered for one of ${tutor.name}'s (${tutor.email}) sessions.`,
          session: `${time.getTimeStr()} for ${course.id}`
        });
        tutor.addError(time);
      }
      time.getRoom()?.addTime(time);
    }
  }

  console.log(tutors);
}
