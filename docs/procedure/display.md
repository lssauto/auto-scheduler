# display.js
[Back To Overview](../overview.md)

Functions used for updating the DOM.

> ## `displayExpectedTutors()`
> Displays the `expectedTutors` map.

> ## `updateTutorDisplay(email: str)`
> Update a specific tutor's display. `email` is used as the element ID.

> ## `displayErrors()`
> Display all tutors with errors.

> ## `displayTutors()`
> Display all tutors without errors.

> ## `displayAllTutors()`
> Wrapper to call `displayExpectedTutors()`,`displayErrors()`, and `displayTutors()`.

> ## `updateRoomDisplay(name: str)`
> Update a specific room's display. `name` is used as the element ID.

> ## `displayRooms()`
> Display all rooms from the `rooms` map.

> ## `displayBuildings()`
> Display all the objects in the `buildings` map. This will add buttons to filter rooms using [`filterRooms()`](../buttons/filter.md#filterroomsbuilding-str).