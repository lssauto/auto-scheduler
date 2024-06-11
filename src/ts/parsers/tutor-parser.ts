import { SchedulerName } from "../elements/header/scheduler-name";
import { Messages } from "../elements/messages/messages";
import { Positions } from "../positions";
import { StatusOptions } from "../status-options";
import { Course } from "../tutors/course";
import { Tutor } from "../tutors/tutor";
import { Tutors } from "../tutors/tutors";
import * as timeConvert from "../utils/time-convert";

// Procedure for parsing the tutor positions table.
// This will create initial tutor and course instances.

// TODO: attach any time blocks in rooms with tutor assignments to newly loaded in tutors

export function parseTutors(input: string) {
  Messages.clear();
  Messages.output(Messages.info, "parsing tutor positions...");

  const matrix = splitString(input);
  if (matrix[0].length != 4) {
    Messages.output(Messages.error, "Tutor position data should contain 4 rows: email, name, course, position");
    return;
  }
  buildTutors(matrix);

  Messages.output(Messages.success, "Tutor positions successfully parsed!");
}

// convert the raw table string into a matrix of cells
function splitString(input: string): string[][] {
  // split into rows
  const rows = input.split("\n");
  const matrix: string[][] = [];

  // for each row
  for (let i = 0; i < rows.length; i++) {
    // skip empty rows
    if (rows[i].startsWith("\t")) {
      rows.splice(i, 1);
      i--;
      continue;
    }
    // split row into cells
    matrix.push(rows[i].split("\t"));

    // remove empty cells
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] == "") {
        matrix[i].splice(j, 1);
        j--;
      }
    }
  }
  return matrix;
}

// build actual Tutor and Course instances
function buildTutors(matrix: string[][]) {
  const tutors = Tutors.instance!;

  // for each row
  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r];

    // get email string
    const emailMatch = row[0].match(/^([a-zA-Z0-9]+@ucsc.edu)/g);
    if (emailMatch === null) {
      Messages.output(Messages.warn, {
        message: `ucsc.edu email could not be parsed from: "${row[0]}". Skipping to next row.`,
        row: r + 1
      });
      continue;
    }
    const email = emailMatch[0];

    // warn of potentially incorrect email
    if (email !== row[0]) {
      Messages.output(Messages.warn, {
        message: `the email "${email}" was found in the contents "${row[0]}", but they are not exactly the same. Continuing with found email.`,
        row: r + 1
      });
    }

    const name = row[1].trim();

    // build a new tutor, or use the instance that already exists
    const tutor = tutors.getTutor(email) ?? new Tutor(email, name, true);
    
    // parse the tutor's position
    const position = Positions.match(row[3]);

    let courseID = "";

    // if the position is courseless, course ID doesn't matter
    if (Positions.isCourseless(position)) {
      courseID = Course.na;

    // otherwise parse the course ID
    } else {
      courseID = Course.formatID(row[2]);
      if (courseID === Course.na && row[2].trim() !== Course.na) {
        Messages.output(Messages.warn, {
          message: `Course ID could not be formatted properly, it was originally: "${row[2]}"`,
          solution: `The ID will be replaced with "${Course.na}", you can rename the ID by clicking the "Edit" button on the course.`,
          row: r + 1
        });
      }
      
      // prevent duplicate courses
      if (tutor.hasCourse(courseID)) {
        Messages.output(Messages.warn, {
          message: `${tutor.name} (${tutor.email}) is already assigned to ${courseID}. Skipping row.`,
          row: r + 1
        });
        continue;
      }
    }

    tutor.addCourse(Course.buildCourse({
      tutor: tutor,
      id: courseID,
      position: position,
      status: StatusOptions.inProgress,
      preference: Course.noPref,
      row: -1,
      timestamp: timeConvert.stampToStr(1),
      comments: "",
      scheduler: SchedulerName.name,
      zoomLink: ""
    }));

    // add new tutors to the tutors list
    if (!tutors.hasTutor(tutor.email)) {
      tutors.addTutor(tutor);
    }
  }
}
