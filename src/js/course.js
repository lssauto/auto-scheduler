// * Course class to hold session times for an individual course. One tutor can have multiple courses.

class Course {
    constructor(id) {
        this.id = id;
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
        return this;
    }
}