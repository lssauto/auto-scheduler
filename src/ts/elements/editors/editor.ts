import { Messages } from "../messages/messages.ts";
import * as fields from "./menu-field.ts";

/**
 * Super class for all editor windows, provides a subclass-sandbox for 
 * building editor windows.
 */
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
    // build components
    this._div = this.buildDiv();
    this.title = title;
    this._fields = this.buildFields();
    this._saveButton = this.buildSaveButton();
    this._cancelButton = this.buildCancelButton();
    this._notice = this.buildNotice();
    this._menu = this.buildMenu();
    this._div.append(this._menu);
    this._rows = [];

    // add editor to root element
    const body = document.getElementById("body")!;
    body.append(this._div);

    this.closeMenu();
  }

  // The root container for the editor. This styling adds the gray, transparent background
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

  // The actual menu div, placed in the center of the screen by the style above ^
  private buildMenu(): HTMLDivElement {
    const menu = document.createElement("div");
    menu.style.width = "60%";
    menu.style.height = "60%";
    menu.style.border = "2px solid black";
    menu.style.backgroundColor = "#F0F0F0";
    menu.style.borderRadius = "5px";
    menu.style.padding = "10px";

    // title element
    const title = document.createElement("h3");
    title.innerHTML = this.title;
    title.style.borderBottom = "1px solid black";
    menu.append(title);
    menu.append(document.createElement("br"));

    // fields are currently empty, will be filled in later by subclass implementations
    menu.append(this._fields);

    // add save and cancel buttons
    menu.append(this.buildSaveRow());

    return menu;
  }

  // styling for fields div, this contains each row of menu fields
  private buildFields(): HTMLDivElement {
    const fields = document.createElement("div");
    fields.style.display = "flex";
    fields.style.width = "100%";
    fields.style.height = "70%";
    fields.style.flexDirection = "column";
    fields.style.justifyContent = "space-evenly";
    return fields;
  }

  // menu row with the save and cancel buttons
  private buildSaveRow(): HTMLDivElement {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-evenly";

    const container = document.createElement("div");
    
    // save and cancel buttons were built earlier in the constructor
    row.append(this._saveButton);
    row.append(this._cancelButton);
    container.append(row);
    container.append(document.createElement("br"));

    // the notice below the save and cancel buttons
    container.append(this._notice);

    return container;
  }

  private buildSaveButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.style.padding = "10px";
    button.innerHTML = "Save";

    // validate and applyChanges are implemented by subclasses
    button.addEventListener("click", () => {
      if (this.validate()) {
        this.applyChanges();
        this.closeMenu();
        Messages.output(Messages.success, "Changes have been saved.");
      }
    });
    return button;
  }

  /**
   * Called when the user presses save, and all fields have been validated. 
   * Use to apply any changes made in the editor to actual object being edited.
   */
  abstract applyChanges(): void;

  private buildCancelButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.style.padding = "10px";
    button.innerHTML = "Cancel";

    // just close the menu
    button.addEventListener("click", () => {
      this.closeMenu();
      Messages.output(Messages.info, "Changes have been discarded.");
    });
    return button;
  }

  // The notice below the save and cancel buttons
  private buildNotice(): HTMLElement {
    const notice = document.createElement("p");
    notice.style.padding = "0px";
    notice.style.margin = "0px";
    notice.style.fontSize = "0.9em";
    notice.style.textAlign = "center";
    return notice;
  }

  /**
   * Display text below the save and cancel buttons. Useful for showing general messages 
   * during validation.
   */
  setNotice(notice: string) {
    this._notice.innerHTML = notice;
  }

  /**
   * Returns true if all fields in the menu successfully pass their validation checks.
   * used to check if the changes can be applied to actual object.
   */
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

  /**
   * Resets all menu fields to default values, and erases text from notices.
   */
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

  /**
   * Use to define any specific behavior needed during reset for a given subclass.
   */
  protected specificReset() {
    console.log(`reset ${this.title} editor`);
  }

  /**
   * Displays and resets the editor.
   */
  openMenu() {
    this._div.style.display = "flex";
    this.reset();
  }

  /**
   * Hides the editor.
   */
  closeMenu() {
    this._div.style.display = "none";
  }

  /**
   * Default color for the editor, just a gray box, with a black border.
   */
  static readonly blankColor = {
    backgroundColor: "#F0F0F0",
    borderColor: "black",
  };

  /**
   * Specify the background and border color of the editor. Use to make the editor more 
   * dynamic.
   */
  setColor(colors: { backgroundColor: string; borderColor: string }) {
    this._menu.style.backgroundColor = colors.backgroundColor;
    this._menu.style.borderColor = colors.borderColor;
  }

  // # menu building ==================================

  /**
   * Adds a new row to the menu. Each row can be given fields, and has a notice for displaying text.
   * Rows are access by number, which is defined by their insertion order.
   */
  addRow() {
    this._rows.push(new MenuRow());
    this._fields.append(this._rows[this._rows.length - 1].div);
  }

  /**
   * Display text on specified row's notice.
   * @param row The row number to set its notice.
   * @param notice The text to display.
   */
  setRowNotice(row: number, notice: string) {
    if (row < 0 || this._rows.length <= row) return;
    this._rows[row].setNotice(notice);
  }

  /**
   * Adds a short response input field to the given row.
   * @param row The row number to add the field to.
   * @param title The field title, displayed next to the input element.
   * @param validate Returns true if the given field contents are valid, false otherwise.
   * @param valid Invoked if the validate function returns true.
   * @param invalid Invoked if the validate function returns false.
   */
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

  /**
   * Adds a dropdown menu to the given row.
   * @param row The row number to add the field to.
   * @param title The field title, displayed next to the input element.
   * @param options The list of options that should be displayed in the dropdown menu.
   * @param validate Returns true if the given field contents are valid, false otherwise.
   * @param valid Invoked if the validate function returns true.
   * @param invalid Invoked if the validate function returns false.
   */
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

  /**
   * Adds a time input field to the given row.
   * @param row The row number to add the field to.
   * @param title The field title, displayed next to the input element.
   * @param validate Returns true if the given field contents are valid, false otherwise.
   * @param valid Invoked if the validate function returns true.
   * @param invalid Invoked if the validate function returns false.
   */
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

  /**
   * Adds a long response field to the given row.
   * @param row The row number to add the field to.
   * @param title The field title, displayed next to the input element.
   * @param cols The number of columns the input field should have.
   * @param rows The number of rows the input field should have.
   * @param validate Returns true if the given field contents are valid, false otherwise.
   * @param valid Invoked if the validate function returns true.
   * @param invalid Invoked if the validate function returns false.
   */
  addTextField(row: number, title: string, cols: number, rows: number, validate: (input: string) => boolean, valid: (field: fields.MenuTextField) => void, invalid: (field: fields.MenuTextField) => void) {
    if (row < 0 || this._rows.length <= row) return;
    const field = new fields.MenuTextField(
      title,
      cols,
      rows,
      validate,
      valid,
      invalid
    );
    this._rows[row].addField(field);
  }

  /**
   * Adds a checkbox to the given row.
   * @param row The row number to add the field to.
   * @param title The field title, displayed next to the input element.
   * @param validate Returns true if the given field contents are valid, false otherwise.
   * @param valid Invoked if the validate function returns true.
   * @param invalid Invoked if the validate function returns false.
   */
  addCheckboxField(row: number, title: string, validate: (input: boolean) => boolean, valid: (field: fields.MenuCheckboxField) => void, invalid: (field: fields.MenuCheckboxField) => void) {
    if (row < 0 || this._rows.length <= row) return;
    const field = new fields.MenuCheckboxField(
      title,
      validate,
      valid,
      invalid
    );
    this._rows[row].addField(field);
  }

  /**
   * Gets a menu field using the field's title as a key. Returns null if the field 
   * couldn't be found.
   */
  getField(title: string): fields.MenuField | null {
    for (const row of this._rows) {
      const result = row.getField(title);
      if (result !== null) {
        return result;
      }
    }
    return null;
  }

  /**
   * Returns the current value of a field, using the field's title as a key.
   * Returns an empty string if the field couldn't be found.
   */
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

/**
 * Represents the rows in a editor menu.
 */
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
