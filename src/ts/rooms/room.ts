import { RoomSchedule, AvailableRange } from "./room-schedule";
import { Positions, Position } from "./positions";

export class Room {
    name: string;
    schedule: RoomSchedule;

    isRequestRoom: boolean;
    type: Position;

    constructor(name: string, range: AvailableRange) {
        this.name = name;
        this.schedule = new RoomSchedule(this, range);
    }
}