# popups.js
[Back To Overview](overview.md)

Creates the popups when enter the site, and when trying to exit. Password and scheduler name popups are created with the functions below. The "progress will be lost" popup is made with an event listener.

> ## `password()`
> Creates a simple popup that asks for a password. Will call `getSchedulerName()` if password is correct.

> ## `getSchedulerName()`
> Creates a popup asking for the scheduler's name. Stores response in the global variable `scheduler`.