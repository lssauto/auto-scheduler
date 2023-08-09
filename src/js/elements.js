// all elements that can be accessed globally

// submit buttons
let InputSubmitButton = document.getElementById('InputSubmitButton');
InputSubmitButton.addEventListener('click', handleInputSubmit);

let BuildingSubmitButton = document.getElementById('BuildingSubmitButton');
BuildingSubmitButton.addEventListener('click', handleInputSubmit);

let RoomSubmitButton = document.getElementById('RoomSubmitButton');
RoomSubmitButton.addEventListener('click', handleInputSubmit);

let ExpectedSubmitButton = document.getElementById('ExpectedSubmitButton');
ExpectedSubmitButton.addEventListener('click', handleInputSubmit);

let TutorSubmitButton = document.getElementById('TutorSubmitButton');
TutorSubmitButton.addEventListener('click', handleInputSubmit);

// create schedule
let ScheduleButton = document.getElementById('ScheduleButton');
ScheduleButton.addEventListener('click', buildSchedules);

// header and tools
consoleDiv = document.getElementById('console');

headerDiv = document.getElementById('header');
contentDiv = document.getElementById('content');

SearchBar = document.getElementById('SearchBar');

// add position filter options
for (const position in Positions) {
    document.getElementById("filterOptions").innerHTML += `<option value="${position}">${Positions[position]}</option>`;
}

// copy buttons
let copyTutorTableButton = document.getElementById('copyTutorTableButton');
copyTutorTableButton.addEventListener('click', copyTutorTable);

let copyTutorSchedulesButton = document.getElementById('copyTutorSchedulesButton');
copyTutorSchedulesButton.addEventListener('click', copyTutorSchedules);

let RoomCopyButton = document.getElementById('RoomCopyButton');
RoomCopyButton.addEventListener('click', copyRoomSchedules);

// content divs

let buildingContainer = document.getElementById("buildingContainer");

let roomContainer = document.getElementById('roomContainer');

let expectedTutorContainer = document.getElementById('expectedTutorContainer');

let tutorContainer = document.getElementById('tutorContainer');

let errorsContainer = document.getElementById('errorsContainer');

// resizes the text area to show all contents
function autoResize(elementID) {
    let textarea = document.getElementById(elementID);
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to match the content
}
