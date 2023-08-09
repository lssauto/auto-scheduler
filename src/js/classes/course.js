// * Course class to hold session times for an individual course. One tutor can have multiple courses.

class Course {
    constructor(tutor, id) {
        this.tutor = tutor;
        this.id = id;
        this.status = StatusOptions.InProgress;
        this.errors = [];
        this.hadErrors = false;
        return this;
    }

    setStatus(status, updateDisplay=true) {
        let prevStatus = this.status;

        // forcefully remove errors if course no longer has an error status
        if (ErrorStatus.includes(this.status) && !ErrorStatus.includes(status) &&  this.errors.length > 0) {
            this.errors = [];
            this.hadErrors = true;
            output({type: "info", 
            message: `Since status is being changed to a non-error status, all errors will be removed.`});
        }

        // if schedule was complete, but want to redo schedule, remove all rooms from sessions
        if (ScheduledStatus.includes(this.status) && !ScheduledStatus.includes(status)) {
            for (const day in this.tutor.schedule.week) {
                let times = this.tutor.schedule.week[day];
                for (let time of times) {
                    if (!time.hasRoomAssigned()) continue;

                    // remove time from assigned room
                    if (time.room in rooms) {
                        let room = time.getRoom();
                        let i = room.schedule.findTimeIndex(time);
                        if (i != null) removeTime(time.room, day, i, false); // false flag used to tell removeTime not to update tutor display
                    }

                    time.setRoom(null);
                }
            }
            this.status = status;
            if (updateDisplay) updateTutorDisplay(this.tutor.email);
            clearConsole();
            output({type: "info", 
            message: `Since status is being changed to an 'incomplete' status, all room assignments will be removed.`});
        }

        // set status
        this.status = status;

        if (updateDisplay) {
            // update room schedule display to reflect changed styling
            if (status == StatusOptions.ScheduleConfirmed || (status != StatusOptions.ScheduleConfirmed && prevStatus == StatusOptions.ScheduleConfirmed)) {
                let updatedRooms = [];
                for (const day in this.tutor.schedule.week) {
                    let times = this.tutor.schedule.week[day];
                    for (let time of times) {
                        if (!time.hasRoomAssigned()) continue;
                        if (updatedRooms.includes(time.room)) continue;
    
                        if (time.room in rooms) {
                            updateRoomDisplay(time.room);
                            updatedRooms.push(time.room);
                        }
                    }
                }
            }
        }


        return this;
    }

    setRow(row) {
        this.row = row;
        return this;
    }

    // timestamp of when the times for this course were last submitted
    // expects a string in the format "MM/DD/YYYY HH:MM:SS"
    setTimestamp(timestamp) {
        let dateObject = new Date(timestamp);
        this.timestamp = dateObject.getTime(); // convert to milliseconds for comparison
        return this;
    }

    setPosition(position) {
        this.position = position.replace(/[^A-Z]/g, ""); // create acronym
        return this;
    }

    setLectures(lectureTimes) {
        this.lectures = lectureTimes;
        return this;
    }

    setOfficeHours(officeHours) {
        this.officeHours = officeHours;
        return this;
    }

    setDiscordHours(discordTimes) {
        this.discordHours = discordTimes;
        return this;
    }

    setTimes(times) {
        this.times = times;
        return this;
    }

    setComments(comments) {
        this.comments = comments;
        return this;
    }

    setPreference(preference) {
        this.preference = preference;
        if (ScheduledStatus.includes(this.status)) {
            if (this.hadErrors) {
                this.setStatus(StatusOptions.ErrorsResolved);
            } else {
                this.setStatus(StatusOptions.InProgress);
            }
        }
        return this;
    }

    setScheduler(name="") {
        this.scheduler = name == "" ? scheduler : name;
        return this;
    }
}