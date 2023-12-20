import { Positions } from "../../positions.ts";
import { Course } from "../../tutors/course.ts";
import { Tutor } from "../../tutors/tutor.ts";
import { Editor } from "./editor";
import * as fields from "./menu-field.ts";

export class CourseEditor extends Editor {
  private static _instance: CourseEditor | null = null;
  public static get instance(): CourseEditor | null {
    return CourseEditor._instance;
  }

  curCourse: Course | null = null;
  client: Tutor | null = null;

  // * Rows ======================
  static readonly courseRow = 0;
  static readonly statusRow = 1;
  static readonly commentsRow = 2;
  // * ===========================

  // * Titles ====================
  static readonly id = "Course ID";
  static readonly position = "Position";
  static readonly status = "Status";
  static readonly preference = "Building Preference";
  static readonly comments = "Comments";
  // * ===========================

  constructor() {
    super("Course Editor");
    if (CourseEditor.instance !== null && CourseEditor.instance !== this) {
      console.error("Singleton CourseEditor class instantiated twice");
    }
    CourseEditor._instance = this;

    this.buildCourseRow();
    this.buildStatusRow();
    this.buildCommentsRow();
  }

  private buildCourseRow() {
    this.addRow();

    this.addInputField(
      CourseEditor.courseRow,
      CourseEditor.id,
      (input: string) => {
        if (input === "") {
          return false;
        }

        if (this.getValue(CourseEditor.position) !== fields.MenuSelectField.emptyOption) {
          const position = Positions.match(this.getValue(CourseEditor.position));
          if (Positions.courseless.includes(position)) {
            this.getField(CourseEditor.id)!.setValue(Course.na);
            return true;
          }
        }

        const formatted = Course.formatID(input);
        if (formatted !== Course.na) {
          this.getField(CourseEditor.id)!.setValue(formatted);
          return true;
        }
        return false;
      },
      (field: fields.MenuInputField) => {
        field.setNotice("");
      },
      (field: fields.MenuInputField) => {
        field.setNotice("course ID format must follow:</br>DEP COURSE-SECTION (e.g. CSE 13S-001)");
      }
    );
    
    this.addSelectField(
      CourseEditor.courseRow,
      CourseEditor.position,
      Positions.getTitles(),
      (input: string) => {
        if (input === fields.MenuSelectField.emptyOption) {
          return false;
        }
        const position = Positions.match(input);
        if (Positions.courseless.includes(position)) {
          this.getField(CourseEditor.id)!.setValue(Course.na);
        } else if (this.getValue(CourseEditor.id) === Course.na) {
          this.getField(CourseEditor.id)!.setValue("");
        }
        return true;
      },
      (field: fields.MenuSelectField) => {
        const position = Positions.match(field.getValue());
        field.setNotice(`session limit: ${position.sessionLimit}`);
      },
      (field: fields.MenuSelectField) => {
        field.setNotice("tutors must have a position for each assigned course");
      }
    );
  }

  private buildStatusRow() {
    this.addRow();
  }

  private buildCommentsRow() {
    this.addRow();
  }

  override applyChanges() {
    return;
  }

  createNewCourse(client: Tutor) {
    console.log(client);
  }

  editCourse(client: Tutor, course: Course) {
    console.log(client, course);
  }
}
