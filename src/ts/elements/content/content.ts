import { Tutors } from "../../tutors/tutors";
import { Rooms } from "../../rooms/rooms";
import { Header } from "../header/header";
import { Tutor } from "../../tutors/tutor";
import { Room } from "../../rooms/room";

const TUTOR_MODE = true;
const ROOM_MODE = false;

/**
 * Interface for interacting with the div that contains the tutor and room divs.
 */
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

  /**
   * ! TUTORS AND ROOMS MUST BE INSTANTIATED BEFORE CALLING THIS CONSTRUCTOR!
   */
  constructor() {
    if (Content._instance !== null && Content._instance !== this) {
      console.error("Singleton Content class instantiated twice");
      return;
    }
    Content._instance = this;

    this._body = document.getElementById("body")!;

    // styling
    this.div = document.createElement("div");
    this.div.style.marginTop = "55px";
    this.div.style.width = "68%";
    this.div.style.height = "92%";
    this.div.style.overflowY = "auto";
    this.div.style.paddingLeft = "10px";
    this.div.style.paddingBottom = "15px";

    // add tutors div
    this.tutorsDiv = Tutors.instance!.getDiv();
    this.div.append(this.tutorsDiv);

    // add rooms div
    this.roomsDiv = Rooms.instance!.getDiv();
    this.div.append(this.roomsDiv);

    // toggle starts on rooms div
    this.activeDiv = ROOM_MODE;
    Tutors.instance!.hideDiv();
    Rooms.instance!.showDiv();

    // toggle divs when the header "Rooms" or "Tutors" button is pressed
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

  /**
   * Finds the given target's div, and scrolls to it.
   */
  scrollTo(target: Tutor | Room) {
    if (target instanceof Tutor) {
      if (this.activeDiv === ROOM_MODE) {
        this.toggleDivs();
      }
      Tutors.instance!.filter(Tutors.instance!.findFilter("All Tutors")!);
      target.getDiv().scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      if (this.activeDiv === TUTOR_MODE) {
        this.toggleDivs();
      }
      target.getDiv().scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  
  scrollToTop() {
    if (this.div) {
      this.div.scrollTop = 0;
    }
  }
}
