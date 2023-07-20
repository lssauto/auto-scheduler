// fill buildings array
function handleBuildingsSubmit(inputText) {
    output({type: "info", message: "Parsing Building Data..."});

    if (inputText.includes("\t")) {
        output({type: "error", message: "Buildings should be separated by row."});
        return;
    }

    buildings = inputText.split("\n");
    displayBuildings(); // ? function located in display.js

    output({type: "success", message: "Buildings loaded successfully!"});
}

// * =================================================================

// Reads raw spreadsheet data from text field, and separates it into a matrix to create Room objects
function handleRoomSubmit(inputText) {
    output({type: "info", message: "Parsing Room Data..."});

    // build matrix
    let matrix = inputText.split("\n");
    for (let i = 0; i < matrix.length; i++) {
        matrix[i] = matrix[i].split("\t");
        for (let j = 0; j < matrix[i].length; j++) {
            matrix[i][j] = matrix[i][j].trim();
        }
    }
    console.log("Rooms Input:\n", matrix)

    // ? function located in parse.js
    rooms = BuildRooms(matrix); // ? global variable for containing Rooms

    displayRooms(); // ? function located in display.js

    output({type: "success", message: "Room Data parsed successfully!"});
}

// * =================================================================

function handleExpectedTutorsSubmit(inputText) {
    output({type: "info", message: "Parsing Expected Tutor Data..."});

    // build matrix
    let matrix = inputText.split("\n");
    for (let i = 0; i < matrix.length; i++) {
        matrix[i] = matrix[i].split("\t");
        for (let j = 0; j < matrix[i].length; j++) {
            matrix[i][j] = matrix[i][j].trim();
        }
    }
    console.log("Expected Tutor Input:\n", matrix);

    if (matrix[0].length != 4) {
        output({type: "error", message: "Expected tutor data should contain 4 rows: email, name, course, position"});
        return;
    }

    expectedTutors = parseExpectedTutors(matrix); // ? located in parse.js
    displayExpectedTutors(); // ? located in display.js
    output({type: "success", message: "Successfully parsed expected tutor data!"});
}

// * =================================================================

// Reads raw spreadsheet data from text field, and separates it into a matrix to create Tutor objects
function handleTutorSubmit(inputText) {
    output({type: "info", message: "Parsing Tutor Data..."});
    
    // find column titles
    let columnTitles = [];
    let buffer = ""; let i = 0;
    while (inputText[i] != '\n') {
        if (inputText[i] == '\t') {
            columnTitles.push(buffer);
            buffer = "";
            i++;
        }
        buffer += inputText[i];
        i++;
    }
    columnTitles.push(buffer); // flush buffer
    
    // build data field matrix
    let matrix = [];
    buffer = ""; i++; // reset buffer and skip over first /n
    columnCount = 1;  // makes sure all column fields are filled per row
    rowCount = 1;
    errors = []; // index list of flagged errors in input
    while (i < inputText.length) {
        if (inputText[i] == '\n' && columnCount >= columnTitles.length) {
            errors.push(columnCount > columnTitles.length);
            matrix.push(buffer);
            buffer = "";
            columnCount = 1;
            rowCount++;
            i++;
        }
        if (inputText[i] == '\t') columnCount++;
        if (columnCount > columnTitles.length) {
            output({type: "error", 
                message: `Too many columns counted in row: ${rowCount}. A tab character was likely input in a response. Remove the tab, and try again.`});
            return;
        }

        buffer += inputText[i];
        i++;
        
    }
    matrix.push(buffer);

    for (let j = 0; j < matrix.length; j++) {
        matrix[j] = matrix[j].split('\t');
    }
    console.log('Tutors Input:\n', matrix);
    
    // ? functions located in parse.js
    const jsonObjs = BuildJSON(columnTitles, matrix);
    output({type: "info", message: "Building initial tutor schedules..."});
    tutors = BuildTutors(jsonObjs); // ? global variable for containing Tutors

    displayTutors(); // ? function located in display.js

    output({type: "success", message: "Tutor Data parsed successfully!"});
}

// * =================================================================

function handleInputSubmit(event) {
    event.preventDefault(); // prevents the form from submitting and refreshing the page
    let field = document.getElementById('InputField');
    let inputText = field.value;
    field.value = ""; // clear
    autoResize("InputField");

    clearConsole();

    if (buildings == null) {
        handleBuildingsSubmit(inputText);
        InputSubmitButton.innerHTML = "Parse Room Schedules";
    } else if (rooms == null) {
        handleRoomSubmit(inputText);
        InputSubmitButton.innerHTML = "Parse Expected Tutor Courses and Positions";
    } else if (expectedTutors == null) {
        handleExpectedTutorsSubmit(inputText);
        InputSubmitButton.innerHTML = "Parse Tutor Form Responses";
    } else if (tutors == null) {
        handleTutorSubmit(inputText);
        field.style.display = "none";
        InputSubmitButton.style.display = "none";
        output({type: "success", message: "All data loaded successfully!"});
    }
}

// * =================================================================

// resizes the text area to show all contents
function autoResize(elementID) {
    let textarea = document.getElementById(elementID);
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to match the content
}

// submit button event listener
let InputSubmitButton = document.getElementById('InputSubmitButton');
InputSubmitButton.addEventListener('click', handleInputSubmit);

let ScheduleButton = document.getElementById('ScheduleButton');
ScheduleButton.addEventListener('click', BuildSchedules);

consoleDiv = document.getElementById('console');

headerDiv = document.getElementById('header');
contentDiv = document.getElementById('content');


SearchBar = document.getElementById('SearchBar');