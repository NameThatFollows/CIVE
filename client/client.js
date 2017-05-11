'use strict';

var socket = io();

var initialButtonsBox = document.getElementById("initial-buttons");
var newGameBox = document.getElementById("new-game");
var joinGameBox = document.getElementById("join-game");

function newGameButton() {
    initialButtonsBox.style.display = "none";
    newGameBox.style.display = "inline-block";
    joinGameBox.style.display = "none";

    socket.emit('create game');
}

function joinGameButton() {
    initialButtonsBox.style.display = "none";
    newGameBox.style.display = "none";
    joinGameBox.style.display = "inline-block";
}

function goBackButton() {
    initialButtonsBox.style.display = "inherit";
    newGameBox.style.display = "none";
    joinGameBox.style.display = "none";
}

function joinGame() {
    var codeInput = document.getElementById("game-code-input").value;
    codeInput = codeInput.toLowerCase();
    if (codeInput && codeInput.length === 6) {
        socket.emit('check valid game code', codeInput);
    } else {
        alert("Sorry. You need to enter a 6 character game code");
    }
}

socket.on('game code valid', function(code) {
    console.log(code);
    console.log("" + window.location.href + code);
    window.location.replace("" + window.location.href + code + "/");
});

socket.on('join success', function(code) {
    document.getElementById("game-href").href = "" + window.location.href + code + "/";
    document.getElementById("game-link").innerHTML = "" + code;
});

socket.on('join game fail', function() {
    alert("No game was found with this game code");
});