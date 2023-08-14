# console.js
[Back To Overview](overview.md)

> ## `output(msg: obj)`
> Displays an object's fields as a message on the "console" div. Any msg object needs at least a `type` field. The `type` field will be used to determine what background color to give the message. Valid types are: "error", "warning", "info", and "success".

## ConsoleColors
The colors assigned to each message type:
- error: red
- warning: orange
- info: blue
- success: green

> ## `clearConsole()`
> Sets the console div's innerHTML to an empty string.