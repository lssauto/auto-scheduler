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
            .setStatus(obj.status)
            .setScheduler(obj.scheduler);

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
                let error = this.schedule.addTime(lecture, id, Tags.Lecture);
                if (error != null) {
                    if (error.error == Errors.Formatting) {
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
                let error = this.schedule.addTime(officeHour, id, Tags.OfficeHours);
                if (error != null) {
                    if (error.error == Errors.Formatting) {
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
                let error = this.schedule.addTime(discordHour, id, Tags.Discord);
                if (error != null) {
                    if (error.error == Errors.Formatting) {
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
                let error = this.schedule.addTime(time.time, id, Tags.Session, null, time.schedule);
                if (error != null) {
                    if (error.error == Errors.Formatting) {
                        output({
                            type: "warning", 
                            tutor: this.name + " (" + this.email + ")", 
                            message: "Session time could not be recognized: " + time.time
                        });
                    } else {
                        course.errors.push(error);
                    }
                } else if (time.room != null) {
                    let scheduleTime = this.schedule.findTimeByStr(time.time);
                    scheduleTime.setRoom(time.room);
                    if (time.room in rooms) {
                        rooms[time.room].addTime(time.time, id, this.email);
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
            for (const error of course.errors) {
                errors.push(error);
            }
        }
        return errors;
    }

    // return a string representation of the tutor
    display() {
        let str = "";

        str += `<b>Name: ${this.name} ; `;
        str += `Email: ${this.email}</b><br>`;

        

        str += "<b>Courses:</b><br>";
        for (const id in this.courses) {
            const course = this.courses[id];

            // building preference
            let options = `<select id="${this.email + "-" + id + "-preference"}">`;
            options += `<option value="any">Any</option>`;
            if (buildings != null) {
                for (const building in buildings) {
                    options += `<option value="${building}" ${course.preference == building ? "selected" : "" }>${building}</option>`;
                }
            }
            options += `</select>`;
            options += ` <button type='submit' onclick="setBuildingPreference('${this.email}', '${id}')">Set Preference</button>`;
            
            // schedule status
            let statusStr = `<select id="${this.email + "-" + id + "-status"}">`;
            for (const statusID in StatusOptions) {
                const status = StatusOptions[statusID];
                statusStr += `<option value="${status}" ${course.status == status ? "selected" : "" }>${status}</option>`;
            }
            statusStr += `</select>`;
            statusStr += ` <button type='submit' onclick="setStatus('${this.email}', '${id}')">Set Status</button>`;

            // course actions
            let deleteButton = `<button type='submit' onclick="removeCourse('${this.email}', '${id}')">Remove</button>`;
            let slackButton = "";
            if (FinishedStatus.includes(course.status)) {
                slackButton = `- <button type='submit' onclick="copySlackNote('${this.name}', '${id}')">Copy Slack Note</button> `;
            }
            
            // full course div
            str += `<div class='course ${StatusClass[course.status]}'>`;
            str += `<b>${id}: ${course.position}</b> || ${options} - ${statusStr} - ${deleteButton} ${slackButton}- Scheduler: ${course.scheduler}<br>`;
            str += course.comments != "" ? `${course.comments}` : "";
            str += "</div><br>";
        }

        // schedule
        str += "</br><b>Schedule:</b><br>";
        str += this.schedule.display();

        // errors
        str += "<b>Errors:</b><br>";
        let errorCount = 0;
        for (const courseID in this.courses) {
            const course = this.courses[courseID];
            errorCount += course.errors.length;
            for (let i = 0; i < course.errors.length; i++) {
                const error = course.errors[i];
                str += `<div class='time ${error.error}'>`;
                str += `${error.time.getFullStr()} , `
                str += `error: ${error.error} - `;
                // ? functions in ignore-errors.js
                str += `<button type='submit' onclick="ignoreError('${this.email}', '${courseID}', '${i}')">Ignore</button> `;
                str += `<button type='submit' onclick="removeError('${this.email}', '${courseID}', '${i}')">Remove</button>`;
                str += "</div><br>";
            }
        }
        if (errorCount == 0) { str += "No Errors.<br>"; }

        return str;
    }

    createDivInnerHTML() {
        return this.display() + "<br>" + ("=".repeat(50)) + "<br>";
    }

    createDiv() {
        let div = document.createElement('div');
        div.id = this.email;
        div.innerHTML = this.createDivInnerHTML();
        return div;
    }

    createDivAsHTML() {
        return `<div id="${this.email}">${this.createDivInnerHTML()}</div>`;
    }

}