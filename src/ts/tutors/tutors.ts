import { Tutor } from "./tutor";
import { Position, Positions } from "../positions";

export class Tutors {
  private static _instance: Tutors | null = null;
  public static get instance(): Tutors | null {
    return Tutors._instance;
  }

  private tutors?: Map<string, Tutor>;
  private positions?: Map<Position, Tutor[]>;

  div?: HTMLDivElement | null;

  constructor() {
    if (Tutors._instance !== null && Tutors._instance !== this) {
      console.error("Singleton Tutors class instantiated twice");
      return;
    }
    Tutors._instance = this;

    this.tutors = new Map<string, Tutor>();

    this.positions = new Map<Position, Tutor[]>();
    Positions.forEach((pos) => {
      this.positions!.set(pos, []);
    });

    this.div = null;
  }

  addTutor(tutor: Tutor) {
    this.tutors!.set(tutor.email, tutor);
    const positionsMap = this.positions!;
    tutor.forEachCourse(course => {
      positionsMap.get(course.position)!.push(tutor);
    });
    if (this.div !== null) {
      this.div!.append(tutor.getDiv());
    }
  }

  getTutor(email: string): Tutor | undefined {
    return this.tutors!.get(email);
  }

  hasTutor(email: string): boolean {
    return this.tutors!.has(email);
  }

  removeTutor(tutor: Tutor | string): Tutor {
    if (tutor instanceof Tutor) {
      this.tutors!.delete(tutor.email);
      const positionsMap = this.positions!;
      tutor.forEachCourse(course => {
        const positionList = positionsMap.get(course.position)!;
        positionList.splice(positionList.indexOf(tutor), 1);
      });
      return tutor;
    } else {
      const removedTutor = this.tutors!.get(tutor)!;
      this.tutors!.delete(tutor);
      const positionsMap = this.positions!;
      removedTutor.forEachCourse(course => {
        const positionList = positionsMap.get(course.position)!;
        positionList.splice(positionList.indexOf(removedTutor), 1);
      });
      return removedTutor;
    }
  }

  forEachTutor(action: (tutor: Tutor) => void) {
    this.tutors!.forEach(action);
  }

  forEachPositionList(position: Position, action: (tutor: Tutor) => void) {
    this.positions!.get(position)!.forEach(action);
  }

  getDiv(): HTMLDivElement {
    if (this.div === null) {
      this.div = this.buildDiv();
    }
    return this.div!;
  }

  private buildDiv(): HTMLDivElement {
    const div = document.createElement("div");
    this.forEachTutor(tutor => {
      div.append(tutor.getDiv());
    });
    return div;
  }

  hideDiv() {
    this.div!.style.display = "none";
  }

  showDiv() {
    this.div!.style.display = "block";
  }

  match(target: string): Tutor | null {
    if (this.getTutor(target) !== undefined) {
      return this.getTutor(target)!;
    }
    if (this.getTutor(target + "ucsc.edu") !== undefined) {
      return this.getTutor(target + "ucsc.edu")!;
    }

    const key = target.toLowerCase();
    let result: Tutor | null = null;
    this.forEachTutor((tutor) => {
      if (tutor.email.toLowerCase().includes(key)) {
        result = tutor;
      } else if (tutor.name.toLowerCase().includes(key)) {
        result = tutor;
      }
    });

    return result;
  }
}
