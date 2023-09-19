// * contains functions for parsing raw table data into easier to use formats.

// * parses expected tutors, course and position

// ? each expected tutor will be in the form:
/* 
{ email: "string" , name: "string" , courses: {
        "ABC 123D-001": "position",
        ...
    }
}
*/

function parseTutorPositions(matrix) {

    if (tutorPositions == null) {
        tutorPositions = {};
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
        if (email in tutorPositions) {
            tutor = tutorPositions[email];
        } else {
            tutor = { email: email, name: row[1], courses: {} };
        }
        
        let position = matchPosition(row[3]);

        // course may or may not exist
        let course = null;
        if (CourselessPositions.includes(position)) {
            course = NA;
        
        } else {
            course = formatCourseID(row[2]);
            if (course == null) {
                output({
                    type: "warning", 
                    message: `Course could not be recognized, contents: ${row[2]}. Belonged to: ${row[1]} (${email}). Skipping to next row.`,
                    row: r + 1
                });
                continue;
            }
        }


        tutor.courses[course] = position;
        tutorPositions[email] = tutor;
    }

    // check tutors with new expected data
    if (tutors != null) {
        for (const email in tutorPositions) {
            if (email != tutors) {
                continue;
            } 

            let tutor = tutors[email];
            for (const courseID in tutor.courses) {
                let course = tutor.courses[courseID];

                if (!(courseID in tutorPositions[email].courses)) {
                    course.SetStatus(StatusOptions.WrongCourse);
                    output({
                        type: "warning", 
                        message: `${courseID} is not a recognized course for ${tutor.name} (${email}), or is incorrectly formatted. 
                            Expected one of these options: ${Object.keys(tutorPositions[email].courses)}. Tutor will be labeled as '${StatusOptions.WrongCourse}'.`,
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

function buildJSON(titles, data) {
    tutorJSONObjs = [];

    for (let i = 0; i < data.length; i++) {
        let obj = {
            row: i + 2,
            timestamp: "",
            email: "",
            name: "",
            resubmission: false,
            returnee: false,
            course: NA,
            position: DefaultPosition,
            lectures: [],
            officeHours: [],
            discord: [],
            times: [],
            comments: "",
            status: StatusOptions.InProgress,
            scheduler: scheduler
        };

        // iterate through each column and fill obj with corresponding data
        for (let j = 0; j < titles.length; j++) {
            const title = titles[j].trim().toLowerCase();

            // column titles must include specific text to be recognized
            if (title.includes(Titles.Timestamp)) {
                obj.timestamp = data[i][j].trim();

            } else if (title.includes(Titles.Email)) {
                if (!(data[i][j].trim() in tutorPositions)) {
                    output({
                        type: "warning", 
                        message: `${data[i][j].trim()} is not a recognized email within the tutor position list. 
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
                if ((obj.email in tutorPositions) && !(course in tutorPositions[obj.email].courses)) {
                    output({
                        type: "warning", 
                        message: `${data[i][j]} is not a recognized course for ${obj.name} (${obj.email}), or is incorrectly formatted. 
                            Expected one of these options: ${Object.keys(tutorPositions[obj.email].courses)}. Submission will be labeled as '${StatusOptions.WrongCourse}'.`,
                        row: i + 2
                    });
                    obj.status = StatusOptions.WrongCourse;
                }
                obj.course = course == null ? data[i][j].trim().replaceAll("–", "-").toUpperCase() : course;

            } else if (title.includes(Titles.Position)) {
                if (obj.email in tutorPositions && !ErrorStatus.includes(obj.status)) {
                    obj.position = tutorPositions[obj.email].courses[obj.course];
                } else {
                    obj.position = matchPosition(data[i][j]);
                }

            } else if (title.includes(Titles.Lectures)) {
                if (data[i][j] == "asynchronous") {
                    obj.lectures = [];
                } else {
                    obj.lectures = data[i][j].split(","); 
                }

            } else if (title.includes(Titles.OfficeHours)) {
                if (data[i][j] == "" || data[i][j].includes(NA)) {
                    obj.officeHours = [];
                } else {
                    obj.officeHours = data[i][j].split(",");
                }

            } else if (title.includes(Titles.Discord)) {
                if (data[i][j] == "" || data[i][j].includes(NA)) {
                    obj.discord = [];
                } else {
                    obj.discord = data[i][j].split(",");
                }

            } else if (title.includes(Titles.Comments)) {
                obj.comments = data[i][j];

            } else if (title.includes(Titles.Scheduler)) {
                obj.scheduler = data[i][j];

            } else if (title.includes(Titles.Status)) {
                if (obj.status == StatusOptions.InProgress) {
                    let statusFound = false;
                    for (const key in StatusKeys) {
                        if (data[i][j].toLowerCase().includes(StatusKeys[key])) {
                            obj.status = StatusOptions[key];
                            statusFound = true;
                            break;
                        }
                    }
                    if (data[i][j] != "" && !statusFound) {
                        output({
                            type: "warning", 
                            message: `Status of '${data[i][j]}' found in data, but this is not a valid status, so status will be replaced with '${obj.status}'.`,
                            row: i + 2
                        });
                    }
                } else {
                    output({
                        type: "warning", 
                        message: `Status of '${data[i][j]}' found in data, but an error was encountered 
                        at a different cell, so status will be replaced with '${obj.status}'.`,
                        row: i + 2
                    });
                }

            } else if (title.includes(Titles.SessionOption)) { // session times
                if ( !(data[i][j] == "" || data[i][j].includes(NA)) ) {
                    let schedule = true;
                    let field = data[i][j + 1].trim().toLowerCase();

                    let time = {time: data[i][j], schedule: schedule, room: null, row: i, col: j};

                    // only SGT can reserve their own rooms
                    if (( field.includes(RoomResponse.ScheduleByTutor) || field.includes(RoomResponse.AssignedToTutor) ) && SelfSchedulable.includes(obj.position)) { 
                        schedule = false;
                        if (field.includes(RoomResponse.AssignedToTutor)) time.room = data[i][j + 1];
                        
                    } else if (!field.includes(RoomResponse.ScheduleByLSS) && !field.includes(RoomResponse.ScheduleByTutor) && !field.includes(NA.toLowerCase())) {
                        time.room = data[i][j + 1];
                    }
                    time.schedule = schedule;
                    obj.times.push(time);
                }
                j++;
            }
        }
        //if ("comments" in obj) { // only add the object if row was completely read
        //    tutorJSONObjs.push(obj);
        //}
        tutorJSONObjs.push(obj);
    }
}

// * ===========================================================================

// * use the json objs to create a map of tutors with key value pairs ("email": Tutor instance)
function buildTutors(jsonObjs) {
    tutors = {};

    // build tutors
    for (let i = 0; i < jsonObjs.length; i++) {
        const row = jsonObjs[i];
        if (row.status == StatusOptions.PastSubmission) continue;

        if (row.email in tutors) {
            tutors[row.email].update(row);
        } else {
            let tutor = new Tutor(row);
            tutors[tutor.email] = tutor;
            positionsMap[row.position].push(tutor.email);
        }
    }
}

// * ===========================================================================

// * Rooms

// create rooms map
function buildRooms(matrix) {
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
                if (currentRoom.name.toLowerCase().includes("request")) {
                    requestRooms[currentRoom.name] = currentRoom;
                } else { // if room already exists, do not override the existing room's schedule
                    rooms[currentRoom.name] = currentRoom;
                }
            }
            let isRequestRoom = row[1].toLowerCase().includes("request");
            currentRoom = new Room(row[1], isRequestRoom); // 2nd element in the row should be the room name
            continue;
        }

        // add times to the current room's schedule
        const day = row[0].trim();
        if (day.match(/(M|Tu|W|Th|F|Sat|Sun)/) == null) {
            output({
                type: "warning", 
                message: `'${day}' could not be recognized as a valid day (M/Tu/W/Th/F/Sat/Sun). Skipping row.`,
                row: i
            });
        }
        for (let j = 1; j < row.length; j++) {
            if (row[j] == "") continue;

            const fields = row[j].split(",");
            if (fields.length < 3) {
                output({
                    type: "warning",
                    message: `A time in ${currentRoom.name}'s schedule is missing the needed fields. Expects: 'COURSE ID , name[optional] (email) , ##:## [AM/PM] - ##:## [AM/PM]'. Skipping time.`,
                    cell: `(${j + 1} , ${i + 1})`
                });
                continue;
            }
            const course = formatCourseID(fields[0].trim()) ?? fields[0].trim();
            const tutor = fields[1].split("(")[1].replace(")", "").trim(); // get just the email
            const time = fields[2].trim();

            let result = currentRoom.addTime(day + " " + time, course, tutor);
            if (result != null) {
                output({
                    type: "warning",
                    message: `The time at (${j} , ${i}) could not be added to the room. Schedule returned the error: ${result.error}. Time will be skipped.`
                })
            }
        }
    }
    if (!currentRoom.name.toLowerCase().includes("request")) rooms[currentRoom.name] = currentRoom; // flush last room to the map

    // add registrar request rooms
    for (let buildingName in buildings) {
        let building = buildings[buildingName];
        if (!building.hasRooms && !((FixedRooms.SpecificRequest + buildingName) in requestRooms)) {
            let requestRoom = new Room(FixedRooms.SpecificRequest + buildingName, true);
            requestRooms[requestRoom.name] = requestRoom;
        }
    }
    if (!((FixedRooms.Request) in requestRooms)) {
        let generalRequestRoom = new Room(FixedRooms.Request, true);
        requestRooms[generalRequestRoom.name] = generalRequestRoom;
    }
}

// * ===========================================================================

// * buildings

function parseBuildings(matrix) {
    if (buildings == null) {
        buildings = {};
    }

    for (let r = 0; r < matrix.length; r++) {
        let timeStr = matrix[r].length > 1 ? matrix[r][1] : "";

        let timeObj = parseTimeStr(timeStr, dayDefault=["M", "Tu", "W", "Th", "F", "Sun"]);
        let days = [];
        let start = 0;
        let end = 0;

        if (timeObj == null) {
            if (timeStr != "") {
                output({
                    type: "warning", 
                    message: `Improperly formatted hours for building: ${matrix[r][0]}. Defaulting to 8:00 AM - 9:00 PM.`,
                    expected: "##:## [AM/PM] - ##:## [AM/PM]"
                });
            }
            days = ["M", "Tu", "W", "Th", "F", "Sun"];
            start = convertTimeToInt("8:00 AM");
            end = convertTimeToInt("9:00 PM");
        } else {
            days = timeObj.days;
            start = timeObj.start;
            end = timeObj.end;
        }

        let building = {
            days: days,
            start: start, 
            end: end,
            hasRooms: false // used for determining if a registrar request room should be created
        }

        buildings[matrix[r][0]] = building;
    }
}