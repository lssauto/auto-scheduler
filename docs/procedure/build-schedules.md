# build-schedules.js
[Back To Overview](../overview.md)

Contains the main interface function for creating room assignments for tutors' sessions. The specific scheduling strategies are in [`schedulers.js`](schedulers.md). The strategies are based on position, and are tracked using the [`ScheduleBuilders`](../globals.md#schedulebuilders) map of function pointers.

> ## `buildSchedules()`
> ```
> For each tutor:
>    schedule tutors with preferences first
>    skip tutors with errors
>    
>    sessionCount = max # of session for each position
>    
>    for each Time in the tutor's Schedule:
>       skip Times that aren't sessions
>         and Times whose Courses should be scheduled yet
>       
>       pass Time to a specific scheduler
>       
>       update sessionCount according to result from scheduler
>    
>    schedule any discord hours the tutor might have
>    
>    mark the tutor's Courses as Scheduled
> ```