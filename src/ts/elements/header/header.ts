import { ParserMenu } from "../../parsers/parser-menu";
import { Scheduler } from "../../scheduler/scheduler";
import { SessionTimes } from "../../utils/session-times";
import { Messages } from "../messages/messages";
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

  private _quarterElem: HTMLButtonElement;
  private _quarterToggleMode: SessionTimes;

  /**
   * Gets the current session times mode scheduling is currently in.
   */
  static get sessionTimesMode(): SessionTimes {
    return this.instance ? this.instance._quarterToggleMode : SessionTimes.schoolYear;
  }

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
    this._headerElem.style.height = "33px";
    this._headerElem.style.paddingTop = "20px";
    this._headerElem.style.borderBottom = "2px black solid";

    this._body.append(this._headerElem);

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
    schedulerName.style.marginLeft = "5px";
    schedulerName.style.marginRight = "10px";
    schedulerName.style.float = "right";
    schedulerName.innerHTML = "Scheduler: " + SchedulerName.name;
    this._headerElem.append(schedulerName);

    // session validation mode toggle
    this._quarterToggleMode = SessionTimes.schoolYear;
    this._quarterElem = document.createElement("button");
    this._quarterElem.style.marginLeft = "5px";
    this._quarterElem.style.marginRight = "5px";
    this._quarterElem.style.float = "right";
    this._quarterElem.innerHTML = "Using School Year";
    this._quarterElem.addEventListener("click", () => {
      this.toggleSessionValidationMode();
    });
    this._headerElem.append(this._quarterElem);
  }

  toggleSessionValidationMode() {
    if (this._quarterToggleMode === SessionTimes.schoolYear) {
      this._quarterElem.innerHTML = "Using Summer";
      this._quarterToggleMode = SessionTimes.summer;
      Messages.output(Messages.info, "Switched to Summer session time validation (8am to 10pm, every 15min).");
    } else if (this._quarterToggleMode === SessionTimes.summer) {
      this._quarterElem.innerHTML = "Using School Year";
      this._quarterToggleMode = SessionTimes.schoolYear;
      Messages.output(Messages.info, "Switched to regular school year session time validation (following provided UCSC time blocks)");
    }
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
