# schedule-actions.js
[Back To Overview](../overview.md)

Actions triggered by buttons generated from [`Schedule.display()`](../classes/schedule.md#display---str).

> ## `removeTime(containerID: str, day: str, i: int, updateStatus: bool)`
> Removes a time from a container. The `containerID` can be either a tutor's email, or a room's name. Different strategies are used for removing times from rooms vs tutors. `day` and `i` are used to find the specific time to remove from the container's schedule. `updateStatus` is a flag used to signal that any tutor's room assignments that would be affected by removing a time should have its status changed. This can be set to false for batch time removals to prevent repeated updates.
