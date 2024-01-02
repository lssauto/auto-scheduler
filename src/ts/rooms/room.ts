import { RoomSchedule } from "./room-schedule";
import { Position, Positions } from "../positions";
import { Rooms } from "./rooms";
import { Building } from "./building";
import { VariableElement } from "../events/var-elem";
import { Notify, NotifyEvent } from "../events/notify";
import { ErrorCodes } from "../schedule/schedule";
import { TimeBlock } from "../schedule/time-block";

export class Room {

  // # Matchers ==========================

  static readonly request = "request";

  // # const Room Names ==================

  static readonly requestRoom = "Registrar Requests For "; // concat building name to end
  static readonly selfScheduled = "Scheduled By Tutor";
  static readonly discord = "Discord Time";

  // # ===================================

  readonly name: string;
  readonly type: Position;
  readonly schedule: RoomSchedule;
  readonly isRequestRoom: boolean;

  building: string;

  div: HTMLDivElement | null;
  divContent: VariableElement | null;

  onEdited: NotifyEvent = new NotifyEvent("onEdited");
  onDeleted: NotifyEvent = new NotifyEvent("onDeleted");

  constructor(name: string) {
    this.name = name;
    this.building = Rooms.unknown;
    this.isRequestRoom = name.toLowerCase().includes(Room.request);
    this.type = this.isRequestRoom ? Positions.na : Positions.match(name);
    
    this.schedule = new RoomSchedule(this);

    this.div = null;
    this.divContent = null;
  }

  setBuilding(buildingName: string) {
    if (this.getBuilding()) {
      this.getBuilding()!.removeEditedListener(this);
      this.getBuilding()!.removeDeletedListener(this);
    }

    this.building = buildingName;

    if (this.getBuilding()) {
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
