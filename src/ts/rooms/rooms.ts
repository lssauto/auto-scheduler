import { Room } from "./room";
import { AvailableRange } from "./room-schedule";
import { Days } from "../days";
import * as timeConvert from "../utils/time-convert";
import { Building } from "./building";
import { BuildingEditor } from "../elements/editors/building-editor";

export class Rooms implements Iterable<Room> {
  private static _instance: Rooms | null = null;
  public static get instance(): Rooms | null {
    return this._instance;
  }

  static readonly unknown = "Unknown Building";
  static readonly registrarRequest = "Request From Registrar";

  private static readonly _defaultRange: AvailableRange = {
    days: [Days.mon, Days.tue, Days.wed, Days.thu, Days.fri, Days.sun],
    start: timeConvert.strToInt("8:00 AM"),
    end: timeConvert.strToInt("10:00 PM")
  };
  public static get defaultRange(): AvailableRange {
    return JSON.parse(JSON.stringify(Rooms._defaultRange)) as AvailableRange;
  }
  private static readonly _requestRange: AvailableRange = {
    days: [Days.mon, Days.tue, Days.wed, Days.thu, Days.fri],
    start: timeConvert.strToInt("8:00 AM"),
    end: timeConvert.strToInt("5:00 PM")
  };
  public static get requestRange(): AvailableRange {
    return JSON.parse(JSON.stringify(Rooms._requestRange)) as AvailableRange;
  }

  private rooms: Map<string, Room>;
  private requestRooms: Map<string, Room>;
  private buildings: Map<string, Building>;

  div: HTMLDivElement | null;
  buildingDiv: HTMLDivElement | null;
  roomDiv: HTMLDivElement | null;
  requestDiv: HTMLDivElement | null;

  constructor() {
    if (Rooms._instance !== null && Rooms._instance !== this) {
      console.error("Singleton Rooms class instantiated twice");
    }
    Rooms._instance = this;

    this.rooms = new Map<string, Room>();
    this.requestRooms = new Map<string, Room>();
    this.buildings = new Map<string, Building>();

    this.div = null;
    this.buildingDiv = null;
    this.roomDiv = null;
    this.requestDiv = null;

    const request = new Building(Rooms.registrarRequest);
    request.setRange(Rooms.requestRange);
    this.addBuilding(request);

    this.addRoom(new Room(Rooms.registrarRequest));
  }

  getRoom(name: string): Room | undefined {
    if (this.rooms.has(name)) {
      return this.rooms.get(name);
    }
    if (this.requestRooms.has(name)) {
      return this.requestRooms.get(name);
    }
    return undefined;
  }

  addRoom(room: Room) {
    if (room.isRequestRoom) {
      this.requestRooms.set(room.name, room);
    } else {
      this.rooms.set(room.name, room);
    }
    const building = this.getBuildingName(room);
    room.setBuilding(building);
    if (building !== Rooms.unknown) {
      this.buildings.get(building)!.addRoom(room);
    }
    if (room.isRequestRoom) {
      this.requestDiv?.append(room.getDiv());
    } else {

      this.roomDiv?.append(room.getDiv());
    }
  }

  hasRoom(name: string): boolean {
    return this.rooms.has(name) || this.requestRooms.has(name);
  }

  removeRoom(room: Room | string) {
    const ref = room instanceof Room ? room : this.getRoom(room);
    if (ref) {
      this.rooms.delete(ref.name);
      this.getBuilding(ref.building)?.removeRoom(ref);
      ref.delete();
    }
  }

  forEachRoom(action: (room: Room) => void) {
    this.rooms.forEach(action);
  }

  [Symbol.iterator](): Iterator<Room> {
    const rooms = this.rooms.values();
    return {
      next: () => {
        const next = rooms.next();
        return {
          done: next.done ?? true,
          value: next.value as Room
        };
      }
    };
  }

  forEachRequestRoom(action: (room: Room) => void) {
    this.requestRooms.forEach(action);
  }

  forAllRooms(action: (room: Room) => void) {
    this.forEachRoom(action);
    this.forEachRequestRoom(action);
  }

  getBuildingName(room: Room | string): string {
    let buildingName = Rooms.unknown;
    const name = room instanceof Room ? room.name : room;
    this.forEachBuilding(building => {
      if (name.includes(building.name)) {
        buildingName = building.name;
      }
    });
    return buildingName;
  }

  addBuilding(building: Building) {
    this.buildings.set(building.name, building);
    this.forAllRooms(room => {
      if (room.name.includes(building.name) && !building.hasRoom(room)) {
        building.addRoom(room);
        room.setBuilding(building.name);
      }
    });

    if (!building.hasRooms() && building.name !== Rooms.registrarRequest) {
      building.addRequestRoom();
    }

    if (this.buildingDiv !== null) {
      this.buildingDiv.append(building.getDiv());
      const br = document.createElement("br");
      building.addDeletedListener(br, () => br.remove());
      this.buildingDiv.append(br);
    }
  }

  setBuilding(building: Building) {
    this.buildings.set(building.name, building);
  }

  removeBuilding(building: Building) {
    this.buildings.delete(building.name);
  }

  getBuilding(name: string): Building | undefined {
    return this.buildings.get(name);
  }

  hasBuilding(name: string): boolean {
    return this.buildings.has(name);
  }

  getBuildingNames(): string[] {
    const names: string[] = [];
    this.forEachBuilding(building => {
      names.push(building.name);
    });
    return names;
  }

  forEachBuilding(action: (building: Building) => void) {
    this.buildings.forEach(action);
  }

  getDiv(): HTMLDivElement {
    if (this.div === null) {
      this.div = this.buildDiv();
    }
    return this.div;
  }

  private buildDiv(): HTMLDivElement {
    const div = document.createElement("div");

    const buildingTitle = document.createElement("h3");
    buildingTitle.innerHTML = "Buildings:";
    div.append(buildingTitle);

    this.buildingDiv = document.createElement("div");
    this.buildingDiv.style.paddingBottom = "5px";
    this.buildingDiv.style.borderBottom = "1px solid black";

    const addButton = document.createElement("button");
    addButton.style.backgroundColor = "#f8f8f8";
    addButton.style.border = "1px solid #565656";
    addButton.style.borderRadius = "2px";
    addButton.addEventListener("mouseover", () => {
      addButton.style.backgroundColor = "#e8e8e8";
    });
    addButton.addEventListener("mouseout", () => {
      addButton.style.backgroundColor = "#f8f8f8";
    });
    addButton.innerHTML = "Add Building";
    addButton.addEventListener("click", () => {
      BuildingEditor.instance!.createNewBuilding();
    });
    this.buildingDiv.append(addButton);

    this.buildingDiv.append(document.createElement("br"));

    this.forEachBuilding((building) => {
      this.buildingDiv!.append(building.getDiv());
      const br = document.createElement("br");
      building.addDeletedListener(br, () => br.remove());
      this.buildingDiv!.append(br);
    });
    div.append(this.buildingDiv);

    const roomsTitle = document.createElement("h2");
    roomsTitle.innerHTML = "Room Schedules:";
    div.append(roomsTitle);

    this.roomDiv = document.createElement("div");
    this.forEachRoom(room => {
      this.roomDiv!.append(room.getDiv());
    });
    div.append(this.roomDiv);

    const requestTitle = document.createElement("h2");
    requestTitle.innerHTML = "Request Room Schedules:";
    div.append(requestTitle);

    this.requestDiv = document.createElement("div");
    this.forEachRequestRoom(room => {
      this.requestDiv!.append(room.getDiv());
    });
    div.append(this.requestDiv);

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
