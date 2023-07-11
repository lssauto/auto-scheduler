// * tutors and rooms map created as global variables for easy access
// * these will contain all the Tutor and Room objects created in parse.js,
// * and will be used to create complete schedules in build-schedules.js

let tutors = null;
let rooms = null;

// * console div used to output diagnostic messages
let consoleDiv;
const consoleColors = { // use to set the color of the console messages based on message type
    error: "red",
    warning: "orange",
    info: "blue",
    success: "green"
}

// * message is expected to be an object with at least a type field
function output(msg) {
    //consoleDiv.style.backgroundColor = consoleColors[msg.type];

    let str = "<p style='background-color: " + consoleColors[msg.type] + "'>";
    for (let key in msg) {
        str += key + ": " + msg[key] + "<br>";
    }
    str += "</p>";
    consoleDiv.innerHTML += str;
}

function clearConsole() {
    consoleDiv.innerHTML = "";
}