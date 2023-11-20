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
  public static getInstance(): Rooms | null {
    return this._instance;
  }

  static readonly unknown = "Unknown Building";

  static readonly defaultRange: AvailableRange = {
    days: [Days.mon, Days.tue, Days.wed, Days.thu, Days.fri, Days.sun],
    start: timeConvert.strToInt("8:00 AM"),
    end: timeConvert.strToInt("10:00 PM")
  };

  rooms?: Map<string, Room>;
  buildings?: Map<string, Building>;

  constructor() {
    if (Rooms._instance !== null && Rooms._instance !== this) {
      console.error("Singleton Rooms class instantiated twice");
      return;
    }
    Rooms._instance = this;

    this.rooms = new Map<string, Room>();
    this.buildings = new Map<string, Building>();
  }

  getRoom(name: string): Room | undefined {
    return this.rooms!.get(name);
  }

  addRoom(room: Room) {
    const building = this.getBuildingName(room);
    this.rooms!.set(room.name, room);
    room.setBuilding(building);
    room.setRange(this.buildings!.get(building)!.range);
    this.buildings!.get(building)!.rooms.push(room);
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

  forEachBuilding(action: (building: Building) => void) {
    this.buildings!.forEach(action);
  }
}
