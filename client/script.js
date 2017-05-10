'use strict';

var socket = io();

var name;
var gameCode;

var whichButton;

function startGame() {
    if (whichButton === 1) {
        generateCode();
    } else if (whichButton === 2) {
        joinGame();
    } else {
        alert("Something went terribly wrong.");
    }
}

function newGameButton() {
    whichButton = 1;
    var nameInput = document.getElementById("name-input");
    var codeInput = document.getElementById("game-code-input");
    var startGameButton = document.getElementById("start-game-button");

    nameInput.style.display = "inline-block";
    codeInput.style.display = "none";
    startGameButton.style.display = "inline-block";
}

function joinGameButton() {
    whichButton = 2;
    var nameInput = document.getElementById("name-input");
    var codeInput = document.getElementById("game-code-input");
    var startGameButton = document.getElementById("start-game-button");

    nameInput.style.display = "inline-block";
    codeInput.style.display = "inline-block";
    startGameButton.style.display = "inline-block";
}

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

socket.on('update players', function(playerList) {
    var playerDiv = document.getElementById("player-list");
    playerDiv.innerHTML = "<ul>";
    for (var player in playerList) {
        playerDiv.innerHTML += "<li>" + playerList[player] + "</li>";
    }
    playerDiv.innerHTML += "</ul>";
});

socket.on('join success', function(name, code) {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("game").style.display = "inherit";
    document.getElementById("game-code").innerHTML = code;
    document.getElementById("name").innerHTML = name;
});

socket.on('join game fail', function() {
    alert("No game was found with this game code");
});