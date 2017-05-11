'use strict';

// Initialize app to be a function handler to supply to HTTP server
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var currentGames = {};

app.use(express.static(path.join(__dirname, '/client')));

app.get('/:id', function(req, res) {
    if (currentGames[req.params.id]) {
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
        for (var game in currentGames) {
            if (currentGames[game][socket.id]) {
                delete currentGames[game][socket.id];
                updatePlayers(game);

                if (Object.keys(currentGames[game]).length === 0 && currentGames[game].constructor === Object) {
                    delete currentGames[game];
                }
            }
        }
        console.log('' + socket.id + ' disconnected');
    });

    socket.on('create game', function() {
        var code;
        const codeCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        do {
            code = "";
            for (var i = 0; i < 6; i++) {
                code += codeCharacters.charAt(Math.floor(Math.random() * codeCharacters.length));
            }
        } while (currentGames[code]);

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
        currentGames[code] = players;
        io.to(socket.id).emit('join success', code);
        updatePlayers(code);
        console.log(currentGames);
    });

    socket.on('join game', function(name, code) {
        if (currentGames[code]) {
            currentGames[code][socket.id] = name;
            console.log(currentGames);

            // Join room named by the code
            socket.join(code);
            updatePlayers(code);

            io.to(socket.id).emit('join success', name, code);
        } else {
            io.to(socket.id).emit('join game fail');
        }
    });

    socket.on('check valid game code', function(code) {
        if (currentGames[code]) {
            console.log(code);
            io.to(socket.id).emit('game code valid', code);
        } else {
            io.to(socket.id).emit('game code invalid');
        }
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
    io.to(code).emit('update players', currentGames[code]);
}