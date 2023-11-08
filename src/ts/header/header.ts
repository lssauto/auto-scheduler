const TUTORS_MODE = true;
const ROOMS_MODE = false;

export class Header {
  private static _instance: Header | null = null;

  public static get instance(): Header | null {
    return Header._instance;
  }

  private _body?: HTMLElement;
  private _headerElem?: HTMLDivElement;

  private _schedulerElem?: HTMLElement;

  private _toggleMode?: boolean;
  private _toggleButton?: HTMLButtonElement;
  private _scheduleButton?: HTMLButtonElement;
  public onToggleTutors: Event = new Event("onToggleTutors");
  public onToggleRooms: Event = new Event("onToggleRooms");

  private _tutorToolsElem?: HTMLDivElement;
  private _tutorTools?: Map<string, HTMLElement>;
  private _roomToolsElem?: HTMLDivElement;
  private _roomTools?: Map<string, HTMLElement>;

  constructor() {
    if (Header.instance !== null) {
      console.error("Singleton Header class instantiated twice");
      return;
    }

    Header._instance = this;

    this._body = document.getElementById("body")!;

    this._headerElem = document.createElement("div");
    this._headerElem.style.backgroundColor = "white";
    this._headerElem.style.position = "fixed";
    this._headerElem.style.top = "0px";
    this._headerElem.style.width = "100%";

    this._body.append(this._headerElem);

    // scheduler name
    this._schedulerElem = document.createElement("p");
    this._headerElem.append(this._schedulerElem);

    // toggle button
    this._toggleButton = document.createElement("button");
    this._toggleButton.innerHTML = "Switch To Tutors";
    this._toggleMode = ROOMS_MODE;

    this._toggleButton.addEventListener("click", () => {
      Header.instance!.toggleModes();
    });
    this._headerElem.append(this._toggleButton);

    // create schedules button
    this._scheduleButton = document.createElement("button");
    this._scheduleButton.innerHTML = "Create Schedules";
    this._scheduleButton.addEventListener("click", () => {
      // TODO: call the scheduler
      console.log("this will create all of the schedules");
    });
    this._headerElem.append(this._scheduleButton);

    // tutor options
    this._tutorToolsElem = document.createElement("div");
    this._tutorToolsElem.style.display = "none";
    this._headerElem.append(this._tutorToolsElem);
    this._tutorTools = new Map();

    // room options
    this._roomToolsElem = document.createElement("div");
    this._roomToolsElem.style.display = "block";
    this._headerElem.append(this._roomToolsElem);
    this._roomTools = new Map();
  }

  toggleModes() {
    if (this._toggleMode === ROOMS_MODE) {
      this._toggleButton!.innerHTML = "Switch To Rooms";
      this._toggleMode = TUTORS_MODE;
      this._roomToolsElem!.style.display = "none";
      this._tutorToolsElem!.style.display = "block";
      this._headerElem!.dispatchEvent(this.onToggleTutors);

    } else if (this._toggleMode === TUTORS_MODE) {
      this._toggleButton!.innerHTML = "Switch To Tutors";
      this._toggleMode = ROOMS_MODE;
      this._roomToolsElem!.style.display = "block";
      this._tutorToolsElem!.style.display = "none";
      this._headerElem!.dispatchEvent(this.onToggleRooms);
    }
  }

  setSchedulerName(name: string) {
    this._schedulerElem!.innerHTML = name;
  }

  addEventListener(name: string, listener: () => undefined) {
    this._headerElem!.addEventListener(name, listener);
  }

  addTutorTool(name: string, tool: HTMLElement) {
    this._tutorToolsElem!.append(tool);
    this._tutorTools!.set(name, tool);
  }

  getTutorTool(name: string): HTMLElement | undefined {
    return this._tutorTools!.get(name);
  }

  addRoomTool(name: string, tool: HTMLElement) {
    this._roomToolsElem!.append(tool);
    this._roomTools!.set(name, tool);
  }

  getRoomTool(name: string): HTMLElement | undefined {
    return this._roomTools!.get(name);
  }
}