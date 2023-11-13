import { RoomSchedule, AvailableRange } from "./room-schedule";
//import { Position } from "../positions";

export class Room {
    name: string;
    schedule: RoomSchedule;

    isRequestRoom: boolean;

    constructor(name: string, range: AvailableRange, isRequestRoom = false) {
        this.name = name;
        this.isRequestRoom = isRequestRoom;
        this.schedule = new RoomSchedule(this, range);
    }
}