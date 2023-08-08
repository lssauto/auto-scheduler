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
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
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
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
}

// button event listener
let tutorButton = document.getElementById('TutorSwitchButton');
tutorButton.addEventListener('click', setTutorActive);

let roomButton = document.getElementById('RoomSwitchButton');
roomButton.addEventListener('click', setRoomActive);