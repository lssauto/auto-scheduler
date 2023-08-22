// ensures that course IDs follow specific formatting so that they can be matched against each other
function formatCourseID(courseStr) {
    let courseId = courseStr.trim().replaceAll("–", "-"); // replace strange hyphen characters with dashes

    if (courseId == "" || courseId == NA) return NA; // if position is courseless

    let departments = courseId.match(/[A-Z]{2,4}/g);
    let sections = courseId.match(/[0-9]{1,3}[A-Z]*([\s]*-[\s]*([0-9]{1,3}|\(All Sections\)))?/g);
    
    if (departments == null || sections == null) {
        return null;
    }

    let course = "";
    for (let i = 0; i < sections.length; i++) {
        if (i > 0) course += "/";

        course += departments[i] + " ";

        courseNums = sections[i].split("-");

        course += courseNums[0].trim().replace(/^0+/, '') + "-";

        if (courseNums.length == 1) {
            course += "001";
        } else if (courseNums[1].match(/[a-z]/g) != null) { // if the section # contains letters, it's "All Sections"
            course += "(All Sections)";
        } else {
            courseNums[1] = courseNums[1].trim();
            course += "0".repeat(3 - courseNums[1].length) + courseNums[1];
        }  
    }

    return course;
}