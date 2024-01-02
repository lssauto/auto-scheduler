import { Editor } from "./editor";
import * as fields from "./menu-field";
import { Days } from "../../days";
import { Building } from "../../rooms/building";
import { Rooms } from "../../rooms/rooms";
import * as timeConvert from "../../utils/time-convert";
import { AvailableRange } from "../../rooms/room-schedule";

export class BuildingEditor extends Editor {
  private static _instance: BuildingEditor | null = null;
  public static get instance(): BuildingEditor | null {
    return BuildingEditor._instance;
  }

  curBuilding: Building | null = null;

  // * Rows ======================
  static readonly nameRow = 0;
  static readonly daysRow = 1;
  static readonly timeRow = 2;
  // * ===========================

  // * Titles ====================
  static readonly name = "Name";
  static readonly start = "Start";
  static readonly end = "End";
  // * ===========================

  constructor() {
    super("Building Editor");
    if (BuildingEditor.instance !== null && BuildingEditor.instance !== this) {
      console.error("Singleton BuildingEditor class instantiated twice");
    }
    BuildingEditor._instance = this;

    this.buildNameRow();
    this.buildDaysRow();
    this.buildTimeRow();
  }

  private buildNameRow() {
    this.addRow();

    this.addInputField(BuildingEditor.nameRow,
      BuildingEditor.name,
      (input: string) => {
        let found = false;
        Rooms.instance!.forEachBuilding((building) => {
          if (building === this.curBuilding) return;
          if (building.name === input) {
            found = true;
          }
        });
        if (found) {
          return false;
        }
        return true;
      },
      (field: fields.MenuInputField) => {
        field.setNotice("");
      },
      (field: fields.MenuInputField) => {
        field.setNotice("a building with this name already exists");
      }
    );
  }

  private buildDaysRow() {
    this.addRow();

    for (const day of Object.values(Days)) {
      this.addCheckboxField(
        BuildingEditor.daysRow,
        day,
        () => {
          return true;
        },
        () => {
          return;
        },
        () => {
          return;
        }
      );
    }
  }

  private buildTimeRow() {
    this.addRow();

    this.addTimeField(
      BuildingEditor.timeRow,
      BuildingEditor.start,
      (input: number) => {
        if (input === 0) {
          return false;
        }
        return this.validateTime();
      },
      (field: fields.MenuTimeField) => {
        field.setNotice("");
      },
      (field: fields.MenuTimeField) => {
        if (field.getTime() === 0) {
          field.setNotice("a start time must be selected");
        }
        field.setNotice("");
      }
    );

    this.addTimeField(
      BuildingEditor.timeRow,
      BuildingEditor.end,
      (input: number) => {
        if (input === 0) {
          return false;
        }
        return this.validateTime();
      },
      (field: fields.MenuTimeField) => {
        field.setNotice("");
      },
      (field: fields.MenuTimeField) => {
        if (field.getTime() === 0) {
          field.setNotice("an end time must be selected");
        }
        field.setNotice("");
      }
    );
  }

  validateTime(): boolean {
    const time = {
      start: (this.getField(BuildingEditor.start)! as fields.MenuTimeField).getTime(),
      end: (this.getField(BuildingEditor.end)! as fields.MenuTimeField).getTime()
    };

    if (time.start === 0 || time.end === 0) {
      this.setRowNotice(BuildingEditor.timeRow, "a time range must be selected");
      return false;
    }

    if (time.end < time.start) {
      this.setRowNotice(BuildingEditor.timeRow, "start must be before end");
      return false;
    }
    this.setRowNotice(BuildingEditor.timeRow, "");
    return true;
  }

  override applyChanges() {
    const range: AvailableRange = {
      days: [],
      start: (this.getField(BuildingEditor.start)! as fields.MenuTimeField).getTime(),
      end: (this.getField(BuildingEditor.end)! as fields.MenuTimeField).getTime(),
    };
    for (const day of Object.values(Days)) {
      if ((this.getField(day)! as fields.MenuCheckboxField).getChecked()) {
        range.days.push(day as Days);
      }
    }

    if (this.curBuilding) {
      this.curBuilding.update(
        this.getField(BuildingEditor.name)!.getValue(),
        range
      );
    } else {
      const newBuilding = new Building(this.getField(BuildingEditor.name)!.getValue());
      newBuilding.setRange(range);
      Rooms.instance!.addBuilding(newBuilding);
    }
    return;
  }

  createNewBuilding() {
    this.openMenu();
    this.curBuilding = null;
  }

  editBuilding(building: Building) {
    this.createNewBuilding();
    this.curBuilding = building;
    this.getField(BuildingEditor.name)!.setValue(building.name);
    for (const day of building.range.days) {
      (this.getField(day)! as fields.MenuCheckboxField).setChecked(true);
    }
    this.getField(BuildingEditor.start)!.setValue(timeConvert.intTo24hr(building.range.start));
    this.getField(BuildingEditor.end)!.setValue(timeConvert.intTo24hr(building.range.end));
  }
}
