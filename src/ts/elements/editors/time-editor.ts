import { TimeBlock, Tags, tagColors, TimeBlockConfig } from "../../schedule/time-block";
import { Days } from "../../enums";
import { Schedule } from "../../schedule/schedule";
import { Course } from "../../tutors/course";
import { Tutors } from "../../tutors/tutors";
import { Rooms } from "../../rooms/rooms";
import * as timeConvert from "../../utils/time-convert";

export class TimeEditor {
  private static _instance: TimeEditor | null = null;
  public static get instance(): TimeEditor | null {
    return TimeEditor._instance;
  }

  curTime: TimeBlock | null = null;
  curChanges?: TimeBlockConfig;
  client?: Schedule;

  private _body?: HTMLElement;
  div?: HTMLDivElement;
  private _menu?: HTMLDivElement;

  static tagField?: HTMLSelectElement;
  static courseField?: HTMLInputElement;
  static courseNotice?: HTMLElement;

  static tutorField?: HTMLInputElement;
  static tutorNotice?: HTMLElement;
  static roomField?: HTMLInputElement;
  static roomNotice?: HTMLElement;

  static dayField?: HTMLSelectElement;
  static startField?: HTMLInputElement;
  static endField?: HTMLInputElement;
  static timeNotice?: HTMLElement;

  static saveButton?: HTMLButtonElement;
  static cancelButton?: HTMLButtonElement;

  constructor() {
    if (TimeEditor.instance !== null && TimeEditor.instance !== this) {
      console.error("Singleton TimeEditor class instantiated twice");
      return;
    }
    TimeEditor._instance = this;

    this._body = document.getElementById("body")!;

    this.buildDiv();

    this._body.append(this.div!);
  }

  private buildDiv() {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.position = "fixed";
    div.style.top = "0px";

    div.style.background = "rgba(255, 255, 255, 0.5)";

    this.buildMenu();

    div.append(this._menu!);

    this.div = div;
  }

  private buildMenu() {
    const menu = document.createElement("div");
    menu.style.width = "60%";
    menu.style.height = "60%";
    menu.style.border = "2px solid black";
    menu.style.backgroundColor = "#F0F0F0";
    menu.style.borderRadius = "5px";
    menu.style.padding = "10px";

    const title = document.createElement("h3");
    title.innerHTML = "Edit Time:";
    title.style.borderBottom = "1px solid black";
    menu.append(title);
    menu.append(document.createElement("br"));

    menu.append(this.buildFields());
    this._menu = menu;
  }

  private buildFields(): HTMLDivElement {
    const fields = document.createElement("div");
    fields.style.display = "flex";
    fields.style.width = "100%";
    fields.style.height = "80%";
    fields.style.flexDirection = "column";
    fields.style.justifyContent = "space-between";

    fields.append(this.buildCourseRow());
    fields.append(this.buildOwnerRow());
    fields.append(this.buildTimeRow());
    fields.append(this.buildSaveRow());

    return fields;
  }

  private buildCourseRow(): HTMLDivElement {
    const fields = document.createElement("div");
    fields.style.display = "flex";

    const spacer1 = document.createElement("div");
    spacer1.style.flexGrow = "1";
    fields.append(spacer1);

    this.buildTagField();
    const tagTitle = document.createElement("p");
    tagTitle.innerHTML = "<b>Type:</b>";
    fields.append(tagTitle);
    fields.append(TimeEditor.tagField!);

    const spacer2 = document.createElement("div");
    spacer2.style.flexGrow = "2";
    fields.append(spacer2);

    const courseTitle = document.createElement("p");
    courseTitle.innerHTML = "<b>Course ID:</b>";
    fields.append(courseTitle);
    const courseContainer = this.buildCourseField();
    fields.append(courseContainer);

    const spacer3 = document.createElement("div");
    spacer3.style.flexGrow = "1";
    fields.append(spacer3);

    return fields;
  }

  private buildOwnerRow(): HTMLDivElement {
    const fields = document.createElement("div");
    fields.style.display = "flex";

    const spacer1 = document.createElement("div");
    spacer1.style.flexGrow = "1";
    fields.append(spacer1);

    const tutorTitle = document.createElement("p");
    tutorTitle.innerHTML = "<b>Tutor Email:</b>";
    fields.append(tutorTitle);
    const tutorContainer = this.buildTutorField();
    fields.append(tutorContainer);

    const spacer2 = document.createElement("div");
    spacer2.style.flexGrow = "2";
    fields.append(spacer2);

    const roomTitle = document.createElement("p");
    roomTitle.innerHTML = "<b>Room Name:</b>";
    fields.append(roomTitle);
    const roomContainer = this.buildRoomField();
    fields.append(roomContainer);

    const spacer3 = document.createElement("div");
    spacer3.style.flexGrow = "1";
    fields.append(spacer3);

    return fields;
  }

  private buildTimeRow(): HTMLDivElement {
    const container = document.createElement("div");
    container.style.width = "100%";

    const fields = document.createElement("div");
    fields.style.display = "flex";
    fields.style.justifyContent = "space-evenly";

    const title = document.createElement("p");
    title.innerHTML = "<b>Time:</b>";
    fields.append(title);

    this.buildDayField();
    fields.append(TimeEditor.dayField!);

    const from = document.createElement("p");
    from.innerHTML = "<b>from</b>";
    fields.append(from);

    this.buildStartField();
    fields.append(TimeEditor.startField!);

    const to = document.createElement("p");
    to.innerHTML = "<b>to</b>";
    fields.append(to);

    this.buildEndField();
    fields.append(TimeEditor.endField!);

    container.append(fields);

    const notice = this.buildNotice();
    notice.style.width = "100%";
    notice.style.textAlign = "center";
    TimeEditor.timeNotice = notice;
    container.append(document.createElement("br"));
    container.append(notice);

    return container;
  }

  private buildSaveRow(): HTMLDivElement {
    const fields = document.createElement("div");
    fields.style.display = "flex";
    fields.style.justifyContent = "space-evenly";

    this.buildSaveButton();
    fields.append(TimeEditor.saveButton!);
    this.buildCancelButton();
    fields.append(TimeEditor.cancelButton!);

    return fields;
  }

  private buildTagField() {
    const field = document.createElement("select");
    field.style.margin = "3px";

    const emptyOption = document.createElement("option");
    emptyOption.value = "---";
    emptyOption.innerHTML = "---";
    field.append(emptyOption);

    for (const tag of Object.values(Tags)) {
      const option = document.createElement("option");
      option.value = tag;
      option.innerHTML = tag;
      field.append(option);
    }
    field.addEventListener("change", () => {
      if (field.value === "---") {
        TimeEditor.instance!.setColor({
          backgroundColor: "#F0F0F0",
          borderColor: "black",
        });
      } else {
        TimeEditor.instance!.setColor(tagColors.get(field.value as Tags)!);
      }
    });
    TimeEditor.tagField = field;
  }

  private buildCourseField(): HTMLDivElement {
    const container = document.createElement("div");

    const field = document.createElement("input");
    field.style.marginTop = "8%";
    field.width = 12;
    TimeEditor.courseField = field;

    const notice = this.buildNotice();
    TimeEditor.courseNotice = notice;

    field.addEventListener("focusout", () => {
      const formatted = Course.formatID(field.value);
      if (formatted !== Course.na) {
        field.value = formatted;
        notice.innerHTML = "";
        TimeEditor.validateCourseID();
      } else {
        notice.innerHTML = "course ID could not be formatted";
      }
    });

    container.append(field);
    container.append(document.createElement("br"));
    container.append(notice);

    return container;
  }

  private buildTutorField(): HTMLDivElement {
    const container = document.createElement("div");

    const field = document.createElement("input");
    field.style.marginTop = "10%";
    field.width = 20;
    TimeEditor.tutorField = field;

    const notice = this.buildNotice();
    TimeEditor.tutorNotice = notice;

    field.addEventListener("focusout", () => {
      if (field.value === "") {
        notice.innerHTML = "";
        return;
      }
      const result = Tutors.instance!.match(field.value);
      if (result !== null) {
        field.value = result.email;
        notice.innerHTML = result.name;
        TimeEditor.validateCourseID();
      } else {
        notice.innerHTML = "email/name was not found in tutors list";
        TimeEditor.courseNotice!.innerHTML = "";
      }
    });

    container.append(field);
    container.append(document.createElement("br"));
    container.append(notice);
    return container;
  }

  private buildRoomField(): HTMLDivElement {
    const container = document.createElement("div");

    const field = document.createElement("input");
    field.style.marginTop = "8%";
    field.width = 20;
    TimeEditor.roomField = field;

    const notice = this.buildNotice();
    TimeEditor.roomNotice = notice;

    field.addEventListener("focusout", () => {
      if (field.value === "") {
        notice.innerHTML = "";
        return;
      }
      const result = Rooms.instance!.match(field.value);
      if (result !== null) {
        field.value = result.name;
        notice.innerHTML = result.name;
      } else {
        notice.innerHTML = "name was not found in the Rooms list";
      }
    });

    container.append(field);
    container.append(document.createElement("br"));
    container.append(notice);
    return container;
  }

  private buildDayField() {
    const field = document.createElement("select");
    field.style.margin = "3px";

    const emptyOption = document.createElement("option");
    emptyOption.value = "---";
    emptyOption.innerHTML = "---";
    field.append(emptyOption);

    for (const day of Object.values(Days)) {
      const option = document.createElement("option");
      option.value = day;
      option.innerHTML = day;
      field.append(option);
    }

    field.addEventListener("change", () => {
      TimeEditor.verifyTime();
    });

    TimeEditor.dayField = field;
  }

  private buildStartField() {
    const field = document.createElement("input");
    field.type = "time";
    field.step = "60";
    field.addEventListener("change", () => {
      TimeEditor.verifyTime();
    });
    TimeEditor.startField = field;
  }

  private buildEndField() {
    const field = document.createElement("input");
    field.type = "time";
    field.step = "60";
    field.addEventListener("change", () => {
      TimeEditor.verifyTime();
    });
    TimeEditor.endField = field;
  }

  private buildSaveButton() {
    const button = document.createElement("button");
    button.style.padding = "10px";
    button.innerHTML = "Save";
    button.addEventListener("click", () => {
      this.curTime!.update(this.curChanges!);
      // TODO: add console message
      TimeEditor.instance!.hideMenu();
    });
    TimeEditor.saveButton = button;
  }

  private buildCancelButton() {
    const button = document.createElement("button");
    button.style.padding = "10px";
    button.innerHTML = "Cancel";
    button.addEventListener("click", () => {
      // TODO: add console message
      TimeEditor.instance!.hideMenu();
    });
    TimeEditor.cancelButton = button;
  }

  private buildNotice(): HTMLElement {
    const notice = document.createElement("p");
    notice.style.padding = "0px";
    notice.style.margin = "0px";
    notice.style.fontSize = "0.9em";
    // notice.style.color = "orange";
    // notice.style.textShadow = "0px 0px 3px black";
    return notice;
  }

  setColor(colors: { backgroundColor: string; borderColor: string }) {
    this._menu!.style.backgroundColor = colors.backgroundColor;
    this._menu!.style.borderColor = colors.borderColor;
  }

  showMenu() {
    this.div!.style.display = "flex";
  }

  hideMenu() {
    this.div!.style.display = "none";
  }

  // # Input Validation Checks =====================================

  static validateCourseID() {
    const result = Tutors.instance!.getTutor(TimeEditor.tutorField!.value);
    if (result === undefined) {
      TimeEditor.courseNotice!.innerHTML = "";
      return;
    }
    if (TimeEditor.courseField!.value !== "") {
      if (result.hasCourse(TimeEditor.courseField!.value)) {
        TimeEditor.courseNotice!.innerHTML = result.getCourse(
          TimeEditor.courseField!.value
        )!.position.title;
      } else {
        TimeEditor.courseNotice!.innerHTML = `${result.name} is not assigned to this course`;
      }
    }
  }

  static verifyTime() {
    let notice = "";
    if (TimeEditor.dayField!.value === "---") {
      notice = "please select a day";
    } else if (TimeEditor.startField!.value !== "" && TimeEditor.endField!.value !== "") {

      const timeObj = {
        day: TimeEditor.dayField!.value as Days,
        start: timeConvert.strToInt(TimeEditor.startField!.value),
        end: timeConvert.strToInt(TimeEditor.endField!.value),
      };

      if (TimeEditor.tutorField!.value !== "" && Tutors.instance!.hasTutor(TimeEditor.tutorField!.value)) {
        const tutor = Tutors.instance!.getTutor(TimeEditor.tutorField!.value)!;
        if (tutor.schedule.hasConflictWith(timeObj)) {
          notice = "time conflicts with tutor's current schedule";
        }
      }

      if (TimeEditor.roomField!.value !== "" && Rooms.instance!.hasRoom(TimeEditor.roomField!.value)) {
        const room = Rooms.instance!.getRoom(TimeEditor.roomField!.value)!;
        if (room.schedule.hasConflictWith(timeObj)) {
          notice = "time conflicts with room's current schedule";
        }
      }

      if (timeObj.end < timeObj.start) {
        notice = "start must be before end";
      }
    }

    TimeEditor.timeNotice!.innerHTML = notice;
  }
}
