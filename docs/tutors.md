# Tutors

The `Tutor` class is made up of 2 main parts, the tutor's course list, and their schedule. 

Courses are mapped by their course ID. Each `Course` represents the current scheduling state for one position that tutor holds. To create a new course, use `Course.buildCourse()`, which will require a `CourseConfig` object to provide the minimum information needed for a course. Courses also organize times that belong to it. This is done with a map where the keys are `Tags` (a.k.a. the type of time block: session, lecture, reservation, error, etc.). This doubles as a way to separate errors from other times, as well as a way to iterate through specific types of times.

Tutors are managed by the `Tutors` singleton. Here, they are mapped by email, and also position. Tutors can also be filtered with a `TutorFilterOption`, which will ask for an `include` function. This will take a tutor, and return true or false for whether that tutor should be included in the filter. Then, apply the filter using 

```
const myFilter: TutorFilterOption = {
    "My Filter",
    (tutor) => { 
        return true; 
    }
};
Tutors.instance!.filter(myFilter);
```