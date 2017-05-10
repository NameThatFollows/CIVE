'use strict';

// Initialize app to be a function handler to supply to HTTP server
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var currentGames = {};
var playerList = {};

app.use(express.static("client"));

io.on('connection', function(socket) {
    console.log('' + socket.id + ' connected');
    socket.on('disconnect', function() {
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

        var players = {};
        players[socket.id] = name;

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
        currentGames[code] = players;

        // Join room named by the code
        socket.join(code);

        io.to(socket.id).emit('join success', name, code);
        console.log(currentGames);
    });

    socket.on('join game', function(name, code) {
        if (currentGames[code]) {
            var currentPlayer = {};
            currentGames[code][socket.id] = name;
            io.to(socket.id).emit('join success', name, code);
            console.log(currentGames);

            // Join room named by the code
            socket.join(code);
        } else {
            io.to(socket.id).emit('join game fail');
        }
    });
});

// Make HTTP server listen on port 3000
http.listen(3000, function() {
    console.log('listening on *.3000');
});