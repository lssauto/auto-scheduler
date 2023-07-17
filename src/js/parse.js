// * contains functions for parsing raw table data into easier to use formats.

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

function BuildJSON(columns, data) {
    let objs = [];

    for (let i = 0; i < data.length; i++) {
        let obj = {
            times: []
        };

        // iterate through each column and fill obj with corresponding data
        for (let j = 0; j < columns.length; j++) {
            const title = columns[j].trim().toLowerCase();

            // column titles must include specific text to be recognized
            if (title.includes("timestamp")) {
                obj.timestamp = data[i][j].trim();

            } else if (title.includes("email address")) {
                obj.email = data[i][j].trim();

            } else if (title.includes("your name")) {
                obj.name = data[i][j].trim();

            } else if (title.includes("resubmission")) {
                obj.resubmission = data[i][j] == "Yes" ? true: false;

            } else if (title.includes("have you worked for lss")) {
                obj.returnee = data[i][j] == "Yes"? true: false;

            } else if (title.includes("what class are you submitting this availability form for")) {
                obj.class = data[i][j].trim().replace("–", "-"); // replace strange hyphen characters with dashes

            } else if (title.includes("lss position")) {
                obj.position = data[i][j].includes("Large") ? "LGT" : "SGT";

            } else if (title.includes("class meeting days and times")) {
                if (data[i][j] == "asynchronous") {
                    obj.lectures = [];
                } else {
                    obj.lectures = data[i][j].split(","); 
                }

            } else if (title.includes("office hours")) {
                if (data[i][j] == "" || data[i][j].includes("N/A")) {
                    obj.officeHours = [];
                } else {
                    obj.officeHours = data[i][j].split(",");
                }

            } else if (title.includes("discord support")) {
                if (data[i][j] == "" || data[i][j].includes("N/A")) {
                    obj.discord = [];
                } else {
                    obj.discord = data[i][j].split(",");
                }

            } else if (title.includes("anything else you want to let lss know?")) {
                obj.comments = data[i][j];

            } else { // session times
                if ( !(data[i][j] == "" || data[i][j].includes("N/A")) ) {
                    let schedule = true;
                    if (data[i][j + 1].trim().toLowerCase().includes("i'll book my own space") && obj.position == "SGT") { // only SGT can reserve their own rooms
                        schedule = false;
                    }
                    obj.times.push({time: data[i][j], schedule: schedule});
                }
                j++;
            }
        }
        objs.push(obj);
    }

    return objs;
}

// * ===========================================================================

// * use the json objs to create a map of tutors with key value pairs ("email": Tutor instance)
function BuildTutors(jsonObjs) {
    let tutorsMap = {};

    // build tutors
    for (let i = 0; i < jsonObjs.length; i++) {
        const row = jsonObjs[i];

        if (row.email in tutorsMap) {
            tutorsMap[row.email].Update(row);
        } else {
            let tutor = new Tutor(row);
            tutorsMap[tutor.email] = tutor;
        }
    }

    return tutorsMap;
}

// * ===========================================================================

// * Rooms

// create rooms map
function BuildRooms(matrix) {
    let roomsMap = {};

    let currentRoom = null;
    for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        
        // create a new room
        if (row[0] == "Room") {
            if (currentRoom != null) { // add the previous room to the map
                roomsMap[currentRoom.name] = currentRoom;
            }
            currentRoom = new Room(row[1]);
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
    roomsMap[currentRoom.name] = currentRoom; // flush last room to the map

    return roomsMap;
}