'use strict';

var socket = io();

var flyoutOpen = false;

var name;
var code;
var mouseTarget;
var dragStarted;
var offset;
var update = true;

var canvas = document.getElementById("game-board");
var stage = new createjs.Stage(canvas);
var ctx = canvas.getContext('2d');

var cardAssets = {};

function init() {
    addPlayer();

    // enable touch interactions for those devices that support it
    createjs.Touch.enable(stage);

    stage.enableMouseOver(10); // 20 updates per second
    stage.mouseMoveOutside = true;

    loadCards();
}

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
        boardWrapper.style.width = maxCanvasWidth + "px";
        boardWrapper.style.height = (maxCanvasWidth / 16) * 9 + "px";
    }
}

function loadCards() {
    for (var i = 1; i <= 13; i++) {
        var image = new Image();
        image.name = "c" + i;
        image.src = "../assets/c" + i + ".png";
        image.onload = handleImageLoad;
    }

    for (var i = 1; i <= 13; i++) {
        var image = new Image();
        image.name = "d" + i;
        image.src = "../assets/d" + i + ".png";
        image.onload = handleImageLoad;
    }

    for (var i = 1; i <= 13; i++) {
        var image = new Image();
        image.name = "h" + i;
        image.src = "../assets/h" + i + ".png";
        image.onload = handleImageLoad;
    }

    for (var i = 1; i <= 13; i++) {
        var image = new Image();
        image.name = "s" + i;
        image.src = "../assets/s" + i + ".png";
        image.onload = handleImageLoad;
    }

    var image = new Image();
    image.name = "j";
    image.src = "../assets/j.png";
    image.onload = handleImageLoad;

    image = new Image();
    image.name = "bb";
    image.src = "../assets/bb.png";
    image.onload = handleImageLoad;

    image = new Image();
    image.name = "bg";
    image.src = "../assets/bg.png";
    image.onload = handleImageLoad;

    image = new Image();
    image.name = "br";
    image.src = "../assets/br.png";
    image.onload = handleImageLoad;

    console.log(cardAssets);
}

function handleImageLoad(e) {
    var image = e.target;
    var container = new createjs.Container();
    stage.addChild(container);

    var bitmap = new createjs.Bitmap(image);
    container.addChild(bitmap);
    bitmap.x = 500;
    bitmap.y = 500;
    bitmap.regX = bitmap.image.width / 2;
    bitmap.regY = bitmap.image.height / 2;
    bitmap.scaleX = bitmap.scaleY = bitmap.scale = .8;
    bitmap.name = image.name;
    bitmap.cursor = "pointer";

    bitmap.on("mousedown", function(event) {
        this.parent.addChild(this);
        this.offset = {x: this.x - event.stageX, y: this.y - event.stageY};
    });

    bitmap.on("pressmove", function(event) {
        this.x = event.stageX + this.offset.x;
        this.y = event.stageY + this.offset.y;
        update = true;
    });

    // bitmap.on("rollover", function(event) {
        
    //     update = true;
    // });

    // bitmap.on("rollout", function(event) {
    //     this.scaleX = this.scaleY = this.scale;
    //     update = true;
    // });

    createjs.Ticker.addEventListener("tick", tick);
}

function tick(e) {
    if (update) {
        update = false;
        stage.update(e);
    }
}

function stop() {
    createjs.Ticker.removeEventListener("tick", tick);
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

function openClose() {
    if (flyoutOpen) {
        flyoutOpen = false;

    } else {
        flyoutOpen = true;
        
    }
}