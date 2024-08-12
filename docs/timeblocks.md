# Time Blocks

Time blocks are easily the most complicated objects in this project. They store all of the state for individual times contained in schedules. Importantly, values like the tutor, room, and course are stored as string keys, instead of object references. This is because those values don't necessarily have to be related to objects that exist in the program state. For example, the tutor email could be set to "EOP", which doesn't actually belong to any tutor object. Because of this decision, the setters and getters in this class often have side-effects that can be confusing to unravel, and will reference the `Tutors` and `Rooms` singleton instances.

Besides program state, this class also manages its own display state. Each time block can have a tutor div, and a room div. This is so the same program state is connected to the same HTML elements that they represent.

- `setTutor(string | null)`: Setting this to null effectively removes the tutor assignment. It will destroy the tutor div element, and if the time doesn't have a room assignment, will delete itself entirety, triggering the time block's onDeleted event.

- `setRoom(string | null)`: Setting this to null has the same side-effects as with `setTutor()`. When the room is a string, then the time block will subscribe to that room's onDeleted event. When that room is deleted, then the time block will remove the room assignment itself.

- `setCourse(string | null)`: Setting this to a course ID will have the time block attempt to subscribe to the corresponding course object's events.

Time blocks have several to string methods that are used for output. In the code they are all collected in the "string builders" section.

Below that are some comparison methods that take either another time block, or a templated object that can be used to compare values without needing to create a time block instance.

To build time blocks, you should use the `TimeBlock.buildTimeBlock()` method. It takes a config object, which will require all of the necessary values for setting up a time block. The same template is used for `timeBlock.update()`, which is used for mass updating the state of a time.