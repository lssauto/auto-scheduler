// * contains functions for parsing raw table data into easier to use formats.

// ensures that course IDs follow specific formatting so that they can be matched against each other
function formatCourseID(courseStr) {
    let courseId = courseStr.trim().replaceAll("–", "-"); // replace strange hyphen characters with dashes

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

// * parses expected tutors, course and position

// ? each expected tutor will be in the form:
/* 
{ email: "string" , courses: {
        "ABC 123D-001": "position",
        ...
    }
}
*/

function parseExpectedTutors(matrix) {

    if (expectedTutors == null) {
        expectedTutors = {};
    }

    for (let r = 0; r < matrix.length; r++) {
        const row = matrix[r];

        // get email
        let email = row[0].match(/^([a-zA-Z0-9]+@ucsc.edu)/g);
        if (email == null) {
            output({
                type: "warning", 
                message: `No email found, contains: ${row[0]}. Skipping to next row.`,
                row: r + 1
            });
            continue;
        }

        email = email[0]; // set email to just the string, not a list

        if (email != row[0]) {
            output({
                type: "warning", 
                message: `Email was found, but is not exact contents: ${row[0]}. Email found: ${email}. Continuing with found email.`,
                row: r + 1
            });
        }

        let tutor = null;
        if (email in expectedTutors) {
            tutor = expectedTutors[email];
        } else {
            tutor = { email: email, name: row[1], courses: {} };
        }

        // ensure course id follows specific formatting
        let course = formatCourseID(row[2]);
        if (course == null) {
            output({
                type: "warning", 
                message: `Course could not be recognized, contents: ${row[2]}. Belonged to: ${row[1]} (${email}). Skipping to next row.`,
                row: r + 1
            });
            continue;
        }
        //console.log(course);

        let position = row[3].includes("Large") ? Positions.LGT : Positions.SGT; // TODO: add writing and study hall tutors

        tutor.courses[course] = position;
        expectedTutors[email] = tutor;
    }

    // check tutors with new expected data
    if (tutors != null) {
        for (const email in expectedTutors) {
            if (email != tutors) {
                continue;
            } 

            let tutor = tutors[email];
            for (const courseID in tutor.courses) {
                let course = tutor.courses[courseID];

                if (!(courseID in expectedTutors[email].courses)) {
                    course.SetStatus(StatusOptions.WrongCourse);
                    output({
                        type: "warning", 
                        message: `${courseID} is not a recognized course for ${tutor.name} (${email}), or is incorrectly formatted. 
                            Expected one of these options: ${Object.keys(expectedTutors[email].courses)}. Tutor will be labeled as '${StatusOptions.WrongCourse}'.`,
                        row: course.row
                    });

                } else if (course.status == StatusOptions.WrongCourse || course.status == StatusOptions.Missing) {
                    course.SetStatus(StatusOptions.NoErrors);
                }
            }
        }
    }
}

// * ====================================================================

// * separate raw data into json objects to make building Tutor class instances easier
// ? json objects will have fields:
// ?  1. stamp - timestamp for when the response was submitted
// ?  2. email - tutor's email address
// ?  3. name - tutor's first and last name
// ?  4. resubmission - whether this is a resubmission
// ?  5. returnee - whether this is a returning tutor
// ?  6. class - class tutor is submitting this form for
// ?  7. position - position tutor is submitting this form for
// ?  8. lectures - list of lecture times, split by ","
// ?  9. officeHours - list of office hours, split by ","
// ?  10. discord - list of discord times, split by ","
// ?  11. times - list of sessions times in format {time: "response string", schedule: bool}, schedule says whether lss needs to schedule the session

function BuildJSON(titles, data) {
    let objs = [];

    for (let i = 0; i < data.length; i++) {
        let obj = {
            times: []
        };
        obj.row = i + 2; // row number of table
        obj.status = StatusOptions.InProgress;

        // iterate through each column and fill obj with corresponding data
        for (let j = 0; j < titles.length; j++) {
            const title = titles[j].trim().toLowerCase();

            // column titles must include specific text to be recognized
            if (title.includes(Titles.Timestamp)) {
                obj.timestamp = data[i][j].trim();

            } else if (title.includes(Titles.Email)) {
                if (!(data[i][j].trim() in expectedTutors)) {
                    output({
                        type: "warning", 
                        message: `${data[i][j].trim()} is not a recognized email within the expected tutors list. 
                        This tutor will be included, but not checked for correct course ID and position.`,
                        row: i + 2
                    });
                    obj.status = StatusOptions.Missing;
                }
                obj.email = data[i][j].trim();

            } else if (title.includes(Titles.Name)) {
                obj.name = data[i][j].trim();

            } else if (title.includes(Titles.Resubmission)) {
                obj.resubmission = data[i][j] == "Yes" ? true: false;

            } else if (title.includes(Titles.Returnee)) {
                obj.returnee = data[i][j] == "Yes"? true: false;

            } else if (title.includes(Titles.CourseID)) {
                let course = formatCourseID(data[i][j]);
                if ((obj.email in expectedTutors) && !(course in expectedTutors[obj.email].courses)) {
                    output({
                        type: "warning", 
                        message: `${data[i][j]} is not a recognized course for ${obj.name} (${obj.email}), or is incorrectly formatted. 
                            Expected one of these options: ${Object.keys(expectedTutors[obj.email].courses)}. Submission will be labeled as '${StatusOptions.WrongCourse}'.`,
                        row: i + 2
                    });
                    obj.status = StatusOptions.WrongCourse;
                }
                obj.class = course == null ? data[i][j].trim().replace("–", "-").toUpperCase() : course;

            } else if (title.includes(Titles.Position)) {
                if (obj.email in expectedTutors && !ErrorStatus.includes(obj.status)) {
                    obj.position = expectedTutors[obj.email].courses[obj.class];
                } else {
                    obj.position = data[i][j].includes("Large") ? "LGT" : "SGT";
                }

            } else if (title.includes(Titles.Lectures)) {
                if (data[i][j] == "asynchronous") {
                    obj.lectures = [];
                } else {
                    obj.lectures = data[i][j].split(","); 
                }

            } else if (title.includes(Titles.OfficeHours)) {
                if (data[i][j] == "" || data[i][j].includes("N/A")) {
                    obj.officeHours = [];
                } else {
                    obj.officeHours = data[i][j].split(",");
                }

            } else if (title.includes(Titles.Discord)) {
                if (data[i][j] == "" || data[i][j].includes("N/A")) {
                    obj.discord = [];
                } else {
                    obj.discord = data[i][j].split(",");
                }

            } else if (title.includes(Titles.Comments)) {
                obj.comments = data[i][j];

            } else if (title.includes(Titles.Scheduler)) {
                obj.scheduler = data[i][j];

            } else if (title.includes(Titles.Status)) {
                if (obj.status == StatusOptions.InProgress && data[i][j] != "") {
                    obj.status = data[i][j];
                } else if (obj.status != StatusOptions.InProgress) {
                    output({
                        type: "warning", 
                        message: `Status of '${data[i][j]}' found in data, but an error was encountered 
                        at a different cell, so status will be replaced with '${obj.status}'.`,
                        row: i + 2
                    });
                }

            } else if (title.includes(Titles.SessionOption)) { // session times
                if ( !(data[i][j] == "" || data[i][j].includes("N/A")) ) {
                    let schedule = true;
                    let field = data[i][j + 1].trim().toLowerCase();

                    let time = {time: data[i][j], schedule: schedule, room: null};

                    // only SGT can reserve their own rooms
                    if (( field.includes(RoomResponse.ScheduleByTutor) || field.includes(RoomResponse.AssignedToTutor) ) && obj.position == Positions.SGT) { 
                        schedule = false;
                        if (field.includes(RoomResponse.AssignedToTutor)) time.room = data[i][j + 1];
                        
                    } else if (!field.includes(RoomResponse.ScheduleByLSS) && !field.includes(RoomResponse.ScheduleByTutor) && !field.includes("n/a")) {
                        time.room = data[i][j + 1];
                    }
                    time.schedule = schedule;
                    obj.times.push(time);
                }
                j++;
            }
        }
        if ("comments" in obj) { // only add the object if row was completely read, comments is the last column
            objs.push(obj);
        }
    }

    return objs;
}

// * ===========================================================================

// * use the json objs to create a map of tutors with key value pairs ("email": Tutor instance)
function BuildTutors(jsonObjs) {
    if (tutors == null) {
        tutors = {};
    }

    // build tutors
    for (let i = 0; i < jsonObjs.length; i++) {
        const row = jsonObjs[i];

        if (row.email in tutors) {
            tutors[row.email].Update(row);
        } else {
            let tutor = new Tutor(row);
            tutors[tutor.email] = tutor;
        }
    }
}

// * ===========================================================================

// * Rooms

// create rooms map
function BuildRooms(matrix) {
    if (rooms == null) {
        rooms = {};
        requestRooms = {};
    }

    let currentRoom = null;
    for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        
        // create a new room
        if (row[0] == "Room") {
            if (currentRoom != null) { // add the previous room to the map
                if (!(currentRoom.name in rooms)) { // if room already exists, do not override the existing room's schedule
                    rooms[currentRoom.name] = currentRoom;
                }
            }
            currentRoom = new Room(row[1]); // 2nd element in the row should be the room name
            continue;
        }

        // add times to the current room's schedule
        const day = row[0].trim();
        for (let j = 1; j < row.length; j++) {
            if (row[j] == "") continue;

            const fields = row[j].split(",");
            const course = fields[0].trim();
            const tutor = fields[1].split("(")[1].replace(")", "").trim(); // get just the email
            const time = fields[2].trim();

            currentRoom.addTime(day + " " + time, course, tutor);
        }
    }
    rooms[currentRoom.name] = currentRoom; // flush last room to the map

    // add registrar request rooms
    for (let buildingName in buildings) {
        let building = buildings[buildingName];
        if (!building.hasRooms) {
            let requestRoom = new Room("Request Room In " + buildingName, true);
            requestRooms[requestRoom.name] = requestRoom;
        }
    }
    let generalRequestRoom = new Room("Request From Registrar", true);
    requestRooms[generalRequestRoom.name] = generalRequestRoom;
}

// * ===========================================================================

// * buildings

function parseBuildings(matrix) {
    if (buildings == null) {
        buildings = {};
    }

    for (let r = 0; r < matrix.length; r++) {
        let timeStr = matrix[r][1];

        let halves = timeStr.split(":");
        let days = halves[0].match(/(M|Tu|W|Th|F|Sat|Sun)/g); // get all days
        let hours = timeStr.match(/[0-9]{1,2}:[0-9]{1,2}[\s]*(AM|PM|am|pm)/g); // get all hours

        // if there are no days, then this is a Sun time
        if (days == null) { days = ["M", "Tu", "W", "Th", "F", "Sun"]; }

        if (hours == null || hours.length < 2) {
            if (hours != null && hours.length < 2) {
                output({
                    type: "warning", 
                    message: `Improperly formatted hours for building: ${matrix[r][0]}. Defaulting to 8:00 AM - 9:00 PM.`,
                    expected: "##:## [AM/PM] - ##:## [AM/PM]"
                });
            }
            hours = [
                "8:00 AM",
                "9:00 PM"
            ];
        }

        // add AM or PM to first time if it's missing
        if (hours[0].match(/(AM|PM|am|pm)/g) == null) {
            if (hours[1].split(":")[0].trim() == "12") {
                hours[0] += hours[1].match(/(AM|am)/g) == null ? "AM" : "PM";
            } else {
                hours[0] += hours[1].match(/(AM|am)/g) == null ? "PM" : "AM";
            }
        }

        // get int time values
        const start = convertTimeToInt(hours[0]);
        const end = hours.length > 1 ? convertTimeToInt(hours[1]) : start + 60; // add 60 minutes if no second time

        let building = {
            days: days,
            start: start, 
            end: end,
            hasRooms: false // used for determining if a registrar request room should be created
        }

        buildings[matrix[r][0]] = building;
    }
}