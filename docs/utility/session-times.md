# session-times.js
[Back To Overview](../overview.md)

> ## `isValidSessionTime(day: str, sessionTime: number) -> bool`
> Determines whether a given session time is valid according to [the registrar schedule](https://registrar.ucsc.edu/soc/archive/html/fall2020/schedule_planner1.pdf). This function uses the `SessionTimes` enum located in [`globals.js`](../globals.md). The day should be "M", "Tu", "W", "Th", or "F". The sessionTime should be an int converted using [`convertTimeToInt()`](time-convert.md)