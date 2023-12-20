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

  abstract buildField(): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  abstract reset(): void;

  getValue(): string {
    return this.field.value;
  }

  setValue(value: string) {
    this.field.value = value;
  }

  setNotice(notice: string) {
    this.notice.innerHTML = notice;
  }

  abstract validate(): boolean;
}

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

  clearOptions() {
    this.field.innerHTML = "";
    const emptyOption = document.createElement("option");
    emptyOption.value = MenuSelectField.emptyOption;
    emptyOption.innerHTML = MenuSelectField.emptyOption;
    this.field.append(emptyOption);
  }

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

export class MenuTextField extends MenuField {
  private _validate: (input: string) => boolean;
  private _valid: (field: MenuTextField) => void;
  private _invalid: (field: MenuTextField) => void;

  constructor(title: string, validate: (input: string) => boolean, valid: (field: MenuTextField) => void, invalid: (field: MenuTextField) => void) {
    super(title);
    this._validate = validate;
    this._valid = valid;
    this._invalid = invalid;
  }

  override buildField(): HTMLTextAreaElement {
    const field = document.createElement("textarea");
    field.style.display = "block";
    field.style.padding = "3px";
    field.cols = 70;
    field.rows = 3;
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