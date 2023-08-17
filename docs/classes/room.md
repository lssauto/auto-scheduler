# room.js
[Back To Overview](../overview.md)

Each Room has a Schedule to track what sessions have been scheduled in it.  Rooms are stored in the `rooms` and `requestRooms` global variables. These are maps where the room names are keys.

## Attributes

- `name: str`: the name of the room.

- `type: Positions | null`: the type of room. Used to determine which positions can be scheduled in the room. Value should be from the [`Positions`](../globals.md#positions) enum. `null` is used to indicate the room doesn't have a type.

- `schedule: Schedule`: a reference to the Schedule associated with the room.

- `building: str | null`: the name of the building the room belongs to. `null` is used to indicate the room isn't part of a known building.

## Methods

> ### `Room(name: str, isRequestRoom: bool) -> Room`
> Constructor for the Room class. This will determine the type of the Room by searching for a value from the[`PositionKeys`](../globals.md#positionkeys) enum included in the name. `isRequestRoom` is used to signal that the room should not have a `type`, and should not mark any buildings as having rooms.

> ### `checkForBuilding(isRequestRoom: bool)`
> Checks if the room belongs to a building. If it does, then set the Room's building, `schedule`'s valid time range, and the building's `hasRoom` property at true (only if `isRequestRoom` is true).

> ### `addTime(timeStr: str, course: str, tutor: str) -> object | null`
> A wrapper around [`schedule.addTime()`](schedule.md#addtimetimestr-str-course-str-tag-tags-tutor-str-schedulebylss-bool---object--null).

> ### `display() -> str`
> Returns a string containing HTML to display info about the room.