// * switch between tutor and room sections by setting the display style of the div

function setTutorActive() {
    let tutorDiv = document.getElementById('tutors');
    let roomDiv = document.getElementById('rooms');
    tutorDiv.style.display = 'block';
    roomDiv.style.display = 'none';
}

function setRoomActive() {
    let tutorDiv = document.getElementById('tutors');
    let roomDiv = document.getElementById('rooms');
    tutorDiv.style.display = 'none';
    roomDiv.style.display = 'block';
}

// button event listener
let tutorButton = document.getElementById('TutorSwitchButton');
tutorButton.addEventListener('click', setTutorActive);

let roomButton = document.getElementById('RoomSwitchButton');
roomButton.addEventListener('click', setRoomActive);