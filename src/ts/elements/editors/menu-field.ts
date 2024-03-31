
/**
 * Super class for editor menu fields.
 */
export abstract class MenuField {
  readonly title: string;
  readonly field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  readonly notice: HTMLElement;
  readonly div: HTMLDivElement;

  constructor(title: string) {
    this.title = title;

    this.div = document.createElement("div");

    const titleElement = document.createElement("p");
    titleElement.style.display = "inline";
    titleElement.style.verticalAlign = "top";
    titleElement.innerHTML = `<b>${title}: </b>`;
    this.div.append(titleElement);

    // container has the actual input field, and the field's notice
    const container = document.createElement("div");
    container.style.display = "inline-block";
    this.div.append(container);

    this.field = this.buildField();
    this.field.addEventListener("focusout", () => {
      this.validate();
    });
    container.append(this.field);

    this.notice = document.createElement("p");
    this.notice.style.padding = "0px";
    this.notice.style.margin = "0px";
    this.notice.style.fontSize = "0.9em";
    container.append(this.notice);
  }

  /**
   * Constructs the actual input element.
   */
  abstract buildField(): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  /**
   * Resets the input element, and notice back to default values.
   */
  abstract reset(): void;

  getValue(): string {
    return this.field.value;
  }

  setValue(value: string) {
    this.field.value = value;
  }

  /**
   * Display a message below the input element.
   */
  setNotice(notice: string) {
    this.notice.innerHTML = notice;
  }

  /**
   * Validates the value of the field, and runs the valid or invalid functions accordingly.
   */
  abstract validate(): boolean;
}

/**
 * A short answer input field.
 */
export class MenuInputField extends MenuField {
  private _validate: (input: string) => boolean;
  private _valid: (field: MenuInputField) => void;
  private _invalid: (field: MenuInputField) => void;

  constructor(title: string, validate: (input: string) => boolean, valid: (field: MenuInputField) => void, invalid: (field: MenuInputField) => void) {
    super(title);
    this._validate = validate;
    this._valid = valid;
    this._invalid = invalid;
  }

  override buildField(): HTMLInputElement {
    const field = document.createElement("input");
    field.width = 12;
    return field;
  }

  override reset() {
    this.setValue("");
    this.setNotice("");
  }

  override validate(): boolean {
    if (this._validate(this.getValue())) {
      this._valid(this);
      return true;
    } else {
      this._invalid(this);
      return false;
    }
  }
}

/**
 * A dropdown menu field.
 */
export class MenuSelectField extends MenuField {
  static readonly emptyOption = "---";

  private _validate: (input: string) => boolean;
  private _valid: (field: MenuSelectField) => void;
  private _invalid: (field: MenuSelectField) => void;

  private _options: string[];

  constructor(title: string, validate: (input: string) => boolean, valid: (field: MenuSelectField) => void, invalid: (field: MenuSelectField) => void) {
    super(title);
    this.field.addEventListener("change", () => {
      this.validate();
    });
    this._validate = validate;
    this._valid = valid;
    this._invalid = invalid;
    this._options = [];
  }

  override buildField(): HTMLSelectElement {
    const field = document.createElement("select");
    const emptyOption = document.createElement("option");
    emptyOption.value = MenuSelectField.emptyOption;
    emptyOption.innerHTML = MenuSelectField.emptyOption;
    field.append(emptyOption);
    return field;
  }

  override reset() {
    this.setValue(MenuSelectField.emptyOption);
    this.setNotice("");
  }

  addOption(option: string) {
    const newOption = document.createElement("option");
    newOption.value = option;
    newOption.innerHTML = option;
    this.field.append(newOption);
    this._options.push(option);
  }

  /**
   * Remove all options from this dropdown menu.
   */
  clearOptions() {
    this.field.innerHTML = "";
    const emptyOption = document.createElement("option");
    emptyOption.value = MenuSelectField.emptyOption;
    emptyOption.innerHTML = MenuSelectField.emptyOption;
    this.field.append(emptyOption);
  }

  /**
   * Replace current options with the given list of new options.
   */
  updateOptions(options: string[]) {
    this.clearOptions();
    options.forEach(option => this.addOption(option));
  }

  /**
   * Adds an event listener to the elements' onChange event.
   */
  onChange(action: (value: string) => void) {
    this.field.addEventListener("change", () => { 
      action(this.getValue());
    });
  }

  override validate(): boolean {
    if (this._validate(this.getValue())) {
      this._valid(this);
      return true;
    } else {
      this._invalid(this);
      return false;
    }
  }
}

import * as timeConvert from "../../utils/time-convert";

/**
 * A time selection input field. Use `value = field.getTime()` to get the field's 
 * value as number converted with `timeConvert.strToInt()`.
 */
export class MenuTimeField extends MenuField {
  private _validate: (input: number) => boolean;
  private _valid: (field: MenuTimeField) => void;
  private _invalid: (field: MenuTimeField) => void;

  constructor(title: string, validate: (input: number) => boolean, valid: (field: MenuTimeField) => void, invalid: (field: MenuTimeField) => void) {
    super(title);
    this._validate = validate;
    this._valid = valid;
    this._invalid = invalid;
  }

  override buildField(): HTMLInputElement {
    const field = document.createElement("input");
    field.type = "time";
    field.step = "60";
    return field;
  }

  /**
   * Get the fields value as an integer, converted with timeConvert.strToInt().
   */
  getTime(): number {
    return timeConvert.strToInt(this.getValue());
  }

  override reset() {
    this.setValue("");
    this.setNotice("");
  }

  override validate(): boolean {
    if (this._validate(this.getTime())) {
      this._valid(this);
      return true;
    } else {
      this._invalid(this);
      return false;
    }
  }
}

/**
 * Long response input field.
 */
export class MenuTextField extends MenuField {
  private _validate: (input: string) => boolean;
  private _valid: (field: MenuTextField) => void;
  private _invalid: (field: MenuTextField) => void;

  constructor(title: string, cols: number, rows: number, validate: (input: string) => boolean, valid: (field: MenuTextField) => void, invalid: (field: MenuTextField) => void) {
    super(title);
    (this.field as HTMLTextAreaElement).cols = cols;
    (this.field as HTMLTextAreaElement).rows = rows;
    (this.div.firstElementChild! as HTMLElement).style.display = "block";
    this._validate = validate;
    this._valid = valid;
    this._invalid = invalid;
  }

  override buildField(): HTMLTextAreaElement {
    const field = document.createElement("textarea");
    field.style.display = "block";
    field.style.padding = "3px";
    return field;
  }

  override reset() {
    this.setValue("");
    this.setNotice("");
  }

  override validate(): boolean {
    if (this._validate(this.getValue())) {
      this._valid(this);
      return true;
    } else {
      this._invalid(this);
      return false;
    }
  }
}

/**
 * Checkbox field. Use `field.setChecked(bool)` and `value = field.getChecked()` to 
 * get its value as a boolean.
 */
export class MenuCheckboxField extends MenuField {
  private _validate: (input: boolean) => boolean;
  private _valid: (field: MenuCheckboxField) => void;
  private _invalid: (field: MenuCheckboxField) => void;

  constructor(title: string, validate: (input: boolean) => boolean, valid: (field: MenuCheckboxField) => void, invalid: (field: MenuCheckboxField) => void) {
    super(title);
    this._validate = validate;
    this._valid = valid;
    this._invalid = invalid;
    this.field.addEventListener("change", () => {
      this.validate();
    });
  }

  override buildField(): HTMLInputElement {
    const field = document.createElement("input");
    field.type = "checkbox";
    return field;
  }

  /**
   * Set the checkbox and checked or not.
   */
  setChecked(checked: boolean) {
    (this.field as HTMLInputElement).checked = checked;
  }

  getChecked(): boolean {
    return (this.field as HTMLInputElement).checked;
  }

  override reset() {
    this.setChecked(false);
    this.setNotice("");
  }

  override validate(): boolean {
    if (this._validate(this.getChecked())) {
      this._valid(this);
      return true;
    } else {
      this._invalid(this);
      return false;
    }
  }
}