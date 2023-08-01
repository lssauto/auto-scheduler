// * Course class to hold session times for an individual course. One tutor can have multiple courses.

class Course {
    constructor(tutor, id) {
        this.tutor = tutor;
        this.id = id;
        this.status = StatusOptions.InProgress;
        this.errors = [];
        return this;
    }

    setStatus(status) {
        // forcefully remove errors if course no longer has an error status
        if (ErrorStatus.includes(this.status) && !ErrorStatus.includes(status)) {
            this.errors = [];
            output({type: "info", 
            message: `Since status is being changed to a non-error status, all errors will be removed.`});
        }

        // if schedule was complete, but want to redo schedule, remove all rooms from sessions
        if (FinishedStatus.includes(this.status) && !FinishedStatus.includes(status)) {
            for (const day in this.tutor.schedule.week) {
                let times = this.tutor.schedule.week[day];
                for (let time of times) {
                    if (!time.hasRoomAssigned()) continue;

                    // remove time from assigned room
                    if (time.room in rooms) {
                        let room = time.getRoom();
                        let i = room.schedule.findTimeIndex(time);
                        if (i != null) removeTime(time.room, day, i, false);
                    }

                    time.setRoom(null);
                }
            }
            clearConsole();
            output({type: "info", 
            message: `Since status is being changed to an 'incomplete' status, all room assignments will be removed.`});
        }

        // set status
        let prevStatus = this.status;
        this.status = status;

        // update room schedule display to reflect changed styling
        if (status == StatusOptions.ScheduleConfirmed || (status != StatusOptions.ScheduleConfirmed && prevStatus == StatusOptions.ScheduleConfirmed)) {
            for (const day in this.tutor.schedule.week) {
                let times = this.tutor.schedule.week[day];
                for (let time of times) {
                    if (!time.hasRoomAssigned()) continue;

                    if (time.room in rooms) {
                        updateRoomDisplay(time.room);
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
        if (FinishedStatus.includes(this.status)) {
            this.setStatus(StatusOptions.InProgress);
        }
        return this;
    }

    setScheduler(name="") {
        this.scheduler = name == "" ? scheduler : name;
        return this;
    }
}