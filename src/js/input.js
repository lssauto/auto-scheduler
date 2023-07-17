// Reads raw spreadsheet data from text field, and separates it into a matrix to create Room objects
function handleRoomSubmit(event) {
    event.preventDefault(); // Prevents the form from submitting and refreshing the page
    let field = document.getElementById('RoomInput');
    let inputText = field.value;
    field.value = ""; // clear
    autoResize("RoomInput");

    // load buildings first
    if (buildings == null) {
        clearConsole();
        output({type: "info", message: "Parsing Building Data..."});

        if (inputText.includes("\t")) {
            output({type: "error", message: "Buildings should be separated by row."});
            return;
        }

        buildings = inputText.split("\n");
        displayBuildings(); // ? function located in display.js

        output({type: "success", message: "Buildings loaded successfully!"});
        
        return;
    }

    clearConsole();
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

// * =================================================================

// Reads raw spreadsheet data from text field, and separates it into a matrix to create Tutor objects
function handleTutorSubmit(event) {
    event.preventDefault(); // Prevents the form from submitting and refreshing the page
    let field = document.getElementById('TutorInput');
    let inputText = field.value;
    field.value = ""; // clear
    autoResize("TutorInput");

    clearConsole();

    if (buildings == null) output({type: "error", message: "Building Data must be parsed before parsing tutor data."});
    if (rooms == null) output({type: "error", message: "Room data must be parsed before parsing tutor data."});

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

// * =================================================================

// resizes the text area to show all contents
function autoResize(elementID) {
    let textarea = document.getElementById(elementID);
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to match the content
}

// submit button event listener
let TutorSubmitButton = document.getElementById('TutorSubmitButton');
TutorSubmitButton.addEventListener('click', handleTutorSubmit);

let RoomSubmitButton = document.getElementById('RoomSubmitButton');
RoomSubmitButton.addEventListener('click', handleRoomSubmit);

let ScheduleButton = document.getElementById('ScheduleButton');
ScheduleButton.addEventListener('click', BuildSchedules);

consoleDiv = document.getElementById('console');

headerDiv = document.getElementById('header');
contentDiv = document.getElementById('content');


SearchBar = document.getElementById('SearchBar');