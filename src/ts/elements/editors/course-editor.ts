import { Positions } from "../../positions.ts";
import { Rooms } from "../../rooms/rooms.ts";
import { StatusOptions } from "../../status-options.ts";
import { Course, CourseConfig } from "../../tutors/course.ts";
import { Tutor } from "../../tutors/tutor.ts";
import { Editor } from "./editor";
import * as fields from "./menu-field.ts";
import * as timeConvert from "../../utils/time-convert.ts";

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
            if (this.client!.hasCourse(Course.na) && Course.na !== this.curCourse?.id) {
              return false;
            } else {
              return true;
            }
          }
        }

        const formatted = Course.formatID(input);
        if (formatted !== Course.na) {
          this.getField(CourseEditor.id)!.setValue(formatted);
          if (this.client!.hasCourse(formatted) && formatted !== this.curCourse?.id) {
            return false;
          } else {
            return true;
          }
        }
        return false;
      },
      (field: fields.MenuInputField) => {
        field.setNotice("");
      },
      (field: fields.MenuInputField) => {
        if (this.client!.hasCourse(field.getValue()) && field.getValue() !== this.curCourse?.id) {
          field.setNotice(`the tutor is already assigned to ${field.getValue()}</br>delete the other course before renaming this one`);
        }
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
        this.getField(CourseEditor.preference)!.validate();
      },
      (field: fields.MenuSelectField) => {
        field.setNotice("tutors must have a position for each assigned course");
      }
    );
  }

  private buildStatusRow() {
    this.addRow();

    this.addSelectField(
      CourseEditor.statusRow,
      CourseEditor.status,
      StatusOptions.getTitles(),
      (input: string) => {
        if (input === fields.MenuSelectField.emptyOption) {
          return false;
        }
        return true;
      },
      (field: fields.MenuSelectField) => {
        const status = StatusOptions.match(field.getValue());
        this.setColor(status.color);
        field.setNotice("");
        if (!StatusOptions.isErrorStatus(status) && StatusOptions.isErrorStatus(this.curCourse?.status ?? StatusOptions.inProgress)) {
          field.setNotice("changing to a non-error status will remove all errors");
        }
      },
      (field: fields.MenuSelectField) => {
        field.setNotice("courses must have a progress status");
        this.setColor(Editor.blankColor);
      }
    );
    
    const options = Rooms.instance!.getBuildingNames();
    options.push(Course.noPref);
    this.addSelectField(
      CourseEditor.statusRow,
      CourseEditor.preference,
      options,
      (input: string) => {
        if (input === fields.MenuSelectField.emptyOption) {
          return false;
        }
        if (input === Course.noPref) {
          let found = false;
          Rooms.instance!.forEachRoom((room) => {
            if (Positions.match(this.getValue(CourseEditor.position)).roomFilter.includes(room.type.title)) {
              found = true;
            }
          });
          if (!found) {
            return false;
          }
          return true;
        }
        let found = false;
        Rooms.instance!.getBuilding(input)!.forEachRoom((room) => {
          if (Positions.match(this.getValue(CourseEditor.position)).roomFilter.includes(room.type.title)) {
            found = true;
          }
        });
        if (!found) {
          return false;
        }
        return true;
      },
      (field: fields.MenuSelectField) => {
        field.setNotice("");
      },
      (field: fields.MenuSelectField) => {
        if (field.getValue() === fields.MenuSelectField.emptyOption) {
          field.setNotice(`building preference will default to "${Course.noPref}"`);
          field.setValue(Course.noPref);
        } else {
          field.setNotice(`${field.getValue()} has no rooms</br>available for ${this.getValue(CourseEditor.position)} sessions`);
        }
      }
    );
  }

  private buildCommentsRow() {
    this.addRow();

    this.addTextField(
      CourseEditor.commentsRow,
      CourseEditor.comments,
      70, 3,
      () => {
        return true;
      },
      () => {
        return;
      },
      () => {
        return;
      }
    );
  }

  override applyChanges() {
    const changes: CourseConfig = {
      tutor: this.client!,
      id: this.getValue(CourseEditor.id),
      position: Positions.match(this.getValue(CourseEditor.position)),
      status: StatusOptions.match(this.getValue(CourseEditor.status)),
      preference: this.getValue(CourseEditor.preference),
      row: this.curCourse?.row ?? -1,
      timestamp: timeConvert.fromTimestamp(this.curCourse?.timestamp ?? (new Date()).getTime()),
      errors: [],
      times: [],
      comments: this.getValue(CourseEditor.comments)
    };
    if (this.curCourse) {
      if (changes.id !== this.curCourse.id) {
        this.client!.removeCourse(this.curCourse.id);
      }
      this.curCourse.update(changes);
      this.client!.setCourse(this.curCourse);
    } else {
      const newCourse = Course.buildCourse(changes);
      this.client!.addCourse(newCourse);
    }
    return;
  }

  createNewCourse(client: Tutor) {
    this.openMenu();
    this.client = client;
    this.curCourse = null;
  }

  editCourse(client: Tutor, course: Course) {
    this.createNewCourse(client);
    this.curCourse = course;
    this.getField(CourseEditor.id)!.setValue(course.id);
    this.getField(CourseEditor.position)!.setValue(course.position.title);
    this.getField(CourseEditor.status)!.setValue(course.status.title);
    this.setColor(course.status.color);
    this.getField(CourseEditor.preference)!.setValue(course.preference);
    const options = Rooms.instance!.getBuildingNames();
    options.push(Course.noPref);
    (this.getField(CourseEditor.preference)! as fields.MenuSelectField)
      .updateOptions(options);
    this.getField(CourseEditor.comments)!.setValue(course.comments);
  }
}
