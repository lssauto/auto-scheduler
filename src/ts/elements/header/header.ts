import { ParserMenu } from "../../parsers/parser-menu";
import { Scheduler } from "../../scheduler/scheduler";
import { SchedulerName } from "./scheduler-name";

const TUTORS_MODE = true;
const ROOMS_MODE = false;

export class Header {
  private static _instance: Header | null = null;

  public static get instance(): Header | null {
    return Header._instance;
  }

  private _body: HTMLElement;
  private _headerElem: HTMLDivElement;

  private _schedulerElem: HTMLElement;

  private _toggleMode: boolean;
  private _toggleButton: HTMLButtonElement;
  private _scheduleButton: HTMLButtonElement;
  private _parseButton: HTMLButtonElement;
  public onToggleTutors: Event = new Event("onToggleTutors");
  public onToggleRooms: Event = new Event("onToggleRooms");

  private _tutorToolsElem: HTMLDivElement;
  private _tutorTools: Map<string, HTMLElement>;
  private _roomToolsElem: HTMLDivElement;
  private _roomTools: Map<string, HTMLElement>;

  constructor() {
    if (Header.instance !== null) {
      console.error("Singleton Header class instantiated twice");
    }

    Header._instance = this;

    this._body = document.getElementById("body")!;

    this._headerElem = document.createElement("div");
    this._headerElem.style.backgroundColor = "white";
    this._headerElem.style.position = "fixed";
    this._headerElem.style.top = "0px";
    this._headerElem.style.left = "0px";
    this._headerElem.style.width = "100%";
    this._headerElem.style.height = "53px";
    this._headerElem.style.borderBottom = "2px black solid";

    this._body.append(this._headerElem);

    // scheduler name
    this._schedulerElem = document.createElement("p");
    this._headerElem.append(this._schedulerElem);

    // toggle button
    this._toggleButton = document.createElement("button");
    this._toggleButton.style.marginLeft = "10px";
    this._toggleButton.innerHTML = "Switch To Tutors";
    this._toggleMode = ROOMS_MODE;

    this._toggleButton.addEventListener("click", () => {
      Header.instance!.toggleModes();
    });
    this._headerElem.append(this._toggleButton);

    // create schedules button
    this._scheduleButton = document.createElement("button");
    this._scheduleButton.style.marginLeft = "10px";
    this._scheduleButton.innerHTML = "Create Schedules";
    this._scheduleButton.addEventListener("click", () => {
      Scheduler.scheduleAll();
    });
    this._headerElem.append(this._scheduleButton);

    // open parser button
    this._parseButton = document.createElement("button");
    this._parseButton.style.marginLeft = "10px";
    this._parseButton.innerHTML = "Open Table Parser";
    this._parseButton.addEventListener("click", () => {
      ParserMenu.instance!.openMenu();
    });
    this._headerElem.append(this._parseButton);

    // spacer
    const spacer = document.createElement("p");
    spacer.style.display = "inline-block";
    spacer.style.margin = "0px";
    spacer.style.marginLeft = "10px";
    spacer.style.marginRight = "10px";
    spacer.innerHTML = "<b> || </b>";
    this._headerElem.append(spacer);

    // tutor options
    this._tutorToolsElem = document.createElement("div");
    this._tutorToolsElem.style.display = "none";
    this._headerElem.append(this._tutorToolsElem);
    this._tutorTools = new Map();

    // room options
    this._roomToolsElem = document.createElement("div");
    this._roomToolsElem.style.display = "inline-block";
    this._headerElem.append(this._roomToolsElem);
    this._roomTools = new Map();

    // staff member name
    const schedulerName = document.createElement("b");
    schedulerName.style.display = "inline-block";
    schedulerName.style.margin = "0px";
    schedulerName.style.marginLeft = "10px";
    schedulerName.style.marginRight = "10px";
    schedulerName.style.float = "right";
    schedulerName.innerHTML = "Scheduler: " + SchedulerName.name;
    this._headerElem.append(schedulerName);
  }

  toggleModes() {
    if (this._toggleMode === ROOMS_MODE) {
      this._toggleButton.innerHTML = "Switch To Rooms";
      this._toggleMode = TUTORS_MODE;
      this._roomToolsElem.style.display = "none";
      this._tutorToolsElem.style.display = "inline-block";
      this._headerElem.dispatchEvent(this.onToggleTutors);

    } else if (this._toggleMode === TUTORS_MODE) {
      this._toggleButton.innerHTML = "Switch To Tutors";
      this._toggleMode = ROOMS_MODE;
      this._roomToolsElem.style.display = "inline-block";
      this._tutorToolsElem.style.display = "none";
      this._headerElem.dispatchEvent(this.onToggleRooms);
    }
  }

  setSchedulerName(name: string) {
    this._schedulerElem.innerHTML = name;
  }

  addEventListener(name: string, listener: () => undefined) {
    this._headerElem.addEventListener(name, listener);
  }

  addTutorTool(name: string, tool: HTMLElement) {
    tool.style.display = "inline-block";
    tool.style.marginTop = "0px";
    tool.style.marginRight = "15px";
    this._tutorToolsElem.append(tool);
    this._tutorTools.set(name, tool);
  }

  getTutorTool(name: string): HTMLElement | undefined {
    return this._tutorTools.get(name);
  }

  addRoomTool(name: string, tool: HTMLElement) {
    tool.style.display = "inline-block";
    tool.style.marginTop = "0px";
    tool.style.marginRight = "8px";
    this._roomToolsElem.append(tool);
    this._roomTools.set(name, tool);
  }

  getRoomTool(name: string): HTMLElement | undefined {
    return this._roomTools.get(name);
  }
}
