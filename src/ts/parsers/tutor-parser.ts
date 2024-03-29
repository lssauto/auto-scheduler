import { Messages } from "../elements/messages/messages";
import { Positions } from "../positions";
import { StatusOptions } from "../status-options";
import { Course } from "../tutors/course";
import { Tutor } from "../tutors/tutor";
import { Tutors } from "../tutors/tutors";
import * as timeConvert from "../utils/time-convert";

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
      if (matrix[i][j] == "") {
        matrix[i].splice(j, 1);
        j--;
      }
    }
  }
  return matrix;
}

function buildTutors(matrix: string[][]) {
  const tutors = Tutors.instance!;

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

    if (email !== row[0]) {
      Messages.output(Messages.warn, {
        message: `the email "${email}" was found in the contents "${row[0]}", but they are not exactly the same. Continuing with found email.`,
        row: r + 1
      });
    }

    const name = row[1].trim();

    const tutor = tutors.getTutor(email) ?? new Tutor(email, name, true);
    
    const position = Positions.match(row[3]);
    let courseID = "";
    if (Positions.isCourseless(position)) {
      courseID = Course.na;

    } else {
      courseID = Course.formatID(row[2]);
      if (courseID === Course.na && row[2].trim() !== Course.na) {
        Messages.output(Messages.warn, {
          message: `Course ID could not be formatted properly, it was originally: "${row[2]}"`,
          solution: `The ID will be replaced with "${Course.na}", you can rename the ID by clicking the "Edit" button on the course.`,
          row: r + 1
        });
      }
  
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
      scheduler: "scheduler" // TODO: replace with scheduler
    }));

    if (!tutors.hasTutor(tutor.email)) {
      tutors.addTutor(tutor);
    }
  }
}
