# course-id.js
[Back To Overview](../overview.md)

Used to fix the formatting of course IDs to ensure consistent string comparison.

> ## `formatCourseID(courseStr: str) -> str`
> Formats `courseStr` to follow the format: `[DEP] [COURSE NO.]-[SECTION]`. Some courses are "doubled up", which is represented with a "/" between the two different course IDs, for example `"POLI 120B-001/LGST 120B-001"`. The formatted course ID is returned. If `coursStr` doesn't follow any recognizable formatting, then "N/A" is returned instead.