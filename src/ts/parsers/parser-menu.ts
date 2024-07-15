import * as fields from "../elements/editors/menu-field";
import { parseBuildings } from "./building-parser";
import { parseResponses } from "./response-parser";
import { parseRooms } from "./room-parser";
import { parseTutors } from "./tutor-parser";

/**
 * Menu used for parsing table data. Very similar to editors.
 */
export class ParserMenu {
  private static _instance: ParserMenu | null = null;
  public static get instance(): ParserMenu | null {
    return ParserMenu._instance;
  }

  private _div: HTMLDivElement;
  private _menu: HTMLDivElement;
  private _fields: HTMLDivElement;
  private _input: fields.MenuTextField;

  constructor() {
    if (ParserMenu.instance !== null && ParserMenu.instance !== this) {
      console.error("singleton ParserMenu class instantiated twice");
    }
    ParserMenu._instance = this;

    this._div = this.buildDiv();

    // long response field to paste table data into
    this._input = new fields.MenuTextField(
      "Input Table Data", 70, 13,
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
    // ands response field to a flex box
    this._fields = this.buildFields();

    this._menu = this.buildMenu();
    this._div.append(this._menu);

    const body = document.getElementById("body")!;
    body.append(this._div);

    this.closeMenu();
  }

  // the gray, transparent background used as the root element for the menu
  private buildDiv(): HTMLDivElement {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "center";
    div.style.alignItems = "center";
    div.style.width = "69%";
    div.style.height = "100%";
    div.style.position = "fixed";
    div.style.top = "0px";
    div.style.left = "0px";
    div.style.background = "rgba(255, 255, 255, 0.5)";
    return div;
  }

  // the actual gray box that contains the menu fields
  private buildMenu(): HTMLDivElement {
    const menu = document.createElement("div");
    menu.style.width = "80%";
    menu.style.height = "60%";
    menu.style.border = "2px solid black";
    menu.style.backgroundColor = "#F0F0F0";
    menu.style.borderRadius = "5px";
    menu.style.padding = "10px";

    const title = document.createElement("h3");
    title.innerHTML = "Table Parser";
    title.style.borderBottom = "1px solid black";
    menu.append(title);
    menu.append(document.createElement("br"));

    menu.append(this._fields);

    menu.append(this.buildButtonRow());

    return menu;
  }

  // add the response field to a flex box
  private buildFields(): HTMLDivElement {
    const fields = document.createElement("div");
    fields.style.display = "flex";
    fields.style.width = "100%";
    fields.style.height = "70%";
    fields.style.flexDirection = "column";
    fields.style.justifyContent = "top";
    fields.style.alignItems = "center";

    fields.append(this._input.div);

    return fields;
  }

  // builds all the submission buttons
  private buildButtonRow(): HTMLDivElement {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-evenly";
    
    // parse buildings
    const buildings = document.createElement("button");
    buildings.style.display = "inline-block";
    buildings.innerHTML = "Parse Buildings";
    buildings.addEventListener("click", () => {
      parseBuildings(this._input.getValue());
      this._input.reset();
    });
    row.append(buildings);

    // rooms
    const rooms = document.createElement("button");
    rooms.style.display = "inline-block";
    rooms.innerHTML = "Parse Rooms";
    rooms.addEventListener("click", () => {
      parseRooms(this._input.getValue());
      this._input.reset();
    });
    row.append(rooms);

    // tutor positions
    const tutors = document.createElement("button");
    tutors.style.display = "inline-block";
    tutors.innerHTML = "Parse Tutors";
    tutors.addEventListener("click", () => {
      parseTutors(this._input.getValue());
      this._input.reset();
    });
    row.append(tutors);

    // response table
    const responses = document.createElement("button");
    responses.style.display = "inline-block";
    responses.innerHTML = "Parse Responses";
    responses.addEventListener("click", () => {
      parseResponses(this._input.getValue());
      this._input.reset();
    });
    row.append(responses);

    // spacer between parsing buttons and close menu button
    const spacer = document.createElement("p");
    spacer.style.display = "inline-block";
    spacer.style.margin = "10px";
    spacer.innerHTML = "||";
    row.append(spacer);

    // clos menu button
    const close = document.createElement("button");
    close.style.display = "inline-block";
    close.innerHTML = "Close Menu";
    close.addEventListener("click", () => {
      this.closeMenu();
    });
    row.append(close);

    return row;
  }

  /**
   * Displays the table parsing menu.
   */
  openMenu() {
    this._div.style.display = "flex";
    this._input.reset();
  }

  /**
   * Hides the table parsing menu.
   */
  closeMenu() {
    this._div.style.display = "none";
  }
}
