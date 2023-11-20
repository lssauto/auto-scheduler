import { Tutor } from "./tutor";
import { Position, Positions } from "../positions";

export class Tutors {
  private static _instance: Tutors | null = null;
  get instance(): Tutors | null {
    return Tutors._instance;
  }

  private tutors?: Map<string, Tutor>;

  private positions?: Map<Position, Tutor[]>;

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
  }

  addTutor(tutor: Tutor) {
    this.tutors!.set(tutor.email, tutor);
    const positionsMap = this.positions!;
    tutor.forEachCourse(course => {
      positionsMap.get(course.position)!.push(tutor);
    });
  }

  getTutor(email: string): Tutor | undefined {
    return this.tutors!.get(email);
  }

  removeTutor(tutor: Tutor | string): Tutor {
    let removedTutor: Tutor;
    if (tutor instanceof Tutor) {
      this.tutors!.delete(tutor.email);
      const positionsMap = this.positions!;
      tutor.forEachCourse(course => {
        const positionList = positionsMap.get(course.position)!;
        positionList.splice(positionList.indexOf(tutor), 1);
      });
      return tutor;
    } else {
      removedTutor = this.tutors!.get(tutor)!;
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
}
