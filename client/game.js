'use strict';

var socket = io();

var name;
var code;

var canvas = document.getElementById("game-board");
var ctx = canvas.getContext('2d');

/**
 * Resizes canvas to fill as much as the screen as possible without distortion. 
 */
function resizeCanvas() {
    var boardWrapper = document.getElementById("board-wrapper");
    var maxCanvasHeight = window.innerHeight - 20; // div#board -> padding * 2
    var maxCanvasWidth = window.innerWidth - 80;
    

    if ((maxCanvasHeight * 16) / 9 < maxCanvasWidth) {
        boardWrapper.style.height = maxCanvasHeight + "px";
        boardWrapper.style.width = (maxCanvasHeight * 16) / 9 + "px";
    } else {
        console.log(maxCanvasHeight);
        boardWrapper.style.width = maxCanvasWidth + "px";
        boardWrapper.style.height = (maxCanvasWidth / 16) * 9 + "px";
    }
}

function addPlayer() {
    resizeCanvas();
    if ((window.location.pathname).lastIndexOf('/') + 1 === (window.location.pathname).length) {
        code = (window.location.pathname).substring((window.location.pathname).lastIndexOf('/')-6);
        code = code.substring(0, code.length - 1);
    } else {
        code = (window.location.pathname).substring((window.location.pathname).lastIndexOf('/')+1);
    }

    socket.emit('check valid game code', code);
    
    socket.on('game code valid', function() {
        do {
            name = prompt("Please enter your name");
        } while (!name);

        socket.emit('join game', name, code);
        document.getElementById("flyout-name").innerHTML = name;
        document.getElementById("flyout-game-code").innerHTML = code;
    });

    socket.on('game code invalid', function() {
        window.location.reload();
    });
}

socket.on('update players', function(playerList) {
    var playerDiv = document.getElementById("player-list");
    playerDiv.innerHTML = "";
    for (var player in playerList) {
        playerDiv.innerHTML += "<li>" + playerList[player] + "</li>";
    }
});

ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = '#FF0000';
ctx.fillRect(100, 100, 100, 100);

ctx.lineWidth = 5;
ctx.strokeStyle = "#000000";
ctx.strokeRect(0, 0, canvas.width, canvas.height);