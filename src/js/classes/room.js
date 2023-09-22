// * container class to organize schedules for individual rooms

class Room {
    constructor(name, isRequestRoom=false) {
        this.name = name;
        this.isRequestRoom = isRequestRoom;
        this.type = null;
        if (!isRequestRoom) {
            this.type = DefaultPosition;
            for (const key in PositionKeys) {
                if (name.toLowerCase().includes(PositionKeys[key])) {
                    this.type = Positions[key];
                }
            }
        }
        this.schedule = new Schedule(this);

        this.building = null; // null to designate room is not part of a building
        this.checkForBuilding(isRequestRoom);

        return this;
    }

    // assign a building if it can be found
    checkForBuilding(isRequestRoom=false) {
        for (let building in buildings) {
            if (this.name.includes(building)) {
                this.building = building;
                this.schedule.setRange(buildings[building]);
                if (!isRequestRoom) buildings[building].hasRooms = true;
            }
        }
    }

    // wrapper around schedule.addTime(), 
    // if schedule.addTime() doesn't return null (returns error obj), then the requested time is already taken
    addTime(timeStr, course, tutor) {
        return this.schedule.addTime(timeStr, course, Tags.Session, tutor);
    }

    display() {
        let str = "";

        str += `<b>Room: ${this.name} ; Building: ${this.building == null ? "not recognized" : this.building}</b></br></br>`;
        str += this.schedule.display();

        return str;
    }
}