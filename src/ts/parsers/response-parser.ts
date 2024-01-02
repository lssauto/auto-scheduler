import { Messages } from "../elements/messages/messages";
import { Tutors } from "../tutors/tutors";
import { ResponseTableMaker, Titles } from "../table-makers/response-maker";
import { ErrorCodes } from "../schedule/schedule";

export function parseResponses(input: string) {
  Messages.output(Messages.info, "Parsing response table...");
  const ind = parseColumnTitles(input);
  if (ind === -1) {
    return;
  }
  const result = parseMatrix(input, ind);
  if (!result) {
    return;
  }
  addResponseData();
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

  ResponseTableMaker.instance!.setColumnTitles(columnTitles);

  return i;
}

function parseMatrix(input: string, i: number): boolean {
  const matrix: string[][] = [];
  const rows: string[] = [];
  let buffer = "";
  let columnCount = 1;
  let rowCount = 1;

  const titles = ResponseTableMaker.instance!.columnTitles;

  // split rows
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

  ResponseTableMaker.instance!.setOriginalMatrix(matrix);

  return true;
}

function addResponseData() {
  const responses = ResponseTableMaker.instance!.responses;

  for (const response of responses) {
    const tutor = Tutors.instance!.getTutor(response.email);
    if (tutor === undefined) continue;
    const course = tutor.getCourse(response.courseID);
    if (course === undefined) continue;

    if (!course.isOlderThan(response.timestamp)) {
      continue;
    }

    for (const lecture of response.lectures) {
      if (course.hasTime(lecture)) continue;
      course.addTime(lecture);
      const errorCode = tutor.addTime(lecture);
      if (errorCode !== ErrorCodes.success) {
        course.addError(lecture);
      }
    }
  }
}
