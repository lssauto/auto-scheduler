import * as fields from "./menu-field.ts";

export abstract class Editor {
  protected _div: HTMLDivElement;
  protected _menu: HTMLDivElement;
  readonly title: string;
  protected _fields: HTMLDivElement;
  protected _rows: MenuRow[];

  protected _saveButton: HTMLButtonElement;
  protected _cancelButton: HTMLButtonElement;
  protected _notice: HTMLElement;

  constructor(title: string) {
    this._div = this.buildDiv();
    this.title = title;
    this._fields = this.buildFields();
    this._saveButton = this.buildSaveButton();
    this._cancelButton = this.buildCancelButton();
    this._notice = this.buildNotice();
    this._menu = this.buildMenu();
    this._div.append(this._menu);
    this._rows = [];

    const body = document.getElementById("body")!;
    body.append(this._div);

    this.closeMenu();
  }

  private buildDiv(): HTMLDivElement {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.position = "fixed";
    div.style.top = "0px";
    div.style.background = "rgba(255, 255, 255, 0.5)";
    return div;
  }

  private buildMenu(): HTMLDivElement {
    const menu = document.createElement("div");
    menu.style.width = "60%";
    menu.style.height = "60%";
    menu.style.border = "2px solid black";
    menu.style.backgroundColor = "#F0F0F0";
    menu.style.borderRadius = "5px";
    menu.style.padding = "10px";

    const title = document.createElement("h3");
    title.innerHTML = this.title;
    title.style.borderBottom = "1px solid black";
    menu.append(title);
    menu.append(document.createElement("br"));

    menu.append(this._fields);

    menu.append(this.buildSaveRow());

    return menu;
  }

  private buildFields(): HTMLDivElement {
    const fields = document.createElement("div");
    fields.style.display = "flex";
    fields.style.width = "100%";
    fields.style.height = "70%";
    fields.style.flexDirection = "column";
    fields.style.justifyContent = "space-evenly";
    return fields;
  }

  private buildSaveRow(): HTMLDivElement {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-evenly";

    const container = document.createElement("div");
    
    row.append(this._saveButton);
    row.append(this._cancelButton);
    container.append(row);
    container.append(document.createElement("br"));
    container.append(this._notice);

    return container;
  }

  private buildSaveButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.style.padding = "10px";
    button.innerHTML = "Save";
    button.addEventListener("click", () => {
      if (this.validate()) {
        this.applyChanges();
        this.closeMenu();
      }
    });
    return button;
  }

  abstract applyChanges(): void;

  private buildCancelButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.style.padding = "10px";
    button.innerHTML = "Cancel";
    button.addEventListener("click", () => {
      // TODO: add console message
      this.closeMenu();
    });
    return button;
  }

  private buildNotice(): HTMLElement {
    const notice = document.createElement("p");
    notice.style.padding = "0px";
    notice.style.margin = "0px";
    notice.style.fontSize = "0.9em";
    notice.style.textAlign = "center";
    return notice;
  }

  setNotice(notice: string) {
    this._notice.innerHTML = notice;
  }

  validate(): boolean {
    let result = true;
    this._rows.forEach((row) => {
      row.forEach((field) => {
        if (!field.validate()) {
          result = false;
          this.setNotice(`${field.title} must be valid`);
        }
      });
    });
    return result;
  }

  reset() {
    this._rows.forEach((row) => {
      row.forEach((field) => {
        field.reset();
      });
    });
    this.setNotice("");
    this.setColor(Editor.blankColor);
    this.specificReset();
  }

  protected specificReset() {
    console.log(`reset ${this.title} editor`);
  }

  openMenu() {
    this._div.style.display = "flex";
    this.reset();
  }

  closeMenu() {
    this._div.style.display = "none";
  }

  static readonly blankColor = {
    backgroundColor: "#F0F0F0",
    borderColor: "black",
  };

  setColor(colors: { backgroundColor: string; borderColor: string }) {
    this._menu.style.backgroundColor = colors.backgroundColor;
    this._menu.style.borderColor = colors.borderColor;
  }

  // # menu building ==================================

  addRow() {
    this._rows.push(new MenuRow());
    this._fields.append(this._rows[this._rows.length - 1].div);
  }

  setRowNotice(row: number, notice: string) {
    if (row < 0 || this._rows.length <= row) return;
    this._rows[row].setNotice(notice);
  }

  addInputField(row: number, title: string, validate: (input: string) => boolean, valid: (field: fields.MenuInputField) => void, invalid: (field: fields.MenuInputField) => void) {
    if (row < 0 || this._rows.length <= row) return;
    const field = new fields.MenuInputField(
      title,
      validate,
      valid,
      invalid
    );
    this._rows[row].addField(field);
  }

  addSelectField(row: number, title: string, options: string[], validate: (input: string) => boolean, valid: (field: fields.MenuSelectField) => void, invalid: (field: fields.MenuSelectField) => void) {
    if (row < 0 || this._rows.length <= row) return;
    const field = new fields.MenuSelectField(
      title,
      validate,
      valid,
      invalid
    );
    options.forEach((option) => {
      field.addOption(option);
    });
    this._rows[row].addField(field);
  }

  addTimeField(row: number, title: string, validate: (input: number) => boolean, valid: (field: fields.MenuTimeField) => void, invalid: (field: fields.MenuTimeField) => void) {
    if (row < 0 || this._rows.length <= row) return;
    const field = new fields.MenuTimeField(
      title,
      validate,
      valid,
      invalid
    );
    this._rows[row].addField(field);
  }

  addTextField(row: number, title: string, validate: (input: string) => boolean, valid: (field: fields.MenuTextField) => void, invalid: (field: fields.MenuTextField) => void) {
    if (row < 0 || this._rows.length <= row) return;
    const field = new fields.MenuTextField(
      title,
      validate,
      valid,
      invalid
    );
    this._rows[row].addField(field);
  }

  getField(title: string): fields.MenuField | null {
    for (const row of this._rows) {
      const result = row.getField(title);
      if (result !== null) {
        return result;
      }
    }
    return null;
  }

  getValue(title: string): string {
    for (const row of this._rows) {
      const result = row.getField(title);
      if (result !== null) {
        return result.getValue();
      }
    }
    return "";
  }
}

export class MenuRow {
  private _fields: fields.MenuField[];
  readonly div: HTMLDivElement;
  private _container: HTMLDivElement;
  private _notice: HTMLElement;

  constructor() {
    this._fields = [];
    this.div = document.createElement("div");
    
    this._container = document.createElement("div");
    this._container.style.display = "flex";
    this._container.style.justifyContent = "space-evenly";
    this.div.append(this._container);

    this.div.append(document.createElement("br"));

    this._notice = document.createElement("p");
    this._notice.style.padding = "0px";
    this._notice.style.margin = "0px";
    this._notice.style.fontSize = "0.9em";
    this._notice.style.textAlign = "center";
    this.div.append(this._notice);
  }

  setNotice(notice: string) {
    this._notice.innerHTML = notice;
  }

  addField(field: fields.MenuField) {
    this._fields.push(field);
    this._container.append(field.div);
  }

  getField(title: string): fields.MenuField | null {
    for (const field of this._fields) {
      if (field.title === title) {
        return field;
      }
    }
    return null;
  }

  forEach(action: (field: fields.MenuField) => void) {
    this._fields.forEach(action);
  }
}
