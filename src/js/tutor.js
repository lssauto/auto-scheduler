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
        let course = new Course(this, obj.class);
        course.setTimestamp(obj.timestamp)
            .setPosition(obj.position)
            .setLectures(obj.lectures)
            .setOfficeHours(obj.officeHours)
            .setDiscordHours(obj.discord)
            .setTimes(obj.times)
            .setComments(obj.comments)
            .setPreference("any")
            .setRow(obj.row)
            .setStatus(obj.status);

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
        this.schedule = new Schedule(this);
        for (let id in this.courses) {
            let course = this.courses[id];
            course.errors = [];

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
                        course.errors.push(error);
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
                        course.errors.push(error);
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
                        course.errors.push(error);
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
                        course.errors.push(error);
                    }
                }
            }

            if (course.errors.length > 0) {
                course.setStatus(StatusOptions.SchedulingError);

            }
            this.courses[id] = course;
        }
    }

    hasErrors() {
        for (const courseID in this.courses) {
            const course = this.courses[courseID];
            if (ErrorStatus.includes(course.status)) {
                return true;
            }
        } 
        return false;
    }

    getErrors() {
        errors = [];
        for (const courseID in this.courses) {
            const course = this.courses[courseID];
            console.log(course.errors);
            errors = errors.concat(course.errors);
        }
        return errors;
    }

    // return a string representation of the tutor
    Display() {
        let str = "";

        str += `<b>Name: ${this.name} ; `;
        str += `Email: ${this.email}</b></br>`;

        

        str += "<b>Courses:</b></br>";
        for (let id in this.courses) {
            let dateObject = new Date(this.courses[id].timestamp);
            let date = dateObject.toLocaleString();

            // building preference
            let options = `<select id="${this.email + "-" + id + "-preference"}">`;
            options += `<option value="any">Any</option>`;
            if (buildings != null) {
                for (const building of buildings) {
                    options += `<option value="${building}" ${this.courses[id].preference == building ? "selected" : "" }>${building}</option>`;
                }
            }
            options += `</select>`;
            options += ` <button type='submit' onclick="setBuildingPreference('${this.email}', '${id}')">Set Preference</button>`;
            
            // schedule status
            let statusStr = `<select id="${this.email + "-" + id + "-status"}">`;
            for (const statusID in StatusOptions) {
                const status = StatusOptions[statusID];
                statusStr += `<option value="${status}" ${this.courses[id].status == status ? "selected" : "" }>${status}</option>`;
            }
            statusStr += `</select>`;
            statusStr += ` <button type='submit' onclick="setStatus('${this.email}', '${id}')">Set Status</button>`;

            let deleteButton = `<button type='submit' onclick="removeCourse('${this.email}', '${id}')">Remove</button>`;

            str += `${id}: ${date} ; ${this.courses[id].position} - ${options} - ${statusStr} - ${deleteButton}</br>`;
            str += this.courses[id].comments != "" ? `${this.courses[id].comments}</br></br>` : "";
        }

        str += "</br><b>Schedule:</b></br>";
        str += this.schedule.Display();

        str += "<b>Errors:</b></br>";
        let errorCount = 0;
        for (const courseID in this.courses) {
            const course = this.courses[courseID];
            errorCount += course.errors.length;
            for (let i = 0; i < course.errors.length; i++) {
                const error = course.errors[i];
                str += `${error.time.course} ${error.time.tag}: `;
                str += `${error.day} ${convertTimeToString(error.time.start)} - ${convertTimeToString(error.time.end)} , `
                str += `error: ${error.error} - `;
                // ? functions in ignore-errors.js
                str += `<button type='submit' onclick="ignoreError('${this.email}', '${courseID}', '${i}')">Ignore</button> `;
                str += `<button type='submit' onclick="removeError('${this.email}', '${courseID}', '${i}')">Remove</button>`;
                str += "</br>";
            }
        }
        if (errorCount == 0) { str += "No Errors.</br>"; }

        return str;
    }
}