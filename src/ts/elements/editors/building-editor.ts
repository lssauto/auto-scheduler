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

  // the building currently being edited
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

    // building name
    this.addInputField(BuildingEditor.nameRow,
      BuildingEditor.name,
      (input: string) => {
        // check if the name isn't already taken
        let found = false;
        Rooms.instance!.forEachBuilding((building) => {
          if (building === this.curBuilding) return;
          if (building.name === input) {
            found = true;
          }
        });
        return !found;
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

    // add a check box for each day, these can have any value
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

    // ? time validation is done with validateTime() method

    // start time
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

    // end time
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
    // convert field values into easier to operate on object
    const time = {
      start: (this.getField(BuildingEditor.start)! as fields.MenuTimeField).getTime(),
      end: (this.getField(BuildingEditor.end)! as fields.MenuTimeField).getTime()
    };

    // time range must be set
    if (time.start === 0 || time.end === 0) {
      this.setRowNotice(BuildingEditor.timeRow, "a time range must be selected");
      return false;
    }

    // time must start before it ends
    if (time.end < time.start) {
      this.setRowNotice(BuildingEditor.timeRow, "start must be before end");
      return false;
    }
    this.setRowNotice(BuildingEditor.timeRow, "");
    return true;
  }

  override applyChanges() {
    // convert field values in available range object
    const range: AvailableRange = {
      days: [],
      start: (this.getField(BuildingEditor.start)! as fields.MenuTimeField).getTime(),
      end: (this.getField(BuildingEditor.end)! as fields.MenuTimeField).getTime(),
    };
    // fill range's days list
    for (const day of Object.values(Days)) {
      if ((this.getField(day)! as fields.MenuCheckboxField).getChecked()) {
        range.days.push(day as Days);
      }
    }

    // if this is a building being edited
    if (this.curBuilding) {
      // update method will reassign rooms based on their names
      this.curBuilding.update(
        this.getField(BuildingEditor.name)!.getValue(),
        range
      );

    // or is a new building
    } else {
      const newBuilding = new Building(this.getField(BuildingEditor.name)!.getValue());
      newBuilding.setRange(range);
      Rooms.instance!.addBuilding(newBuilding);
    }
    return;
  }

  /**
   * Creates a new building.
   */
  createNewBuilding() {
    this.openMenu();
    this.curBuilding = null;
  }

  /**
   * Opens the given building in the editor.
   */
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
