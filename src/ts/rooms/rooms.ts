import { Room } from "./room";
import { AvailableRange } from "./room-schedule";
import { Days } from "../enums";
import * as timeConvert from "../utils/time-convert";

export interface Building {
  readonly name: string;
  readonly range: AvailableRange;
  rooms: Room[];
}

export class Rooms {
  private static _instance: Rooms | null = null;
  public static get instance(): Rooms | null {
    return this._instance;
  }

  static readonly unknown = "Unknown Building";

  static readonly defaultRange: AvailableRange = {
    days: [Days.mon, Days.tue, Days.wed, Days.thu, Days.fri, Days.sun],
    start: timeConvert.strToInt("8:00 AM"),
    end: timeConvert.strToInt("10:00 PM")
  };

  private rooms?: Map<string, Room>;
  private buildings?: Map<string, Building>;

  div?: HTMLDivElement | null;

  constructor() {
    if (Rooms._instance !== null && Rooms._instance !== this) {
      console.error("Singleton Rooms class instantiated twice");
      return;
    }
    Rooms._instance = this;

    this.rooms = new Map<string, Room>();
    this.buildings = new Map<string, Building>();

    this.div = null;
  }

  getRoom(name: string): Room | undefined {
    return this.rooms!.get(name);
  }

  addRoom(room: Room) {
    this.rooms!.set(room.name, room);
    const building = this.getBuildingName(room);
    room.setBuilding(building);
    if (building !== Rooms.unknown) {
      room.setRange(this.buildings!.get(building)!.range);
      this.buildings!.get(building)!.rooms.push(room);
    }
    if (this.div !== null) {
      this.div!.append(room.getDiv());
    }
  }

  hasRoom(name: string): boolean {
    return this.rooms!.has(name);
  }

  removeRoom(room: Room | string): Room {
    if (room instanceof Room) {
      this.rooms!.delete(room.name);
      const building = this.buildings!.get(room.building)!;
      building.rooms.splice(building.rooms.indexOf(room), 1);
      return room;
    } else {
      const removedRoom = this.rooms!.get(room)!;
      this.rooms!.delete(removedRoom.name);
      const building = this.buildings!.get(removedRoom.building)!;
      building.rooms.splice(building.rooms.indexOf(removedRoom), 1);
      return removedRoom;
    }
  }

  forEachRoom(action: (room: Room) => void) {
    this.rooms!.forEach(action);
  }

  getBuildingName(room: Room): string {
    let buildingName = Rooms.unknown;
    this.forEachBuilding(building => {
      if (room.name.includes(building.name)) {
        buildingName = building.name;
      }
    });
    return buildingName;
  }

  addBuilding(building: Building) {
    this.buildings!.set(building.name, building);
    this.forEachRoom(room => {
      if (this.getBuildingName(room) === building.name) {
        building.rooms.push(room);
        room.setBuilding(building.name);
      }
    });
  }

  getBuilding(name: string): Building | undefined {
    return this.buildings!.get(name);
  }

  forEachBuilding(action: (building: Building) => void) {
    this.buildings!.forEach(action);
  }

  getDiv(): HTMLDivElement {
    if (this.div === null) {
      this.div = this.buildDiv();
    }
    return this.div!;
  }

  private buildDiv(): HTMLDivElement {
    const div = document.createElement("div");
    this.forEachRoom(room => {
      div.append(room.getDiv());
    });
    return div;
  }

  hideDiv() {
    this.div!.style.display = "none";
  }

  showDiv() {
    this.div!.style.display = "block";
  }

  match(roomName: string): Room | null {
    if (this.getRoom(roomName) !== undefined) {
      return this.getRoom(roomName)!;
    }

    const key = roomName.toLowerCase();
    let result: Room | null = null;
    this.forEachRoom((room) => {
      if (room.name.toLowerCase().includes(key)) {
        result = room;
      }
    });

    return result;
  }
}
