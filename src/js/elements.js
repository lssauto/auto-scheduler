// all elements that can be accessed globally

// submit buttons
let inputSubmitButton = document.getElementById('InputSubmitButton');
inputSubmitButton.addEventListener('click', handleInputSubmit);

let buildingSubmitButton = document.getElementById('BuildingSubmitButton');
buildingSubmitButton.addEventListener('click', handleInputSubmit);

let roomSubmitButton = document.getElementById('RoomSubmitButton');
roomSubmitButton.addEventListener('click', handleInputSubmit);

let positionSubmitButton = document.getElementById('PositionSubmitButton');
positionSubmitButton.addEventListener('click', handleInputSubmit);

let tutorSubmitButton = document.getElementById('TutorSubmitButton');
tutorSubmitButton.addEventListener('click', handleInputSubmit);

// create schedule
let scheduleButton = document.getElementById('ScheduleButton');
scheduleButton.addEventListener('click', buildSchedules);

// header and tools
let consoleDiv = document.getElementById('console');

let verboseToggleButton = document.getElementById('verboseToggle');

// headerDiv = document.getElementById('header');
// contentDiv = document.getElementById('content');

let searchBar = document.getElementById('SearchBar');

// add position filter options
let filterOptions = document.getElementById("filterOptions");
for (const position in Positions) {
    filterOptions.innerHTML += `<option value="${position}">${Positions[position]}</option>`;
}

// copy buttons
let copyTutorTableButton = document.getElementById('copyTutorTableButton');
copyTutorTableButton.addEventListener('click', copyTutorTable);

let copyTutorSchedulesButton = document.getElementById('copyTutorSchedulesButton');
copyTutorSchedulesButton.addEventListener('click', copyTutorSchedules);

let roomCopyButton = document.getElementById('copyRoomButton');
roomCopyButton.addEventListener('click', copyRoomSchedules);

let requestRoomCopyButton = document.getElementById('copyRequestRoomButton');
requestRoomCopyButton.addEventListener('click', copyRequestRoomSchedules);

// content divs

let buildingContainer = document.getElementById("buildingContainer");

let roomContainer = document.getElementById('roomContainer');

let tutorPositionContainer = document.getElementById('tutorPositionContainer');

let tutorContainer = document.getElementById('tutorContainer');

let errorsContainer = document.getElementById('errorsContainer');

// resizes the text area to show all contents
function autoResize(elementID) {
    let textarea = document.getElementById(elementID);
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px'; // Set the height to match the content
}
