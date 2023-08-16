# schedule.js
[Back To Overview](../overview.md)

Each Tutor and Room has a Schedule instance that can be accessed with the `.schedule` attribute. Schedules contain [`Time`](time.md) instances, organized by day, and ordered by start time.

## Attributes

- `container: Tutor | Room`: a back reference to the Tutor or Room instance that contains this Schedule. **The type of the Schedule's container will affect its functionality.**

- `range: object | null`: an object used to describe what times and days the container can be scheduled for. This is used for Rooms, and is transferred from the buildings map.
    - `days: array`: an array of the days the container can be scheduled for.
    - `start: number`: the start time when the container can be scheduled.
    - `end: number`: the end time when the container can be scheduled.

- `week: object`: a map of the days of the week. Keys are the day names as strings, and values are arrays of Times.

## Methods

> ### `setRange(range: object) -> this`
> Set the valid time range for this schedule.

> ### `addTime(timeStr: str, course: str, tag: Tags, tutor: str, scheduleByLSS: bool) -> object | null`
> Add a new time to the schedule. `timeStr` is the raw string representing the time in the format `"day(s) HH:MM [AM/PM]"` or `"day(s) HH:MM [AM/PM] - HH:MM [AM/PM]"`. `course` is the course ID this time belongs to. `tag` is to identify what type of time is being added, which should be from the [`Tags`](../globals.md#tags) enum. `tutor` is a tutor's email, and is only used for adding times to rooms. This allows Times in a room's schedule to reference the tutor they are assigned to. `scheduleByLSS` is only used for session times to keep track of whether they should be assigned a room.
>
> The time will be checked for validity (proper format, is within the schedule's range, passes [`isValidSessionTime()`](../utility/session-times.md) if it is a session, and doesn't overlap with another time already in the schedule). It will then add a new Time to the arrays in `week`.
>
> If the time fails to pass all of the checks, an object will be returned containing a Time instance, and an error type from the [`Errors`](../globals.md#errors) enum. If a new Time is successfully added to the schedule, then `null` will be returned.
>
> **For future maintainers: The majority of the complexity of this method is due to it being used for both Tutors and Rooms. The return value is also used by the scheduling strategies in [`schedulers.js`](../procedure/schedulers.md), and when creating new Courses in [`tutor.js`](tutor.md).**

> ### `pushTime(time: Time) -> Time`
> Takes a Time instance, makes a copy, and adds it to the schedule. This will not do any checks for validity. The new Time instance will be returned.

> ### `removeTime(day: str, i: int) -> Time | null`
> Removes the time at `week[day][i]`. Returns the Time instance that was removed. If that time doesn't exist, then `null` is returned.

> ### `findTimeIndex(givenTime: Time) -> int | null`
> Finds a Time within the schedule that matches `givenTime`. Returns the index of the day the time was found at. If the time wasn't found, then `null` is returned.

> ### `findTimeByStr(timeStr: str, tag: Tags) -> Time | null`
> Finds a Time within the schedule that matches `timeStr` and has the given tag. `timeStr` should be formatted as `"DAY ##:## AM/PM"`. Returns the Time instance that was found, or `null` if it wasn't found.

> ### `display() -> str`
> Creates a string containing HTML to display the times in the schedule.

> ### `copy(assigned: bool [default: false]) -> str`
> Creates a string that can be copied to the user's clipboard. The `assigned` flag is used for Tutor schedules, and will only add times with room assignments to the string.