# parse.js
[Back To Overview](../overview.md)

Object factories for filling global variables.

> ## `parseExpectedTutors(matrix: array<array<str>>)`
> Fills [`expectedTutors`](../globals.md#global-variables) with objects for each tutor described in the matrix. The matrix is expected to have 4 columns: email, name, course ID, position. Each object created will have a map of {courseID: position}, for any tutors supporting multiple courses. If the `tutors` map has already been built, then it will update any tutors that were newly added. 

> ## `buildJSON(titles: array<str>, data: array<array<str>>)`
> Parses the tutor response form table, and builds objects to make the actual Tutor building process easier. Each column is stored in a field, and which field is used is determined by checking the corresponding column title from the `titles` array. This is done by comparing the column title to values in the [`Titles`](../globals.md#titles) enum. The objects are stored in an array to match the row ordering of the table, and this is assigned to the `tutorJSONObjs` global variable to be used for reconstructing the response table with updated values.

> ## `buildTutors(jsonObjs: array<obj>)`
> Fills the `tutors` map using the array of objects created by `buildJSON()`.

> ## `buildRooms(matrix: array<array<str>>)`
> Fills the `rooms` map using the matrix containing each room's schedule. The `requestRooms` map will also be filled based on which buildings didn't have any rooms.

> ## `parseBuildings(matrix: array<array<str>>)`
> Fills the `buildings` map with objects describing the time range each building is open.