// * console div used to output diagnostic messages
const ConsoleColors = { // use to set the color of the console messages based on message type
    error: "red",
    warning: "orange",
    info: "#2343A0",
    success: "green"
}

// * message is expected to be an object with at least a type field
function output(msg) {
    let p = document.createElement("p");
    p.style.backgroundColor = ConsoleColors[msg.type];
    for (let key in msg) {
        p.innerHTML += key + ": " + msg[key] + "<br>";
    }
    consoleDiv.appendChild(p);
}

function clearConsole() {
    consoleDiv.innerHTML = "";
}

/*let hidden = false;
function hideConsole() {
    let button = document.getElementById("ConsoleHideButton");
    if (!hidden) {
        consoleDiv.style.display = "none";
        hidden = true;
        button.innerHTML = "Show Console";
    } else {
        consoleDiv.style.display = "block";
        hidden = false;
        button.innerHTML = "Hide Console";
    }
    // resize header
    contentDiv.style.paddingTop = headerDiv.clientHeight + "px";
}*/