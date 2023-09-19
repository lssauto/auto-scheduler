# time.js
[Back To Overview](../overview.md)

Times are contained in Schedules, and represent individual time blocks for the container (a tutor or room) of that schedule.

## Attributes

- `schedule: Schedule`: back reference to the schedule that contains this Time.

- `container: Tutor | Room`: back reference to the container of the schedule this Time is a part of.

- `id: int`: A unique identifier given to each Time.

- `coords: {row: int, col: int}`: the row and column this time is associated with on the tutor response table. This is only used by session times.

- `tutor: str`: the email of the tutor this time is associated with. Access the actual Tutor instance with `getTutor()`.

- `room: str`: the room name of the room this time is associated with. Access the actual Room instance with `getRoom()`.

- `course: str`: the ID of the course this time is associated with. Access the actual Course instance with `getCourse()`.

- `tag: Tags`: the tag used to identify what type of time block this is. Tags should be from the [`Tags`](../globals.md#tags) enum.

- `day: str`: the day this time happens on.

- `start: int`: the start of the time block.

- `end: int`: the end of the time block.

- `scheduledByLSS: bool`: used to mark sessions to be given room assignments.

## Methods

> ### `setSchedule(schedule: Schedule) -> this`
> Set the back reference to the schedule that this time is a part of.

> ### `setContainer(container: Tutor | Room) -> this`
> Set the back reference to the Tutor or Room instance that the time's schedule belongs to.

> ### `setTutor(tutor: str) -> this`

> ### `getTutor() -> Tutor | null`
> Returns the Tutor instance that the time's schedule belongs to. If the tutor doesn't exist, returns `null`.

> ### `setRoom(room: str) -> this`

> ### `getRoom() -> Room | null`
> Returns the Room instance that the time's schedule belongs to. If the room doesn't exists, returns `null`.

> ### `setCourse(course: str) -> this`

> ### `getCourse() -> Course | null`
> Returns the Course instance that the time's schedule belongs to. If the course doesn't exist, returns `null`.

> ### `setTag(tag: Tags) -> this`

> ### `setDay(day: str) -> this`

> ### `getDay() -> array | null`
> Returns the array of Times on the same day as this Time, from its owner Schedule.

> ### `setStart(start: int) -> this`

> ### `setEnd(end: int) -> this`

> ### `setScheduleByLSS(scheduleByLSS: bool) -> this`

> ### `hasRoomAssigned() -> bool`
> Returns true if `room` isn't `null`. This is used to determine if a session has been scheduled.

> ### `getStartStr() -> str`
> Returns `start` converted to a string in the format `"##:## [AM/PM]"`. Used [`convertTimeToStr()`](../utility/time-convert.md).

> ### `getEndStr() -> str`
> Returns `end` converted to a string in the format `"##:## [AM/PM]"`. Used [`convertTimeToStr()`](../utility/time-convert.md).

> ### `getStartToEndStr() -> str`
> Returns `"##:## [AM/PM] - ##:## [AM/PM]"`.

> ### `getDayAndStartStr() -> str`
> Returns `"{day} ##:## [AM/PM]"`.

> ### `getTimeStr() -> str`
> returns `"{day} ##:## [AM/PM] - ##:## [AM/PM]"`.

> ### `getFullStr() -> str`
> Returns a string containing the full time, the tag, and info about `container`. If the Time is a session, then a dropdown menu will be generated to change the time.

> ### `isEqual(other: Time) -> bool`
> Compares `other` with `this` to see if they are describing the same time, not if they are the same time instance.

> ### `isRemovable() -> bool`
> Used to determine if the "Remove" button should be added to the schedule display, made in [`Schedule.display()`](schedule.md#display---str). Checks if the removing the time can properly update the tutor's schedule.

> ### `conflictsWith(other: Time) -> bool`
> Compares `other` with `this` to see if they have overlap in their start and end. Does not compare days.

> ### `makeCopy() -> Time`
> Returns a copy of the Time.