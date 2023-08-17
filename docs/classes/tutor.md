# tutor.js
[Back To Overview](../overview.md)

Each Tutor can have multiple Courses, and will always have 1 Schedule to track all of their time blocks. All Tutor instances are stored in the global `tutors` map, with their emails as keys.

## Attributes

- `email: str`: the tutor's email address.

- `name: str`: the tutor's full name.

- `courses: object`: a map of the Courses assigned to the tutor. Keys are course IDs.

- `schedule: Schedule`: reference to the Schedule that belongs to the Tutor.

## Methods

> ### `Tutor(obj: object) -> Tutor`
> Constructor expects an object created by [`buildJSON()`](../procedure/parse.md). The constructor will create a new Course using `obj` and fill a new Schedule.

> ### `addCourse(obj: object) -> this`
> Creates a new Course, and adds it to the Tutor's `courses` map.

> ### `update(obj: object) -> this`
> updates an existing Course with new data, or adds a new Course. This will also update the Tutor's Schedule.

> ### `fillSchedule()`
> Uses the data from all of the Tutor's Courses to add Times to Tutor's Schedule. Errors returned by the Schedule's [`addTime()`](schedule.md#addtimetimestr-str-course-str-tag-tags-tutor-str-schedulebylss-bool---object--null) will be added to the Course's `errors` array.

> ### `hasErrors() -> bool`
> Returns true if any of the Tutor's Courses has an error.

> ### `getErrors() -> array`
> Returns an array of all the error objects from all of the Tutor's Courses.

> ### `display() -> str`
> Builds a string containing HTML to display all of the needed information and interactable elements in a div.

> ### `createDivInnerHTML() -> str`
> Wraps the string returned by `display()` in "separators", which are just "=" to separate tutors when displayed.

> ### `createDiv() -> element`
> Creates a div as an HTML element, and sets its innerHTML to the string returned by `createDivInnerHTML()`.

> ### `createDivAsHTML() -> str`
> Accomplishes the same thing as `createDiv()`, but as a string containing HTML.