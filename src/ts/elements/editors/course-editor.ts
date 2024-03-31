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

  // the current course being edited
  curCourse: Course | null = null;
  // the tutor this course belongs to
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

    // course id
    this.addInputField(
      CourseEditor.courseRow,
      CourseEditor.id,
      (input: string) => {
        // courses must have a id
        if (input === "") {
          return false;
        }

        // check if the position for this course in "courseless" (i.e. writing tutors)
        // course id in this case is set to "N/A"
        if (this.getValue(CourseEditor.position) !== fields.MenuSelectField.emptyOption) {
          const position = Positions.match(this.getValue(CourseEditor.position));
          if (Positions.courseless.includes(position)) {
            this.getField(CourseEditor.id)!.setValue(Course.na);
            // return false if the tutor already has an N/A course, 
            // excluding the course that's currently being edited
            if (this.client!.hasCourse(Course.na) && Course.na !== this.curCourse?.id) {
              return false;
            } else {
              return true;
            }
          }
        }

        // otherwise, ensure the course id can be formatted properly
        const formatted = Course.formatID(input);
        if (formatted !== Course.na) {
          this.getField(CourseEditor.id)!.setValue(formatted);
          // return false if the tutor already has that course, 
          // excluding the course that's currently being edited
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
        // if tutor already has this course
        if (this.client!.hasCourse(field.getValue()) && field.getValue() !== this.curCourse?.id) {
          field.setNotice(`the tutor is already assigned to ${field.getValue()}</br>delete the other course before renaming this one`);
        }
        // if course id can't be formatted
        field.setNotice("course ID format must follow:</br>DEP COURSE-SECTION (e.g. CSE 13S-001)");
      }
    );
    
    // tutor position
    this.addSelectField(
      CourseEditor.courseRow,
      CourseEditor.position,
      Positions.getTitles(),
      (input: string) => {
        // position must be selected
        if (input === fields.MenuSelectField.emptyOption) {
          return false;
        }

        // get position based on value
        const position = Positions.match(input);

        // if the position is courseless, update the course id
        if (Positions.courseless.includes(position)) {
          this.getField(CourseEditor.id)!.setValue(Course.na);
        
        // if the position isn't courseless, but the id is "N/A", remove the course id
        } else if (this.getValue(CourseEditor.id) === Course.na) {
          this.getField(CourseEditor.id)!.setValue("");
        }
        return true;
      },
      (field: fields.MenuSelectField) => {
        const position = Positions.match(field.getValue());
        field.setNotice(`session limit: ${position.sessionLimit}`);

        // re-validate the building preference since the previous building might not
        // have rooms that support
        this.getField(CourseEditor.preference)!.validate();
      },
      (field: fields.MenuSelectField) => {
        field.setNotice("tutors must have a position for each assigned course");
      }
    );
  }

  private buildStatusRow() {
    this.addRow();

    // scheduling status
    this.addSelectField(
      CourseEditor.statusRow,
      CourseEditor.status,
      StatusOptions.getTitles(),
      (input: string) => {
        // status just can't be blank
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
    
    // building preference
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
        // check if any room matches this course's position
        if (input === Course.noPref) {
          let found = false;
          Rooms.instance!.forEachRoom((room) => {
            if (Positions.match(this.getValue(CourseEditor.position)).roomFilter.includes(room.type.title)) {
              found = true;
            }
          });
          return found;
        }

        // check if rooms in the specific building match this course's position
        let found = false;
        Rooms.instance!.getBuilding(input)!.forEachRoom((room) => {          
          if (Positions.match(this.getValue(CourseEditor.position)).roomFilter.includes(room.type.title)) {
            found = true;
          }
        });
        return found;
      },
      (field: fields.MenuSelectField) => {
        field.setNotice("");
      },
      (field: fields.MenuSelectField) => {
        if (field.getValue() === fields.MenuSelectField.emptyOption) {
          field.setNotice(`building preference will default to "${Course.noPref}"`);
          field.setValue(Course.noPref);
        } else {
          // if no rooms that match this course's position could be found
          field.setNotice(`${field.getValue()} has no rooms</br>available for ${this.getValue(CourseEditor.position)} sessions`);
        }
      }
    );
  }

  private buildCommentsRow() {
    this.addRow();

    // comments can be anything
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
    let newStatus = StatusOptions.match(this.getValue(CourseEditor.status));

    // if the building preference is changed, 
    // automatically set a scheduled status back to an in-progress status
    if (this.getValue(CourseEditor.preference) !== this.curCourse!.preference
      && StatusOptions.isScheduledStatus(this.curCourse!.status)) {
        newStatus = StatusOptions.inProgress;
    }

    const changes: CourseConfig = {
      tutor: this.client!,
      id: this.getValue(CourseEditor.id),
      position: Positions.match(this.getValue(CourseEditor.position)),
      status: newStatus,
      preference: this.getValue(CourseEditor.preference),
      row: this.curCourse?.row ?? -1,
      timestamp: timeConvert.stampToStr(this.curCourse?.timestamp ?? (new Date()).getTime()), // either use response form timestamp, or current timestamp for new courses
      comments: this.getValue(CourseEditor.comments),
      scheduler: this.curCourse?.scheduler ?? "scheduler" // TODO: add scheduler
    };

    // if this is course being edited
    if (this.curCourse) {
      // remove the old course id mapping
      if (changes.id !== this.curCourse.id) {
        this.client!.removeCourse(this.curCourse.id);
      }
      // update the actual course
      this.curCourse.update(changes);
      // reassign the course mapping
      this.client!.setCourse(this.curCourse);
    
    // or if this is a new course
    } else {
      const newCourse = Course.buildCourse(changes);
      this.client!.addCourse(newCourse);
    }
    return;
  }

  /**
   * Start creating a new course for the given tutor.
   */
  createNewCourse(client: Tutor) {
    this.openMenu();
    this.client = client;
    this.curCourse = null;
  }

  /**
   * Edit an existing course for the given tutor.
   */
  editCourse(client: Tutor, course: Course) {
    this.createNewCourse(client);
    this.curCourse = course;
    this.getField(CourseEditor.id)!.setValue(course.id);
    this.getField(CourseEditor.position)!.setValue(course.position.title);
    this.getField(CourseEditor.status)!.setValue(course.status.title);

    // set the editor's color based on the scheduling status
    this.setColor(course.status.color);

    // update building name options
    const options = Rooms.instance!.getBuildingNames();
    options.push(Course.noPref);
    (this.getField(CourseEditor.preference)! as fields.MenuSelectField)
    .updateOptions(options);

    this.getField(CourseEditor.preference)!.setValue(course.preference);
    this.getField(CourseEditor.comments)!.setValue(course.comments);
  }
}
