# time-convert.js
[Back To Overview](../overview.md)

To compare time blocks are determine if they are overlapping, the times provided are converted to ints, representing the number of minutes since midnight. For example, "12:00 PM" would be converted to 720.

> ## `convertTimeToInt(time: str) -> number`
> Takes a string in the format "##:## [AM/PM]" and returns an integer representing the number minutes since midnight.
>
> **This function does not work for times from 12:00 AM to 12:59 AM. No times should be in that range, so this was left unfixed.**

> ## `convertTimeToStr(time: number) -> str`
> Takes an integer representing the number of minutes since midnight, and converts it to a string with the format "##:## [AM/PM]". This is the reverse operation of `convertTimeToInt()`.

> ## `parseTimeStr(timeStr: str, dayDefault: array) -> object | null`
> Parses a given string in the format `"[Days] ##:## [AM/PM] - ##:## [AM/PM]`, and returns an object containing the fields: `days`, and array of day names; `start`, an int converted with `convertTimeToInt()`; and `end`, and int converted with `convertTimeToInt()`. 
>
> If there are no day names included in `timeStr`, then `days` will be set to `dayDefault`. If an end time isn't given in `timeStr`, then `end` will be set to an hour after `start` (`start + 60`).
>
> If `timeStr` cannot be parsed, then `null` will be returned.