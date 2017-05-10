'use strict';

// Initialize app to be a function handler to supply to HTTP server
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var currentGames = {};
var numberOfGames = 0;

app.use(express.static("client"));

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

    socket.on('create game', function(name) {
        var code;
        const codeCharacters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
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
        currentGames[code][socket.id] = name;
        numberOfGames++;

        socket.join(code);
        io.to(socket.id).emit('join success', name, code);
        updatePlayers(code);

        console.log(currentGames);
    });

    socket.on('join game', function(name, code) {
        if (currentGames[code]) {
            currentGames[code][socket.id] = name;
            io.to(socket.id).emit('join success', name, code);
            console.log(currentGames);

            // Join room named by the code
            socket.join(code);
            updatePlayers(code);
        } else {
            io.to(socket.id).emit('join game fail');
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