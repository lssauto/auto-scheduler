// fill buildings array
function handleBuildingsSubmit(inputText) {
    output({type: "info", message: "Parsing Building Data..."});

    /*if (inputText.includes("\t")) {
        output({type: "error", message: "Buildings should be separated by row."});
        return;
    }*/

    let matrix = null;
    matrix = inputText.split("\n");
    for (let i = 0; i < matrix.length; i++) {
        if (matrix[i][0] == "\t") {
            matrix.splice(i, 1);
            i--;
            continue;
        } 
        matrix[i] = matrix[i].split("\t");
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] == "") {
                matrix[i].splice(j, 1);
                j--;
            }
        }
    }
    console.log(matrix);
    parseBuildings(matrix);
    
    displayBuildings(); // ? function located in display.js

    // check if any rooms can have buildings assigned to them
    if (rooms != null) {
        for (let roomID in rooms) {
            rooms[roomID].checkForBuilding();
        }
        displayRooms();
    }

    output({type: "success", message: "Buildings loaded successfully!"});
}

// * =================================================================

// Reads raw spreadsheet data from text field, and separates it into a matrix to create Room objects
function handleRoomSubmit(inputText) {
    if (rooms != null) {
        let option = window.confirm("Any room's schedule parsed from this submission will replace its current schedule. Do you want to continue?");
        if (!option) {
            output({type: "warning", message: "Quitting parsing process."});
            return;
        }
        output({type: "warning", message: "Replacing select room schedules."});
    }

    output({type: "info", message: "Parsing Room Data..."});

    // build matrix
    let matrix = inputText.split("\n");
    for (let i = 0; i < matrix.length; i++) {
        if (matrix[i][0] == "\t") {
            matrix.splice(i, 1);
            i--;
            continue;
        }
        matrix[i] = matrix[i].split("\t");
        for (let j = 0; j < matrix[i].length; j++) {
            matrix[i][j] = matrix[i][j].trim();
        }
    }
    console.log("Rooms Input:\n", matrix);

    // ? function located in parse.js
    buildRooms(matrix);

    displayRooms(); // ? function located in display.js

    output({type: "success", message: "Room Data parsed successfully!"});
}

// * =================================================================

function handleTutorPositionSubmit(inputText) {
    output({type: "info", message: "Parsing Tutor Position Data..."});

    // build matrix
    let matrix = inputText.split("\n");
    for (let i = 0; i < matrix.length; i++) {
        if (matrix[i][0] == "\t") {
            matrix.splice(i, 1);
            i--;
            continue;
        }
        matrix[i] = matrix[i].split("\t");
        for (let j = 0; j < matrix[i].length; j++) {
            matrix[i][j] = matrix[i][j].trim();
            if (matrix[i][j] == "") {
                matrix[i].splice(j, 1);
                j--;
            }
        }
    }
    console.log("Tutor Position Input:\n", matrix);

    if (matrix[0].length != 4) {
        output({type: "error", message: "Tutor position data should contain 4 rows: email, name, course, position"});
        return;
    }

    parseTutorPositions(matrix); // ? located in parse.js
    displayTutorPositions(); // ? located in display.js
    output({type: "success", message: "Successfully parsed tutor position data!"});
}

// * =================================================================

// Reads raw spreadsheet data from text field, and separates it into a matrix to create Tutor objects
function handleTutorSubmit(inputText) {
    if (tutors != null) {
        let option = window.confirm("This will erase the current tutor list. Do you want to continue?");
        if (!option) {
            output({type: "warning", message: "Current tutor data will NOT be erased, quitting parsing process."});
            return;
        }
        output({type: "warning", message: "Current tutor response data has be erased, parsing new data set."});
    }

    output({type: "info", message: "Parsing Tutor Data..."});
    
    // find column titles
    let columnTitles = [];
    let buffer = ""; let i = 0;
    while (true) {
        if (i == inputText.length) {
            output({
                type: "error",
                message: "Failed to parse column titles. The end of the input text was reached. This probably means the '" + Titles.Scheduler + "' column was not last."
            });
            return;
        }
        if (inputText[i] == "\n" && buffer.toLowerCase().includes(Titles.Scheduler)) {
            columnTitles.push(buffer);
            buffer = "";
            i++;
            break;
        }
        if (inputText[i] == "\t") {
            if (buffer == "\t") break;
            columnTitles.push(buffer);
            buffer = "";
            i++;
        }
        buffer += inputText[i];
        i++;
    }
    if (buffer != "" || buffer != "\t" ) columnTitles.push(buffer); // flush buffer
    for (let j = 0; j < columnTitles.length; j++) {
        if (columnTitles[j] == "\t" || columnTitles[j] == "") {
            columnTitles.splice(j, 1);
            j--;
        } 
    }

    responseColumnTitles = columnTitles;
    
    // build data field matrix
    let matrix = [];
    buffer = "";
    //i++; // skip over first newline
    columnCount = 1;  // makes sure all column fields are filled per row
    rowCount = 1;
    while (i < inputText.length) {
        if (inputText[i] == '\n' && columnCount >= columnTitles.length) {
            matrix.push(buffer);
            buffer = "";
            columnCount = 1;
            rowCount++;
            i++;
        }
        if (inputText[i] == "\t") {
            if (buffer == "") break; // exit if next row is empty
            columnCount++;
        }
        if (columnCount > columnTitles.length) {
            output({type: "error", 
                message: `Too many columns counted in row: ${rowCount}. A tab character was likely input in a response. Remove the tab, and try again. Multiple empty columns might have also been included.`});
            return;
        }

        buffer += inputText[i];
        i++;
        
    }
    if (buffer != "" || buffer != "\t") matrix.push(buffer);

    for (let i = 0; i < matrix.length; i++) {
        matrix[i] = matrix[i].split('\t');
    }
    console.log('Tutors Input:\n', matrix);

    tutorMatrix = matrix;
    
    // ? functions located in parse.js
    buildJSON(columnTitles, matrix);
    console.log('jsonObjs:\n', tutorJSONObjs);
    output({type: "info", message: "Building initial tutor schedules..."});
    buildTutors(tutorJSONObjs);

    displayAllTutors(); // ? function located in display.js
    displayRooms();

    output({type: "success", message: "Tutor Data parsed successfully!"});
}

// * =================================================================

function handleInputSubmit(event) {
    event.preventDefault(); // prevents the form from submitting and refreshing the page
    let field = document.getElementById('InputField');
    let inputText = field.value;
    field.value = ""; // clear
    autoResize("InputField");

    if (inputText == "") {
        output({type: "error", message: "Input field is empty."});
        return;
    }

    clearConsole();

    if (buildings == null || event.srcElement.id == 'BuildingSubmitButton') {
        if (buildings == null) {
            inputSubmitButton.innerHTML = "Parse Room Schedules";
            buildingSubmitButton.style.display = "inline";
        }
        handleBuildingsSubmit(inputText);

    } else if (rooms == null || event.srcElement.id == 'RoomSubmitButton') {
        if (rooms == null) {
            inputSubmitButton.innerHTML = "Parse Tutor Positions";
            roomSubmitButton.style.display = "inline";
        }
        handleRoomSubmit(inputText);

    } else if (tutorPositions == null || event.srcElement.id == 'PositionSubmitButton') {
        if (tutorPositions == null) {
            inputSubmitButton.innerHTML = "Parse Tutor Responses";
            positionSubmitButton.style.display = "inline";
        }
        handleTutorPositionSubmit(inputText);

    } else if (tutors == null || event.srcElement.id == 'TutorSubmitButton') {
        if (tutors == null) {
            tutorSubmitButton.style.display = "inline";
            inputSubmitButton.style.display = "none";
        }
        handleTutorSubmit(inputText);
    }

    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
}

// * =================================================================