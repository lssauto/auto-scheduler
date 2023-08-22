# filter.js
[Back To Overview](../overview.md)

Filter tutors and rooms displayed based on specific criteria.

## Tutor Filtering

> ### `filterTutors()`
> Uses the selection from `filterOptions` dropdown menu. Depending on the selection, the tutor info displayed will be filtered. Uses different strategies for each filter option. Theses strategies will update the HTML divs directly.

## Room Filtering

> ### `filterRooms(building: str)`
> Displays only rooms that are part of the given building.