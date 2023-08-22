# schedulers.js
[Back To Overview](../overview.md)

The specific scheduling strategies used by [`buildSchedules()`](build-schedules.md). Each strategy expects 3 arguments: 
- `tutor` a reference to the Tutor instance being scheduled for, 
- `session` a reference to the Time instance being assigned a room,
- and `courseSessionCount` the current number of sessions that have been scheduled for the course this session belongs to. 

They will then return a result code:
- `NO_SESSION`: session was not assigned a room.
- `TUTOR_SCHEDULED`: the tutor is scheduling a room themselves.
- `REQUEST`: the room requires a registrar request.
- `SCHEDULED`: the session had a room assigned to it


> ## `defaultScheduler(tutor: Tutor, session: Time, courseSessionCount: int) -> int`
> 1. Check if the session time is taken on a different day.
> 2. Check if another tutor supporting the same course has the same time assigned already.
> 3. Check if the tutor wants to schedule the session themselves.
> 4. Check if the tutor has a building preference.
>
> To Check each room:
> 1. Check if room matches the tutor's position
> 2. Try to add the session time to the room's schedule (checks for conflicting times).
> 3. If `null` is returned the session was assigned successfully.
>
> If no rooms are available default to registrar request.

> ## `writingScheduler(tutor: Tutor, session: Time, courseSessionCount: int) -> int`
> 1. Check if the session time is taken on a different day.
> 2. Assign as tutor is scheduling room themselves.