import { Notify, NotifyEvent } from "../events/notify";
import { VariableElement } from "../events/var-elem";
import { Room } from "./room";
import { AvailableRange } from "./room-schedule";
import { Rooms } from "./rooms";
import * as timeConvert from "../utils/time-convert";
import { BuildingEditor } from "../elements/editors/building-editor";
import { Days } from "../days";
import { TimeBlock } from "../schedule/time-block";

/**
 * Organizes rooms by building to assign when those rooms are open.
 */
export class Building {
  name: string;
  range: AvailableRange; // the days and times rooms in the this building are open
  rooms: Room[];
  requestRoom: Room | null; // if the building requires registrar requests to be scheduled in

  // HTML elements
  div: HTMLDivElement | null;
  divContent: VariableElement | null;

  // events
  onEdited: NotifyEvent = new NotifyEvent("onEdited");
  onDeleted: NotifyEvent = new NotifyEvent("onDeleted");

  constructor(name: string) {
    this.name = name;
    this.range = Rooms.defaultRange;
    this.rooms = [];
    this.requestRoom = null;

    this.div = null;
    this.divContent = null;
  }

  setRange(range: AvailableRange): Building {
    this.range = range;
    return this;
  }

  /**
   * Returns true if the given time is within this building's open range.
   */
  isInRange(time: TimeBlock | {day: Days, start?: number, end?: number}): boolean {
    if (!this.range.days.includes(time.day)) {
      return false;
    }
    if (time.start === undefined || time.end === undefined) {
      return true;
    }

    if (time.start < this.range.start || this.range.end < time.end) {
      return false;
    }
    return true;
  }

  /**
   * Updates this buildings name. This will reassign rooms.
   */
  setName(name: string): Building {
    const prevName = this.name;
    // remove old room name mapping
    Rooms.instance!.removeBuilding(this);
    // update name
    this.name = name;
    // assign new room name mapping
    Rooms.instance!.setBuilding(this);

    // replace rooms list if name was changed
    if (prevName !== name) {
      this.rooms = [];
      Rooms.instance!.forEachRoom((room) => {
        if (room.name.includes(this.name)) {
          this.addRoom(room);
          room.setBuilding(this.name);
        }
      });
    }

    return this;
  }

  addRoom(room: Room) {
    this.rooms.push(room);

    // if the room previously had a registrar request room, remove it
    if (this.requestRoom) {
      this.removeRequestRoom();
    }
  }

  removeRoom(room: Room) {
    this.rooms.splice(this.rooms.indexOf(room), 1);
  }

  hasRoom(room: Room): boolean {
    return this.rooms.includes(room);
  }

  /**
   * Returns true if this building has rooms associated with it, 
   * excluding a registrar request room.
   */
  hasRooms(): boolean {
    return this.rooms.length > 0;
  }

  addRequestRoom() {
    this.requestRoom = new Room(Room.requestRoom + this.name);
    Rooms.instance!.addRoom(this.requestRoom);
  }

  removeRequestRoom() {
    if (this.requestRoom) {
      Rooms.instance!.removeRoom(this.requestRoom);
      this.requestRoom = null;
    }
  }

  forEachRoom(action: (room: Room) => void) {
    this.rooms.forEach(action);
  }

  getDiv(): HTMLDivElement {
    if (this.div === null) {
      this.div = this.buildDiv();
    }
    return this.div;
  }

  removeDiv() {
    this.div?.remove();
    this.div = null;
    this.divContent?.destroy();
    this.divContent = null;
  }

  buildDiv(): HTMLDivElement {
    // styling
    const div = document.createElement("div");
    div.style.display = "inline-block";
    div.style.backgroundColor = "#f8f8f8";
    div.style.padding = "3px";
    div.style.borderStyle = "solid";
    div.style.borderWidth = "1px";
    div.style.margin = "2px";
    div.style.borderRadius = "5px";

    const p = document.createElement("p");
    p.style.margin = "3px";
    p.style.display = "inline-block";

    // content displays name, and available range
    this.divContent = new VariableElement(p, this.onEdited, () => {
      let str = "";
      this.range.days.forEach(day => {
        str += day + " ";
      });
      str += ` ${timeConvert.intToStr(this.range.start)} - ${timeConvert.intToStr(this.range.end)}`;
      p.innerHTML = `<b>${this.name}</b> | ${str} | `;
    });
    div.append(p);

    // edit button
    const editButton = document.createElement("button");
    editButton.style.display = "inline-block";
    editButton.style.marginLeft = "3px";
    editButton.innerHTML = "Edit";
    editButton.addEventListener("click", () => {
      BuildingEditor.instance!.editBuilding(this);
    });
    div.append(editButton);

    // delete button
    const removeButton = document.createElement("button");
    removeButton.style.display = "inline-block";
    removeButton.style.marginLeft = "3px";
    removeButton.innerHTML = "Delete";
    removeButton.addEventListener("click", () => {
      this.removeDiv();
      Rooms.instance!.removeBuilding(this);
      this.onDeletedDispatch();
    });
    div.append(removeButton);

    return div;
  }

  update(name: string, range: AvailableRange) {
    this.setName(name)
      .setRange(range);
    this.onEditedDispatch();
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
}
