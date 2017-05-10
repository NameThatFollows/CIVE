'use strict';

var socket = io();

var name;
var gameCode;


function generateCode() {
    var nameInput = document.getElementById("name-input").value;
    if (nameInput) {
        socket.emit('create game', nameInput);
    } else {
        alert("Please put in a name");
    }
}

function joinGame() {
    var nameInput = document.getElementById("name-input").value;
    var codeInput = document.getElementById("game-code-input").value;
    if (nameInput && codeInput) {
        socket.emit('join game', nameInput, codeInput);
    } else {
        alert("Please put in your name and/or a game code.");
    }
}

socket.on('join success', function(name, code) {
    document.getElementById("start").style.display = "none";
    document.getElementById("game").style.display = "inherit";
    document.getElementById("game-code").innerHTML = code;
    document.getElementById("name").innerHTML = name;
});

socket.on('join game fail', function() {
    alert("No game was found with this game code");
});