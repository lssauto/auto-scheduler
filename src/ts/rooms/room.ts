import { RoomSchedule } from "./room-schedule";
import { Position, Positions } from "../positions";
import { Rooms } from "./rooms";
import { Building } from "./building";
import { VariableElement } from "../events/var-elem";
import { Notify, NotifyEvent } from "../events/notify";
import { ErrorCodes } from "../schedule/schedule";
import { TimeBlock } from "../schedule/time-block";

/**
 * Class used represent rooms that can have sessions scheduled in.
 */
export class Room {

  // # Matchers ==========================

  /**
   * Use to with `name.includes(Room.request)` to check if a room is a 
   * registrar request room.
   */
  static readonly request = "request";

  // # const Room Names ==================

  /**
   * Front half of a room's name used to store any registrar requests for buildings 
   * LSS needs to request space for.
   */
  static readonly requestRoom = "Registrar Requests For "; // concat building name to end

  // Assigned to time block roomName property to represent special cases

  /**
   * Assign to a time block's room name with `time.setRoom(Room.selfScheduled)` to 
   * show that the session is being scheduled by the tutor.
   */
  static readonly selfScheduled = "Scheduled By Tutor";
  /**
   * Assign to a time block's room name with `time.setRoom(Room.discord)` to 
   * show that the discord tutoring time has been assigned. Since these are async, 
   * they don't actually get a room assignment.
   */
  static readonly discord = "Discord Time";

  // # ===================================

  readonly name: string;           // room title, used to uniquely identify it
  readonly type: Position;         // the tutor position this room is meant for, usually either LGT or SGT
  readonly schedule: RoomSchedule; // the room's schedule, stores its time blocks
  readonly isRequestRoom: boolean; // used to determine if the room can have more times assigned to it than normal

  building: string; // uses string as a key to get the building from Rooms

  // HTML elements
  div: HTMLDivElement | null;
  divContent: VariableElement | null;

  // events
  onEdited: NotifyEvent = new NotifyEvent("onEdited");
  onDeleted: NotifyEvent = new NotifyEvent("onDeleted");

  constructor(name: string) {
    this.name = name;
    // start the building off as unknown, will be set when this is added to the Rooms list
    this.building = Rooms.unknown;
    this.isRequestRoom = name.toLowerCase().includes(Room.request);
    // request rooms don't have a type
    this.type = this.isRequestRoom ? Positions.na : Positions.match(name);
    
    this.schedule = new RoomSchedule(this);

    this.div = null;
    this.divContent = null;
  }

  setBuilding(buildingName: string) {
    // remove from previous building event listeners
    if (this.getBuilding()) {
      this.getBuilding()!.removeEditedListener(this);
      this.getBuilding()!.removeDeletedListener(this);
    }

    this.building = buildingName;
    
    // add to new building's event listeners
    if (this.getBuilding()) {
      // if the building no longer matches the room's name, remove its assignment
      this.getBuilding()!.addEditedListener(this, (event) => {
        const building = event as Building;
        if (!this.name.includes(building.name)) {
          this.setBuilding(Rooms.unknown);
        }
      });
      this.getBuilding()!.addDeletedListener(this, () => {
        this.setBuilding(Rooms.unknown);
      });
    }
    this.onEditedDispatch();
  }

  // wrappers around schedule methods

  addTime(time: TimeBlock): ErrorCodes {
    return this.schedule.addTime(time);
  }

  pushTime(time: TimeBlock) {
    this.schedule.pushTime(time);
  }

  getBuilding(): Building | null {
    if (this.building === Rooms.unknown) {
      return null;
    }
    return Rooms.instance!.getBuilding(this.building) ?? null;
  }

  getDiv(): HTMLDivElement {
    if (this.div === null) {
      this.div = this.buildDiv();
    }
    return this.div;
  }

  private buildDiv(): HTMLDivElement {
    const div = document.createElement("div");
    div.style.borderTop = "1px solid black";
    div.style.borderBottom = "1px solid black";
    const title = document.createElement("p");
    title.style.marginTop = "5px";
    title.style.fontSize = "1.2em";
    this.divContent = new VariableElement(title, this.onEdited, () => {
      title.innerHTML = `<b>Room: ${this.name} ; Bldg: ${this.building} ; type: ${this.type.title}</b>`;
    });
    div.append(title);
    div.append(this.schedule.getDiv());
    return div;
  }

  hideDiv() {
    if (this.div) {
      this.div.style.display = "none";
    }
  }

  showDiv() {
    if (this.div) {
      this.div.style.display = "block";
    }
  }

  // events

  addEditedListener(subscriber: object, action: Notify) {
    this.onEdited.addListener(subscriber, action);
  }

  removeEditedListener(subscriber: object) {
    this.onEdited.removeListener(subscriber);
  }

  onEditedDispatch() {
    this.onEdited.dispatch(this);
  }

  addDeletedListener(subscriber: object, action: Notify) {
    this.onDeleted.addListener(subscriber, action);
  }

  removeDeletedListener(subscriber: object) {
    this.onDeleted.removeListener(subscriber);
  }

  onDeletedDispatch() {
    this.onDeleted.dispatch(this);
  }

  delete() {
    this.div?.remove();
    this.onDeletedDispatch();
  }
}
