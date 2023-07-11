// * Container class to hold session times for an individual tutor.

class Tutor {
    // construct a new tutor based on a table row
    constructor(obj) {
        // tutor info
        this.email = obj.email;
        this.name = obj.name;
        this.returnee = obj.returnee;

        // courses map key-value pairs are ("course id": Course object) Course is defined in course.js
        this.courses = {};

        this.AddCourse(obj);

        this.FillSchedule();

        return this;
    }

    // wrapper around process for adding a course
    AddCourse(obj) {
        let course = new Course(obj.class);
        course.setTimestamp(obj.timestamp)
            .setPosition(obj.position)
            .setLectures(obj.lectures)
            .setOfficeHours(obj.officeHours)
            .setDiscordHours(obj.discord)
            .setTimes(obj.times)
            .setComments(obj.comments);

        this.courses[course.id] = course;
        
        return this;
    }

    // update an existing course, or add a new one
    Update(obj) {
        // exit if current timestamp is newer
        if (obj.class in this.courses) {
            if (obj.timestamp < this.courses[obj.class].timestamp) return;
        }

        // update courses
        this.AddCourse(obj);

        this.FillSchedule();

        return this;
    }

    // add times to schedule from courses
    FillSchedule() {
        this.schedule = new Schedule();
        this.conflicts = [];
        for (let id in this.courses) {
            const course = this.courses[id];

            // lecture times
            for (let lecture of course.lectures) {
                let error = this.schedule.addTime(lecture, id, "lecture");
                if (error != null) {
                    if (error.error == "no-time") {
                        output({
                            type: "warning", 
                            tutor: this.name + " (" + this.email + ")", 
                            message: "Lecture time could not be recognized: " + lecture
                        });
                    } else {
                        this.conflicts.push(error);
                    }
                }
            }

            // office hours
            for (let officeHour of course.officeHours) {
                let error = this.schedule.addTime(officeHour, id, "office hours");
                if (error != null) {
                    if (error.error == "no-time") {
                        output({
                            type: "warning", 
                            tutor: this.name + " (" + this.email + ")", 
                            message: "Office Hours time could not be recognized: " + officeHour
                        });
                    } else {
                        this.conflicts.push(error);
                    }
                }
            }

            // discord hours
            for (let discordHour of course.discordHours) {
                let error = this.schedule.addTime(discordHour, id, "discord");
                if (error != null) {
                    if (error.error == "no-time") {
                        output({
                            type: "warning", 
                            tutor: this.name + " (" + this.email + ")", 
                            message: "Discord support time could not be recognized: " + discordHour
                        });
                    } else {
                        this.conflicts.push(error);
                    }
                }
            }

            // session times
            for (let time of course.times) {
                let error = this.schedule.addTime(time.time, id, "session", null, time.schedule);
                if (error != null) {
                    if (error.error == "no-time") {
                        output({
                            type: "warning", 
                            tutor: this.name + " (" + this.email + ")", 
                            message: "Session time could not be recognized: " + time.time
                        });
                    } else {
                        this.conflicts.push(error);
                    }
                }
            }
        }
    }

    // return a string representation of the tutor
    Display(assigned=false) {
        let str = "";

        str += `<b>Name: ${this.name} ; `;
        str += `Email: ${this.email}</b></br>`;

        str += "<b>Courses:</b></br>";
        for (let id in this.courses) {
            let dateObject = new Date(this.courses[id].timestamp);
            let date = dateObject.toLocaleString();
            str += `${id}: ${date} ; ${this.courses[id].position}</br>`;
            str += this.courses[id].comments != "" ? `${this.courses[id].comments}</br></br>` : "";
        }

        str += "</br><b>Schedule:</b></br>";
        str += this.schedule.Display(assigned);

        str += "<b>Errors:</b></br>";
        for (let conflict of this.conflicts) {
            str += `${conflict.time.course} ${conflict.time.tag}: `;
            str += `${conflict.day} ${convertTimeToString(conflict.time.start)} - ${convertTimeToString(conflict.time.end)} , `
            str += `error: ${conflict.error}</br>`;
        }
        if (this.conflicts.length == 0) { str += "No Errors.</br>"; }

        return str;
    }
}