# elements.js
[Back To Overview](overview.md)

Contains most of the definitions for variables referencing HTML elements. This doesn't include the buttons used in [section-switch.js](buttons/section-switch.md).

> ## `autoResize(elementID: str)`
> Used to auto resize the input field to match the scroll height.

## Input Field Submit Buttons

- `inputSubmitButton`: the green button used to submit the next step of data parsing.
- `buildingSubmitButton`: add new buildings
- `roomSubmitButton`: add new rooms
- `expectedSubmitButton`: add new expected tutor responses.
- `tutorSubmitButton`: add new tutor responses.

## Header And Tools

- `consoleDiv`: the div containing messages displayed using [`output()`](console.md).
- `searchBar`: the input field used by [`searchTutors()`](buttons/search.md).
- `filterOptions`: the dropdown menu used by [`filterTutors()`](buttons/filter.md). The tutor positions defined in [`globals.js`](globals.md#Positions).
- `copyTutorTableButton`: calls [`copyTutorTable()`](procedure/copy.md).
- `copyTutorSchedulesButton`: calls [`copyTutorSchedules()`](procedure/copy.md).
- `roomCopyButton`: calls [`copyRoomSchedules()`](procedure/copy.md).

## Content Divs

- `buildingContainer`: displays building list. Used by [`displayBuildings()`](procedure/display.md).
- `roomContainer`: displays room schedules. Used by [`displayRooms()`](precedure/display.md).
- `expectedTutorContainer`: displays the expected tutor responses. Used by [`displayExpectedTutors()`](precedure/display.md).
- `tutorContainer`: displays tutors without errors. Used by [`displayTutors()`](precedure/display.md).
- `errorsContainer`: displays tutors with errors. Used by [`displayErrors()`](precedure/display.md).