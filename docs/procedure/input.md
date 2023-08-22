# input.js
[Back To Overview](../overview.md)

Handles basic string organization (primarily splitting into matrices or lists) before passing them to object factories in [`parse.js`](parse.md).

> ## `handleInputSubmit()`
> Main interface function called by all input submit buttons. It will call specific strategies based on the button pressed, or the input stage the user is at. Each strategy expects the string gotten from the input field.