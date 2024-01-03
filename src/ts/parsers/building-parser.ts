import { Rooms } from "../rooms/rooms";
import { Building } from "../rooms/building";
import * as timeConvert from "../utils/time-convert";
import { Messages } from "../elements/messages/messages";

export function parseBuildings(input: string) {
  Messages.clear();
  Messages.output(Messages.info, "Parsing buildings table...");
  const matrix = splitString(input);
  buildBuildings(matrix);
  Messages.output(Messages.success, "Buildings successfully parsed!");
}

function splitString(input: string): string[][] {
  const rows = input.split("\n");
  const matrix: string[][] = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].startsWith("\t")) {
      rows.splice(i, 1);
      i--;
      continue;
    }
    matrix.push(rows[i].split("\t"));
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] == "") {
        matrix[i].splice(j, 1);
        j--;
      }
    }
  }
  return matrix;
}

function buildBuildings(matrix: string[][]) {
  const rooms = Rooms.instance!;

  for (const row of matrix) {
    if (rooms.hasBuilding(row[0])) {
      Messages.output(Messages.warn, {
        message: `${row[0]} is already in the building list. This row will be skipped.`
      });
      continue;
    }

    const building = new Building(row[0]);
    
    if (row.length > 1) {
      const rangeStr = row[1];
      const range = timeConvert.parseTimeStr(rangeStr);
      if (range !== null) {
        building.setRange(range);
      } else {
        Messages.output(Messages.warn, {
          message: `Improperly formatted hours for building: ${building.name}. Using default time range instead.`,
          expected: "[M/Tu/W/Th/F/Sat/Sun] ##:## [AM/PM] - ##:## [AM/PM]",
          solution: "The building's open time range can be set by clicking the 'Edit' button next to it."
        });
      }
    }

    rooms.addBuilding(building);
  }
}
