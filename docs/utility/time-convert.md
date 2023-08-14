# time-convert.js
[Back To Overview](../overview.md)

To compare time blocks are determine if they are overlapping, the times provided are converted to ints, representing the number of minutes since midnight. For example, "12:00 PM" would be converted to 720.

> ## `convertTimeToInt(time: str) -> number`
> Takes a string in the format "##:## [AM/PM]" and returns an integer representing the number minutes since midnight.
>
> **This function does not work for times from 12:00 AM to 12:59 AM. No times should be in that range, so this was left unfixed.**

> ## `convertTimeToStr(time: number) -> str`
> Takes an integer representing the number of minutes since midnight, and converts it to a string with the format "##:## [AM/PM]". This is the reverse operation of `convertTimeToInt()`.