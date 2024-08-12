# Utilities

## Time Convert

`time-convert.ts` has several functions you can use to convert HH:MM times to integers, and back again. Times are converted to the number of minutes from midnight to make comparisons easier.

## Session Times

Used to validate a session's start and end times. Use the `quarter` argument to specify whether the function should use normal school year validation, or Summer session validation.

## Notify Event

While js has its own event type, it lacks a way to associate listeners to objects. This class is used to create events on objects separate from the DOM, and associate specific objects to listening functions. Any class that has an event, will usually have an addListener, removeListener, and dispatch method associated with that event.

## Variable Element

Variable elements are used to create HTML that updates with program state. They take an HTML element to wrap, a NotifyEvent to listen for, and an updateAction to take whenever the event is dispatched.

```
class MyComponent {
    value: string;
    textElem: VariableElement;

    onEdited: NotifyEvent = new NotifyEvent("onEdited");

    constructor(textValue: string) {
        const text = document.createElement("p");
        this.value = textValue;
        
        this.textElem = new VariableElement(text, onEdited, () => {
            text.innerHTML = this.value;
        });
    }

    // when the text value is updated, the onEdited event is dispatched,
    // which will cause the variable element to update
    updateText(textValue: string) {
        value = textValue;
        onEdited.dispatch(this);
    }
}
```