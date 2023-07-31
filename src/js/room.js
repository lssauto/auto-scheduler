// * container class to organize schedules for individual rooms

class Room {
    constructor(name) {
        this.name = name;
        this.type = name.includes("Large") ? "LGT" : "SGT";
        this.schedule = new Schedule(this);

        this.building = null; // null to designate room is not part of a building
        this.checkForBuilding();

        return this;
    }

    // assign a building if it can be found
    checkForBuilding() {
        for (const building in buildings) {
            if (this.name.toUpperCase().includes(building.toUpperCase())) {
                this.building = building;
                this.schedule.setRange(buildings[building]);
            }
        }
    }

    // wrapper around schedule.addTime(), 
    // if schedule.addTime() doesn't return null (returns error obj), then the requested time is already taken
    addTime(timeStr, course, tutor) {
        return this.schedule.addTime(timeStr, course, "session", tutor);
    }

    Display() {
        let str = "";

        str += `<b>Room: ${this.name} ; Building: ${this.building == null ? "not recognized" : this.building}</b></br></br>`;
        str += this.schedule.Display();

        return str;
    }
}