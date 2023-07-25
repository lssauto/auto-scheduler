// * switch between tutor and room sections by setting the display style of the div

function setTutorActive() {
    let tutorDiv = document.getElementById('tutors');
    let tutorTools = document.getElementById('tutorTools');
    let roomDiv = document.getElementById('rooms');
    let roomTools = document.getElementById('roomTools');
    tutorDiv.style.display = 'inline';
    tutorTools.style.display = 'inline';
    roomDiv.style.display = 'none';
    roomTools.style.display = 'none';
}

function setRoomActive() {
    let tutorDiv = document.getElementById('tutors');
    let tutorTools = document.getElementById('tutorTools');
    let roomDiv = document.getElementById('rooms');
    let roomTools = document.getElementById('roomTools');
    tutorDiv.style.display = 'none';
    tutorTools.style.display = 'none';
    roomDiv.style.display = 'inline';
    roomTools.style.display = 'inline';
}

// button event listener
let tutorButton = document.getElementById('TutorSwitchButton');
tutorButton.addEventListener('click', setTutorActive);

let roomButton = document.getElementById('RoomSwitchButton');
roomButton.addEventListener('click', setRoomActive);