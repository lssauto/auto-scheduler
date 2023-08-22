# tutor-actions.js
[Back To Overview](../overview.md)

Actions triggered by buttons generated from [`Tutor.display()`](../classes/tutor.md#display---str).

> ## `ignoreError(email: str, courseID: str, i: int, updateDisplay: bool)`
> Ignores the error, and adds it to the tutor's schedule. The `updateDisplay` flag is used to signal if the tutor's div should have its content updated. This can be set to `false` for batch ignores to prevent repeated DOM updates.

> ## `removeError(email: str, courseID: str, i: int, updateDisplay: bool)`
> Removes the error. The `updateDisplay` flag is used to signal if the tutor's div should have its content updated. This can be set to `false` for batch removes to prevent repeated DOM updates.

> ## `setBuildingPreference(email: str, course: str)`
> Sets a Tutor's Course's building preference to the building selected in the Course display's preference dropdown menu.

> ## `setStatus(email: str, course: str, updateDisplay: bool)`
> Sets a Tutor's Course's status to the option selected in the Course display's status dropdown menu. `updateDisplay` flag is used to signal if the tutor's display div should be updated.

> ## `removeCourse(email: str, course: str, updateDisplay: bool)`
> Removes a Course from a tutor's courses map. `updateDisplay` flag is used to signal if the tutor's display div should be updated.

> ## `copySlackNote(name: str, courseID: str)`
> Copy a note to the user's clipboard to be pasted to Slack.