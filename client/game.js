'use strict';

var socket = io();

var name;
var code;

function addPlayer() {
    // TODO Do a better name prompt
    do {
        name = prompt("Please enter your name");
    } while (!name);

    if ((window.location.pathname).lastIndexOf('/') + 1 === (window.location.pathname).length) {
        code = (window.location.pathname).substring((window.location.pathname).lastIndexOf('/')-6);
        code = code.substring(0, code.length - 1);
    } else {
        code = (window.location.pathname).substring((window.location.pathname).lastIndexOf('/')+1);
    }
    console.log(code);
    socket.emit('join game', name, code);
}

socket.on('update players', function(playerList) {
    var playerDiv = document.getElementById("player-list");
    playerDiv.innerHTML = "<ul>";
    for (var player in playerList) {
        playerDiv.innerHTML += "<li>" + playerList[player] + "</li>";
    }
    playerDiv.innerHTML += "</ul>";
});