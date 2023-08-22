# search.js
[Back To Overview](../overview.md)

Search for a specific tutor or group of tutors using the input from the [`searchBar`](../elements.md) element.

> ## `scrollToTutor(email: str)`
> Does a smooth scroll to the div display the given tutor. `email` is used as the element ID.

> ## `searchTutors()`
> General interface for searching for specific tutors. This function is not split into different strategies, but could be.
>
> It will first check for exact matches to tutor emails, then if will search by name. If neither of those find a specific tutor, then tutors will be filtered by specific course IDs. If no tutors are found, then tutors will be filtered by department (the first group of capital letters in a course ID).