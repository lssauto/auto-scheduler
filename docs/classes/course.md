# course.js
[Back To Overview](../overview.md)

The `Course` class is used to track responses and statuses. Each `Tutor` contains a map of Courses.

## Attributes

- `tutor: Tutor`: a back reference to the `Tutor` instance this course belongs to.
- `id: str`: the course ID used to uniquely identify the course.
- `status: str`: the current scheduling status of the course. Value should be from the [`StatusOptions`](../globals.md#statusoptions) enum.
- `errors: array`: an array of any error objects returned by `Schedule.addTime()`.
- `hadErrors: bool`: flags whether the course had errors, but they were all resolved. Used to prevent repeated error assignments when parsing the response table again.
- `row: int`: the row number of the response table this course came from.
- `timestamp: int`: when this response was submitted.
- `position: str`: the position the tutor is assigned for this course. Value should be from the [`Positions`](../globals.md#positions) enum.
- `lectures: array`: an array of the lecture times given in the response table. This is made from the raw input string, split by ",".
- `officeHours: array`: an array of the office hour times given in the response table. This is made from the raw input string, split by ",".
- `discordHours: array`: an array of the discord support times given in the response table. This is made from the raw input string, split by ",".
- `times: array`: an array of the session availability times given in the response table. Each element is the raw input string.
- `comments: str`: the comments left at the end of the submission.
- `preference: str`: the preferred building for the sessions of this course to be assigned to. Default preference is `"any"`.
- `scheduler: str`: the name of the scheduler who is creating the schedule for this course.

## Methods

> ### `setStatus(status: str, updateDisplay: bool [default: true]) -> this`
> Set the status of the course, expects a string from the [`StatusOptions`](../globals.md#statusoptions) enum.
> 
> If the status is switched from an error status to a non-error status, then the `errors` list will be emptied.
>
> If the status is switched from a complete status to a non-complete status, then all room assignments will be removed.
> 
> If the `updateDisplay` flag is set to false, then the HTML div displaying the tutor this course belongs to will not be rerendered.

> ### `setRow(row: int) -> this`

> ### `setTimestamp(timestamp: str) -> this`
> Expects the timestamp string from the response table. This string will then be converted to an int so that submission can be compared for most recent.

> ### `setPosition(position: str) -> this`

> ### `setLectures(lectures: array) -> this`

> ### `setOfficeHours(officeHours: array) -> this`

> ### `setDiscordHours(discordHours: array) -> this`

> ### `setTimes(times: array) -> this`

> ### `Comments(comments: str) -> this`

> ### `setPreference(preference: str) -> this`
> If the course has a complete status, then the status will be set to an in-progress status.

> ### `setScheduler(scheduler: str) -> this`