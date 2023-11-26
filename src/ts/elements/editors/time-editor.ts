import { TimeBlock, Tags, tagColors } from "../../schedule/time-block";
import { Days } from "../../enums";

export class TimeEditor {
  private static _instance: TimeEditor | null = null;
  public static get instance(): TimeEditor | null {
    return TimeEditor._instance;
  }

  curTime: TimeBlock | null = null;

  private _body?: HTMLElement;
  div?: HTMLDivElement;
  private _menu?: HTMLDivElement;

  private _tagField?: HTMLSelectElement;
  private _courseField?: HTMLInputElement;

  private _tutorTitle?: HTMLElement;
  private _tutorField?: HTMLInputElement;
  private _roomTitle?: HTMLElement;
  private _roomField?: HTMLInputElement;

  private _dayField?: HTMLSelectElement;
  private _startField?: HTMLInputElement;
  private _endField?: HTMLInputElement;

  private _saveButton?: HTMLButtonElement;
  private _cancelButton?: HTMLButtonElement;

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
    fields.append(this._tagField!);

    const spacer2 = document.createElement("div");
    spacer2.style.flexGrow = "2";
    fields.append(spacer2);

    this.buildCourseField();
    const courseTitle = document.createElement("p");
    courseTitle.innerHTML = "<b>Course ID:</b>";
    fields.append(courseTitle);
    fields.append(this._courseField!);

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

    this.buildTutorField();
    fields.append(this._tutorTitle!);
    fields.append(this._tutorField!);

    const spacer2 = document.createElement("div");
    spacer2.style.flexGrow = "2";
    fields.append(spacer2);

    this.buildRoomField();
    fields.append(this._roomTitle!);
    fields.append(this._roomField!);

    const spacer3 = document.createElement("div");
    spacer3.style.flexGrow = "1";
    fields.append(spacer3);

    return fields;
  }

  private buildTimeRow(): HTMLDivElement {
    const fields = document.createElement("div");
    fields.style.display = "flex";
    fields.style.justifyContent = "space-evenly";

    const title = document.createElement("p");
    title.innerHTML = "<b>Time:</b>";
    fields.append(title);

    this.buildDayField();
    fields.append(this._dayField!);

    const from = document.createElement("p");
    from.innerHTML = "<b>from</b>";
    fields.append(from);

    this.buildStartField();
    fields.append(this._startField!);

    const to = document.createElement("p");
    to.innerHTML = "<b>to</b>";
    fields.append(to);

    this.buildEndField();
    fields.append(this._endField!);

    return fields;
  }

  private buildSaveRow(): HTMLDivElement {
    const fields = document.createElement("div");
    fields.style.display = "flex";
    fields.style.justifyContent = "space-evenly";

    this.buildSaveButton();
    fields.append(this._saveButton!);
    this.buildCancelButton();
    fields.append(this._cancelButton!);

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
    this._tagField = field;
  }

  private buildCourseField() {
    const field = document.createElement("input");
    field.style.margin = "3px";
    field.width = 12;
    this._courseField = field;
  }

  private buildTutorField() {
    const title = document.createElement("p");
    title.innerHTML = "<b>Tutor Email:</b>";
    this._tutorTitle = title;

    const field = document.createElement("input");
    field.style.margin = "3px";
    field.width = 20;
    this._tutorField = field;
  }

  private buildRoomField() {
    const title = document.createElement("p");
    title.innerHTML = "<b>Room Name:</b>";
    this._roomTitle = title;

    const field = document.createElement("input");
    field.style.margin = "3px";
    field.width = 20;
    this._roomField = field;
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

    this._dayField = field;
  }

  private buildStartField() {
    const timeField = document.createElement("input");
    timeField.type = "time";
    timeField.step = "60";
    this._startField = timeField;
  }

  private buildEndField() {
    const timeField = document.createElement("input");
    timeField.type = "time";
    timeField.step = "60";
    this._endField = timeField;
  }

  private buildSaveButton() {
    const button = document.createElement("button");
    button.innerHTML = "Save";

    this._saveButton = button;
  }

  private buildCancelButton() {
    const button = document.createElement("button");
    button.innerHTML = "Cancel";

    this._cancelButton = button;
  }

  setColor(colors: { backgroundColor: string; borderColor: string }) {
    this._menu!.style.backgroundColor = colors.backgroundColor;
    this._menu!.style.borderColor = colors.borderColor;
  }
}
