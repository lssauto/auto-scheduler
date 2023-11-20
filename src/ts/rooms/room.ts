import { RoomSchedule, AvailableRange } from "./room-schedule";
import { Position, Positions } from "../positions";
import { Rooms } from "./rooms";

export class Room {
  readonly name: string;
  readonly type: Position;
  readonly schedule: RoomSchedule;

  building: string;

  div: HTMLDivElement | null;

  constructor(name: string) {
    this.name = name;
    this.type = Positions.match(name);
    this.building = Rooms.unknown;
    
    this.schedule = new RoomSchedule(this);

    this.div = null;
  }

  setBuilding(buildingName: string) {
    this.building = buildingName;
  }

  setRange(range: AvailableRange) {
    this.schedule.setRange(range);
  }

  getDiv(): HTMLDivElement {
    if (this.div === null) {
      this.div = this.buildDiv();
    }
    return this.div;
  }

  private buildDiv(): HTMLDivElement {
    const div = document.createElement("div");
    const title = document.createElement("p");
    title.innerHTML = `<b>Room: ${this.name} ; Building: ${this.building} ; type: ${this.type.title}</b>`;
    div.append(title);
    div.append(this.schedule.getDiv());
    return div;
  }
}
