# Scheduling

`Scheduler.scheduleAll()` is the main interface to actually assign sessions to rooms. you can refer to the user docs "Scheduling Strategy" section for pseudo-code of the actual scheduling progress. That describes both what's happening in the `Scheduler`, and the `defaultScheduler()`.

A design decision that was made earlier on when we were thinking of having different approaches to scheduling for different positions was to make scheduling strategies. Each position has a function pointer set in the [Positions class](../src/ts/positions.ts), but they are all set to the default scheduler. If you want to create new procedures for scheduling different positions, you would create a scheduling strategy, and set that position's `scheduler` to it.

During scheduling, the tutor currently getting scheduled will have a `SessionCounts` object tracking the number of sessions that have been assigned rooms, or set as registrar requests. Sessions aren't iterated through based on course, but by day. So if a tutor is supporting multiple classes, all of the classes are being scheduled for at the same time. This is what the `sessionCounts` object is for in the `scheduleTutor()` function. It will be tracking the progress for each course as the tutor is getting scheduled.

The purpose of a scheduling strategy is to be given a session, attempt to assign it to a room, and then return the result as a `ScheduledState` value. Based off of the value return, the session counts will be updated for the course that session belongs to.