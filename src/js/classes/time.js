// * Time class used in Schedules

class Time {
    constructor(schedule) {
        this.schedule = schedule; // back reference to the schedule that contains this time
        this.container = schedule.container;
        this.tutor = null; // tutor email, use getTutor() to access the actual Tutor instance
        this.room = null; // room id, use getRoom() to access the actual Room instance
        this.course = null; // course id, use getCourse() to access the actual Course instance
        this.tag = null;
        this.day = null;
        this.start = null;
        this.end = null;
        this.scheduleByLSS = true;
        return this;
    }

    setSchedule(schedule) {
        this.schedule = schedule;
        return this;
    }

    setContainer(container) {
        this.container = container;
        return this;
    }

    setTutor(tutor) {
        this.tutor = tutor;
        return this;
    }

    setRoom(room) {
        this.room = room;
        return this;
    }

    setCourse(course) {
        this.course = course;
        return this;
    }

    setTag(tag) {
        this.tag = tag;
        return this;
    }

    setDay(day) {
        this.day = day;
        return this;
    }

    setStart(start) {
        this.start = start;
        return this;
    }

    setEnd(end) {
        this.end = end;
        return this;
    }

    setScheduleByLSS(scheduleByLSS) {
        this.scheduleByLSS = scheduleByLSS;
        return this;
    }

    getContainer() {
        return this.container;
    }

    getTutor() {
        if (this.tutor in tutors) {
            return tutors[this.tutor];
        }
        return null;
    }

    hasRoomAssigned() { return this.room != null; }

    getRoom() {
        if (this.room in rooms) {
            return rooms[this.room];
        }
        return null;
    }

    getCourse() {
        if (this.container instanceof Tutor && this.course in this.container.courses) {
            return this.container.courses[this.course];
        } else if (this.container instanceof Room && tutors != null && this.tutor in tutors) {
            return this.getTutor().courses[this.course];
        }
        return null;
    }

    getDay() {
        if (this.day != null) {
            return this.schedule.week[this.day];
        }
        return null;
    }

    getStartStr() {
        return convertTimeToString(this.start);
    }

    getEndStr() {
        return convertTimeToString(this.end);
    }

    getStartToEndStr() {
        return `${this.getStartStr()} - ${this.getEndStr()}`;
    }

    getDayAndStartStr() {
        return `${this.day} ${this.getStartStr()}`;
    }

    getTimeStr() {
        return `${this.day} ${this.getStartToEndStr()}`;
    }

    getFullStr() {
        let body = "";
        if (this.container instanceof Room) {
            if (this.room != null) { // for registrar request rooms
                body = this.course + " , " + this.getTutor().name + " / " + this.tutor + " , " + " <b>" + this.room + "</b> , ";
            } else if (tutors != null && this.tutor in tutors) {
                body = this.course + " , " + this.getTutor().name + " / " + this.tutor + " , ";
            } else {
                body = this.course + " , " + this.tutor + " , ";
            }
        } else {
            if (this.hasRoomAssigned()) {
                body = this.course + " / <b>" + this.room + "</b>";
            } else {
                body = this.course;
            }
        }
        return `${body} ${this.tag}: ${this.getTimeStr()}`;
    }

    isEqual(other) {
        if (this.course != other.course) return false;
        if (this.tag != other.tag) return false;
        if (this.day != other.day) return false;
        if (this.start != other.start) return false;
        if (this.end != other.end) return false;
        return true; 
    }

    isRemovable() {
        if (this.container instanceof Tutor) return true;
        if (tutors != null && this.tutor in tutors && this.getCourse() != null) return true;
        return false;
    }

    conflictsWith(other) {
        if (other.start >= this.start && other.start <= this.end) {
            return true;
        }
        if (other.end >= this.end && other.end <= this.end) {
            return true;
        }
        return false;
    }

    makeCopy() {
        let newTime = new Time(this.schedule);
        newTime.setTutor(this.tutor)
            .setRoom(this.room)
            .setCourse(this.course)
            .setTag(this.tag)
            .setDay(this.day)
            .setStart(this.start)
            .setEnd(this.end)
            .setScheduleByLSS(this.scheduleByLSS);
        return newTime;
    }
}