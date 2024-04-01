import { Rooms } from "../rooms/rooms";
import { Building } from "../rooms/building";
import * as timeConvert from "../utils/time-convert";
import { Messages } from "../elements/messages/messages";

// procedure for parsing buildings from their table data

export function parseBuildings(input: string) {
  Messages.clear();
  Messages.output(Messages.info, "Parsing buildings table...");
  const matrix = splitString(input);
  buildBuildings(matrix);
  Messages.output(Messages.success, "Buildings successfully parsed!");
}

// split raw table string into matrix
function splitString(input: string): string[][] {
  // split raw string into rows
  const rows = input.split("\n");
  const matrix: string[][] = [];

  // for each row
  for (let i = 0; i < rows.length; i++) {
    // remove empty rows
    if (rows[i].startsWith("\t")) {
      rows.splice(i, 1);
      i--;
      continue;
    }
    // split rows into cells
    matrix.push(rows[i].split("\t"));
    // remove empty cells
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] == "") {
        matrix[i].splice(j, 1);
        j--;
      }
    }
  }
  return matrix;
}

// make actual Building instances
function buildBuildings(matrix: string[][]) {
  const rooms = Rooms.instance!;

  for (const row of matrix) {
    // skip any buildings that already exist
    if (rooms.hasBuilding(row[0])) {
      Messages.output(Messages.warn, {
        message: `${row[0]} is already in the building list. This row will be skipped.`
      });
      continue;
    }

    // make a new building row[0] is the building name
    const building = new Building(row[0]);
    
    // if an open time range is given, parse it, and use it as the building's open range
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

    // add the building to the buildings list, 
    // this match any rooms to the building
    rooms.addBuilding(building);
  }
}
