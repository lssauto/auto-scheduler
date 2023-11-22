import { Tutors } from "../../tutors/tutors";
import { Rooms } from "../../rooms/rooms";
import { Header } from "../header/header";

const TUTOR_MODE = true;
const ROOM_MODE = false;

export class Content {
  private static _instance: Content | null = null;
  public static get instance(): Content | null {
    return Content._instance;
  }

  private _body?: HTMLElement;

  tutorsDiv?: HTMLDivElement;
  roomsDiv?: HTMLDivElement;

  activeDiv: boolean = ROOM_MODE;

  div?: HTMLDivElement;

  constructor() {
    if (Content._instance !== null && Content._instance !== this) {
      console.error("Singleton Content class instantiated twice");
      return;
    }
    Content._instance = this;

    this._body = document.getElementById("body")!;

    this.div = document.createElement("div");

    this.tutorsDiv = Tutors.instance!.getDiv();
    this.div.append(this.tutorsDiv);

    this.roomsDiv = Rooms.instance!.getDiv();
    this.div.append(this.roomsDiv);

    this.activeDiv = ROOM_MODE;

    Header.instance!.addEventListener("onToggleRooms", () => { 
      Content.instance!.toggleDivs(); 
    });
    Header.instance!.addEventListener("onToggleTutors", () => { 
      Content.instance!.toggleDivs();
    });

    this._body.append(this.div);
  }

  toggleDivs() {
    if (this.activeDiv === ROOM_MODE) {
      this.activeDiv = TUTOR_MODE;
      Tutors.instance!.showDiv();
      Rooms.instance!.hideDiv();
    } else {
      this.activeDiv = ROOM_MODE;
      Tutors.instance!.hideDiv();
      Rooms.instance!.showDiv();
    }
  }
}
