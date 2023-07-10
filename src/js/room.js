// * container class to organize schedules for individual rooms

class Room {
    constructor(name) {
        this.name = name;
        this.type = name.includes("Large") ? "LGT" : "SGT";
        this.schedule = new Schedule(this);
        return this;
    }

    // wrapper around schedule.addTime(), 
    // if schedule.addTime() doesn't return null (returns error obj), then the requested time is already taken
    addTime(timeStr, course, tutor) {
        return this.schedule.addTime(timeStr, course, "session", tutor);
    }

    Display() {
        let str = "";

        str += `<b>Room: ${this.name}</b></br></br>`;
        str += this.schedule.Display();

        return str;
    }
}