# schedule-actions.js
[Back To Overview](../overview.md)

Actions triggered by buttons generated from [`Time.getFullStr()`](../classes/time.md#getfullstr---str).

> ## `changeTime(email: str, timeID: int)`
> Changes the day, start, and end of a time. `email` is used to get the specific tutor this time belongs to, and `timeID` is used to find the exact time that should be changed.
>
> This only works for session times. If a time is changed, and the tutor has room assignments, then their status will be changed back to `Scheduling In Progress`.