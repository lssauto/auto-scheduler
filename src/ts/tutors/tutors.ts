import { Tutor } from "./tutor";
import { Position, Positions } from "../positions";
import { Notify, NotifyEvent } from "../events/notify";

export interface FilterOption {
  readonly title: string;
  readonly include: (tutor: Tutor) => boolean;
}

export class Tutors {
  private static _instance: Tutors | null = null;
  public static get instance(): Tutors | null {
    return Tutors._instance;
  }

  private tutors: Map<string, Tutor>;
  private positions: Map<Position, Tutor[]>;

  div: HTMLDivElement | null;

  private _filterOptions: FilterOption[] = [];
  private _curFilter: FilterOption;
  public get curFilter(): FilterOption {
    return this._curFilter;
  }

  private onTutorUpdate: NotifyEvent = new NotifyEvent("onTutorUpdate");
  private onFilterUpdate: NotifyEvent = new NotifyEvent("onFilterUpdate");

  constructor() {
    if (Tutors._instance !== null && Tutors._instance !== this) {
      console.error("Singleton Tutors class instantiated twice");
    }
    Tutors._instance = this;

    this.tutors = new Map<string, Tutor>();

    this.addFilter({
      title: "All Tutors",
      include: () => {
        return true;
      }
    });

    this.positions = new Map<Position, Tutor[]>();
    Positions.forEach((pos) => {
      this.positions.set(pos, []);
      this.addFilter({
        title: pos.title,
        include: (tutor) => {
          let hasPosition = false;
          tutor.forEachCourse((course) => {
            if (course.position === pos) {
              hasPosition = true;
            }
          });
          return hasPosition;
        }
      });
    });

    this._curFilter = this.findFilter("All Tutors")!;

    this.addTutorListener(this, () => {
      this.filter(this._curFilter);
    });

    this.div = null;
  }

  addTutor(tutor: Tutor) {
    this.tutors.set(tutor.email, tutor);
    const positionsMap = this.positions;
    tutor.forEachCourse(course => {
      positionsMap.get(course.position)!.push(tutor);
    });
    if (this.div !== null) {
      this.div.append(tutor.getDiv());
    }
    this.onTutorDispatch();
  }

  getTutor(email: string): Tutor | undefined {
    return this.tutors.get(email);
  }

  hasTutor(email: string): boolean {
    return this.tutors.has(email);
  }

  removeTutor(tutor: Tutor | string): Tutor {
    if (tutor instanceof Tutor) {
      this.tutors.delete(tutor.email);
      const positionsMap = this.positions;
      tutor.forEachCourse(course => {
        const positionList = positionsMap.get(course.position)!;
        positionList.splice(positionList.indexOf(tutor), 1);
      });
      this.onTutorDispatch();
      return tutor;
    } else {
      const removedTutor = this.tutors.get(tutor)!;
      this.tutors.delete(tutor);
      const positionsMap = this.positions;
      removedTutor.forEachCourse(course => {
        const positionList = positionsMap.get(course.position)!;
        positionList.splice(positionList.indexOf(removedTutor), 1);
      });
      this.onTutorDispatch();
      return removedTutor;
    }
  }

  forEachTutor(action: (tutor: Tutor) => void) {
    this.tutors.forEach(action);
  }

  forEachPositionList(position: Position, action: (tutor: Tutor) => void) {
    this.positions.get(position)!.forEach(action);
  }

  getDiv(): HTMLDivElement {
    if (this.div === null) {
      this.div = this.buildDiv();
    }
    return this.div;
  }

  private buildDiv(): HTMLDivElement {
    const div = document.createElement("div");

    const title = document.createElement("h2");
    title.innerHTML = "Tutor Schedules:";
    div.append(title);

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

  forEachFilter(action: (option: FilterOption) => void) {
    this._filterOptions.forEach(action);
  }

  findFilter(title: string): FilterOption | null {
    for (const option of this._filterOptions) {
      if (option.title === title) {
        return option;
      }
    }
    return null;
  }

  addFilter(option: FilterOption) {
    this._filterOptions.push(option);
    this.onFilterDispatch();
  }

  removeFilter(option: FilterOption | string) {
    if (typeof option === "string") {
      for (let i = 0; i < this._filterOptions.length; i++) {
        if (this._filterOptions[i].title === option) {
          this._filterOptions.splice(i, 1);
          return;
        }
      }
    } else {
      const ind = this._filterOptions.indexOf(option);
      if (ind === -1) return;
      this._filterOptions.splice(ind, 1);
    }
    this.onFilterDispatch();
  }

  filter(option: FilterOption) {
    if (this.div === null) return;

    this.forEachTutor((tutor) => {
      if (option.include(tutor)) {
        tutor.showDiv();
      } else {
        tutor.hideDiv();
      }
    });
  }

  addTutorListener(subscriber: object, action: Notify) {
    this.onTutorUpdate.addListener(subscriber, action);
  }

  removeTutorListener(subscriber: object) {
    this.onTutorUpdate.removeListener(subscriber);
  }

  onTutorDispatch() {
    this.onTutorUpdate.dispatch(this);
  }

  addFilterListener(subscriber: object, action: Notify) {
    this.onFilterUpdate.addListener(subscriber, action);
  }

  removeFilterListener(subscriber: object) {
    this.onFilterUpdate.removeListener(subscriber);
  }

  onFilterDispatch() {
    this.onFilterUpdate.dispatch(this);
  }
}
