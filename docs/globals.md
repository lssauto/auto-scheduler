# globals.js
[Back To Overview](overview.md)

Contains enums and global variables used throughout the program. The only global variables not defined here are references to HTML elements, which are defines in [`elements.js`](elements.md).

## Enums

> ### `Titles`
> Strings used to determine which data fields each column is assigned to. This is done by using `title.toLowerCase().include(Titles.Field)`. All values should be lower case. Used in [`buildJSON()`](prodecure/parse.md).

> ### `RoomResponse`
> Strings used to determine which response was given for a session's room selection. Matches are found using `.include()`. All values should be lower case. The field `AssignedToTutor` is for when already scheduled sessions have to be parsed. Used in [`buildJSON()`](prodecure/parse.md).

> ### `PositionKeys`
> Strings used to determine what a tutor's position is for a certain course. Matches are found using `.include()`. All values should be lower case.

> ### `Positions`
> The position titles that are displayed, and assigned to tutors'courses. These are also used to define the "type" of a room.

> ### `DefaultPosition`
> If a tutor's position can't be identified, then they are defaulted to this position.

> ### `CourselessPositions`
> An array of positions that are not expected to have a specific course.

> ### `PositionSessionLimit`
> The maximum number of sessions that can be assigned to a tutor with a given position.

> ### `PositionRequestLimit`
> The number of sessions that will be scheduled before room assignments default to registrar requests.

> ### `FixedRooms`
> Room assignment names that are constant. The `SpecificRequest` field will have a building name concat at the end.

> ### `RoomPositionFilter`
> Defines what types of rooms each position can be assigned to. The key is the type of the room, and the value is an array of positions allowed to be scheduled in that type of room.

> ### `StatusKeys`
> Used to determine the status of a response. This is done with `.include()`. All values should be lower case.

> ### `StatusOptions`
> The status titles assigned to courses.

> ### `StatusList`
> All values from `StatusOptions`, but in an array. Used to determine if a string is a valid status.

> ### `StatusClass`
> Defines which CSS class each status is assigned to. Used to color course blocks.

> ### `ProgressStatus`
> An array of all statuses that signal a course can be scheduled.

> ### `ErrorStatus`
> An array of all statuses that signal a course has errors.

> ### `ScheduledStatus`
> An array of all statuses that signal a course has been scheduled.

> ### `FinishedStatus`
> An array of all statuses that signal a course's schedule is complete, and confirmed by the tutor.

> ### `Tags`
> Tags used to identify what a Time represents.

> ### `Errors`
> Error types returned by `Schedule.addTime()`.

> ### `SessionTimes`
> Valid session times according to the [registrar schedule](https://registrar.ucsc.edu/soc/archive/html/fall2020/schedule_planner1.pdf). Used by [`isValidSessionTime()`](utility/session-times.md).

> ### `ScheduleBuilders`
> A map of scheduling strategies defined in [`schedulers.js`](procedure/schedulers.md).

## Global Variables

`scheduler`: stores the name of the scheduler. Set by [`getSchedulerName()`](popups.md).

### State Containers

- `expectedTutors`: map of expected tutor responses, keys are emails. Contains course IDs, and the position assigned to each course.

- `tutors`: map of Tutor instances, keys are emails.

- `positionMap`: map of tutors based on position. Keys are `Positions` values, and values are arrays of tutor emails.

- `preferenceList`: array of tutor emails to track which tutors have a building preference selected.

- `buildings`: map of buildings. Keys are the building names. Contains the times the building is open, used to determine whether a room is open to be assigned.

- `rooms`: map of Room instances. Keys are the room names.

- `requestRooms`: map of registrar request rooms. Created using any buildings that have no rooms. Room names are constructed using `FixedRooms.SpecificRequest + buildingName`. There will always be at least one room for general registrar requests.

- `schedulesCompleted`: bool to indicate whether [`buildSchedules()`](procedure/build-schedules.md) has been run.

### Parsing Data Saves

These are used in [`copy.js`](procedure/copy.md) to reconstruct the response table.

- `tutorJSONObjs`: the array of objects built in [`buildJSON()`](procedure/parse.md).

- `tutorMatrix`: the array of arrays built by [`handleTutorInput()`](prodecure/input.md). Does not include column titles.

- `responseColumnTitles`: array of column titles read from the first row of the response table created in [`handleTutorInput()`](prodecure/input.md).