# Rooms

Rooms only consist of their schedules, their associated buildings, and some basic info like their names. The sub-class `RoomSchedule` is primarily implementing the specific requirements times need to meet to be scheduled in that room, which are different from the requirements for a tutor's schedule.

A key distinction that's made between rooms, is whether they represent actual rooms that LSS can schedule in, or represent registrar requests that need to be made. When a room is considered a registrar request room, it ignores the 4 session per day limit.

The `Building` class is used to organize rooms, and assign open times. The open times is set using an `AvailableRange` object. Attached to the `Rooms` class is a default range for normal rooms, and for registrar request rooms.

The `Rooms` singleton is responsible for managing both all Room and Building instances. The Rooms class will automatically add registrar request rooms to buildings that have no rooms associated with it. As soon as a room is added that can be associated with that building, its registrar request room will be destroyed.