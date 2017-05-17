'use strict';

// Initialize app to be a function handler to supply to HTTP server
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var currentGamesAndPlayers = {};
var currentGamesAndDecks = {};

app.use(express.static(path.join(__dirname, '/client')));

app.get('/:id', function(req, res) {
    if (currentGamesAndPlayers[req.params.id]) {
        res.sendFile(path.join(__dirname, 'client/game.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/client.html'));
});

io.on('connection', function(socket) {
    console.log('' + socket.id + ' connected');
    socket.on('disconnect', function() {
        for (var game in currentGamesAndPlayers) {
            if (currentGamesAndPlayers[game][socket.id]) {
                delete currentGamesAndPlayers[game][socket.id];
                updatePlayers(game);

                if (Object.keys(currentGamesAndPlayers[game]).length === 0 && currentGamesAndPlayers[game].constructor === Object) {
                    delete currentGamesAndPlayers[game];
                    delete currentGamesAndDecks[game];
                }
            }
        }
        console.log('' + socket.id + ' disconnected');
    });

    socket.on('create game', function() {
        var code;
        const codeCharacters = 'abcdefghijklmnopqrstuvwxyz';
        do {
            code = "";
            for (var i = 0; i < 6; i++) {
                code += codeCharacters.charAt(Math.floor(Math.random() * codeCharacters.length));
            }
        } while (currentGamesAndPlayers[code]);

        /**
         * currentGames {
         *     game code : players {
         *         player 1 ID : name,
         *         player 2 ID : name
         *     },
         * 
         *     game code : players {
         *         player 1 ID : name,
         *         player 2 ID : name
         *     }
         * }
         */
        var players = {};
        currentGamesAndPlayers[code] = players;
        currentGamesAndDecks[code] = new CardDeck(500, 200);
        updatePlayers(code);
        io.to(socket.id).emit('join success', code);
        console.log(currentGamesAndPlayers);
    });

    socket.on('join game', function(name, code) {
        if (currentGamesAndPlayers[code]) {
            currentGamesAndPlayers[code][socket.id] = name;
            console.log(currentGamesAndPlayers);

            // Join room named by the code
            socket.join(code);
            updatePlayers(code);
            io.to(socket.id).emit('join success', code);
        } else {
            io.to(socket.id).emit('join game fail');
        }
    });

    socket.on('check valid game code', function(code) {
        if (currentGamesAndPlayers[code]) {
            io.to(socket.id).emit('game code valid', code, currentGamesAndDecks[code]);
        } else {
            io.to(socket.id).emit('game code invalid');
        }
    });

    socket.on('card mousedown', function(code, cardName) {
        socket.broadcast.to(code).emit('update card mousedown', cardName);
    });

    socket.on('card moved', function(code, cardName, x, y) {
        currentGamesAndDecks[code][cardName]["x"] = x;
        currentGamesAndDecks[code][cardName]["y"] = y;

        socket.broadcast.to(code).emit('update card', cardName, x, y);
    });
});

// Make HTTP server listen on port 3000
http.listen(3000, function() {
    console.log('listening on *.3000');
});

/**
 * Sends signals to all players in a group to update player lists. 
 * @param code Game code. If 6 characters, send signal to update client.
 */
function updatePlayers(code) {
    io.to(code).emit('update players', currentGamesAndPlayers[code]);
}

function CardDeck(startX, startY) {
    var letter = "c";
    for (var i = 1; i <= 13; i++) {
        this[letter + i] = {x: startX, y: startY};
    }

    letter = "d";
    for (var i = 1; i <= 13; i++) {
        this[letter + i] = {x: startX, y: startY};
    }

    letter = "h";
    for (var i = 1; i <= 13; i++) {
        this[letter + i] = {x: startX, y: startY};
    }

    letter = "s";
    for (var i = 1; i <= 13; i++) {
        this[letter + i] = {x: startX, y: startY};
    }

    this["j"] = {x: startX, y: startY};
}