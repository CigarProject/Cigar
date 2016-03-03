// Imports
var GameMode = require('../gamemodes');
var Entity = require('../entity');

function Commands() {
    this.list = {}; // Empty
}

module.exports = Commands;

// Utils
var println = function(gameServer, str) { // Line with [Game:1]
    if (gameServer.masterServer != null) {
        gameServer.masterServer.send(gameServer.getName() + str);
    }

    console.log(gameServer.getName() + str);
}

var fillChar = function(data, char, fieldLength, rTL) {
    var result = data.toString();
    if (rTL === true) {
        for (var i = result.length; i < fieldLength; i++)
            result = char.concat(result);
    } else {
        for (var i = result.length; i < fieldLength; i++)
            result = result.concat(char);
    }
    return result;
};


// Commands

Commands.list = {
    addbot: function(gameServer, split) {
        var add = parseInt(split[1]);
        if (isNaN(add)) {
            add = 1; // Adds 1 bot if user doesnt specify a number
        }

        for (var i = 0; i < add; i++) {
            gameServer.bots.addBot();
        }
        println(gameServer, " Added " + add + " player bots");
    },
    ban: function(gameServer, split) {
        var ip = split[1]; // Get ip
        if (gameServer.banned.indexOf(ip) == -1) {
            gameServer.banned.push(ip);
            println(gameServer, " Added " + ip + " to the banlist");

            // Remove from game
            for (var i in gameServer.clients) {
                var c = gameServer.clients[i];

                if (!c.remoteAddress) {
                    continue;
                }

                if (c.remoteAddress == ip) {
                    c.close(); // Kick out
                }
            }
        } else {
            println(gameServer, " That IP is already banned");
        }
    },
    banlist: function(gameServer, split) {
        if ((typeof split[1] != 'undefined') && (split[1].toLowerCase() == "clear")) {
            gameServer.banned = [];
            println(gameServer, " Cleared ban list");
            return;
        }

        println(gameServer, " Current banned IPs (" + gameServer.banned.length + ")");
        for (var i in gameServer.banned) {
            println(gameServer, gameServer.banned[i]);
        }
    },
    board: function(gameServer, split) {
        var newLB = [];
        for (var i = 1; i < split.length; i++) {
            newLB[i - 1] = split[i];
        }

        // Clears the update leaderboard function and replaces it with our own
        gameServer.gameMode.packetLB = 48;
        gameServer.gameMode.specByLeaderboard = false;
        gameServer.gameMode.updateLB = function(gameServer) {
            gameServer.leaderboard = newLB
        };
        println(gameServer, gameServer.getName() + " Successfully changed leaderboard values");
    },
    boardreset: function(gameServer) {
        // Gets the current gamemode
        var gm = GameMode.get(gameServer.gameMode.ID);

        // Replace functions
        gameServer.gameMode.packetLB = gm.packetLB;
        gameServer.gameMode.updateLB = gm.updateLB;
        println(gameServer, gameServer.getName() + " Successfully reset leaderboard");
    },
    change: function(gameServer, split) {
        var key = split[1];
        var value = split[2];

        if (typeof value != 'undefined') {
            // Check if int/float
            if (value.indexOf('.') != -1) {
                value = parseFloat(value);
            } else {
                value = parseInt(value);
            }
        }

        if (typeof gameServer.config[key] != 'undefined') {
            gameServer.config[key] = value;
            println(gameServer, gameServer.getName() + " Set " + key + " to " + value);
        } else {
            println(gameServer, gameServer.getName() + " Invalid config value");
        }
    },
    clear: function() {
        process.stdout.write("\u001b[2J\u001b[0;0H");
    },
    color: function(gameServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            println(gameServer, gameServer.getName() + " Please specify a valid player ID!");
            return;
        }

        var color = {
            r: 0,
            g: 0,
            b: 0
        };
        color.r = Math.max(Math.min(parseInt(split[2]), 255), 0);
        color.g = Math.max(Math.min(parseInt(split[3]), 255), 0);
        color.b = Math.max(Math.min(parseInt(split[4]), 255), 0);

        // Sets color to the specified amount
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                client.setColor(color); // Set color
                for (var j in client.cells) {
                    client.cells[j].setColor(color);
                }
                break;
            }
        }
    },
    exit: function(gameServer, split) {
        gameServer.exitServer();
    },
    food: function(gameServer, split) {
        var pos = {
            x: parseInt(split[1]),
            y: parseInt(split[2])
        };
        var mass = parseInt(split[3]);

        // Make sure the input values are numbers
        if (isNaN(pos.x) || isNaN(pos.y)) {
            println(gameServer, gameServer.getName() + " Invalid coordinates");
            return;
        }

        if (isNaN(mass)) {
            mass = gameServer.config.foodStartMass;
        }

        // Spawn
        var f = new Entity.Food(gameServer.getNextNodeId(), null, pos, mass);
        f.setColor(gameServer.getRandomColor());
        gameServer.addNode(f);
        gameServer.currentFood++;
        println(gameServer, " Spawned 1 food cell at (" + pos.x + " , " + pos.y + ")");
    },
    gamemode: function(gameServer, split) {
        try {
            var n = parseInt(split[1]);
            var gm = GameMode.get(n); // If there is an invalid gamemode, the function will exit
            gameServer.gameMode.onChange(gameServer); // Reverts the changes of the old gamemode
            gameServer.gameMode = gm; // Apply new gamemode
            gameServer.gameMode.onServerInit(gameServer); // Resets the server
            println(gameServer, " Changed game mode to " + gameServer.gameMode.name);
        } catch (e) {
            println(gameServer, " Invalid game mode selected");
        }
    },
    help: function(gameServer) {
        console.log("[Master] To view all the commands, check the documentations for commands on the Cigar GitHub page.");
    },
    kill: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            println(gameServer, " Please specify a valid player ID!");
            return;
        }

        var count = 0;
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                var len = client.cells.length;
                for (var j = 0; j < len; j++) {
                    gameServer.removeNode(client.cells[0]);
                    count++;
                }

                println(gameServer, " Removed " + count + " cells");
                break;
            }
        }
    },
    killall: function(gameServer, split) {
        var count = 0;
        var len = gameServer.nodesPlayer.length;
        for (var i = 0; i < len; i++) {
            gameServer.removeNode(gameServer.nodesPlayer[0]);
            count++;
        }
        println(gameServer, " Removed " + count + " cells");
    },
    mass: function(gameServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            println(gameServer, " Please specify a valid player ID!");
            return;
        }

        var amount = Math.max(parseInt(split[2]), 9);
        if (isNaN(amount)) {
            println(gameServer, " Please specify a valid number");
            return;
        }

        // Sets mass to the specified amount
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                for (var j in client.cells) {
                    client.cells[j].mass = amount;
                }

                println(gameServer, " Set mass of " + client.name + " to " + amount);
                break;
            }
        }
    },
    merge: function(gameServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            println(gameServer, " Please specify a valid player ID!");
            return;
        }
        // Sets merge time
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                for (var j in client.cells) {
                    client.cells[j].calcMergeTime(-10000);
                }
                println(gameServer, " Forced " + client.name + " Cells to merge.");
                break;
            }
        }
    },
    split: function(gameServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        var count = parseInt(split[2]);
        if (isNaN(id)) {
            println(gameServer, " Please specify a valid player ID!");
            return;
        }
        if (isNaN(count)) {
            //Split into 16 cells
            count = 4;
        }

        // Split!
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                //Split
                for (var i = 0; i < count; i++) {
                    gameServer.splitCells(client);
                }
                println(gameServer, " Forced " + client.name + " Cells to split.");
                break;
            }
        }
    },
    playerlist: function(gameServer, split) {
        console.log("[Console] Showing " + gameServer.clients.length + " players: ");
        console.log(" ID         | IP              | %s | CELLS | SCORE  | POSITION    ",
            fillChar('NICK', ' ', gameServer.config.playerMaxNickLength)); // Fill space
        console.log(fillChar('', '-', ' ID         | IP              |  | CELLS | SCORE  | POSITION    '.length + gameServer.config.playerMaxNickLength));
        for (var i = 0; i < gameServer.clients.length; i++) {
            var client = gameServer.clients[i].playerTracker;

            // ID with 3 digits length
            var id = fillChar((client.pID), ' ', 10, true);

            // Get ip (15 digits length)
            var ip = "BOT";
            if (typeof gameServer.clients[i].remoteAddress != 'undefined') {
                ip = gameServer.clients[i].remoteAddress;
            }
            ip = fillChar(ip, ' ', 15);

            // Get name and data
            var nick = '',
                cells = '',
                score = '',
                position = '',
                data = '';
            if (client.spectate) {
                try {
                    // Get spectated player
                    if (gameServer.getMode().specByLeaderboard) { // Get spec type
                        nick = gameServer.leaderboard[client.spectatedPlayer].name;
                    } else {
                        nick = gameServer.clients[client.spectatedPlayer].playerTracker.name;
                    }
                } catch (e) {
                    // Specating nobody
                    nick = "";
                }
                nick = (nick == "") ? "An unnamed cell" : nick;
                data = fillChar("SPECTATING: " + nick, '-', ' | CELLS | SCORE  | POSITION    '.length + gameServer.config.playerMaxNickLength, true);
                console.log(" %s | %s | %s", id, ip, data);
            } else if (client.cells.length > 0) {
                nick = fillChar((client.name == "") ? "An unnamed cell" : client.name, ' ', gameServer.config.playerMaxNickLength);
                cells = fillChar(client.cells.length, ' ', 5, true);
                score = fillChar(client.getScore(true), ' ', 6, true);
                position = fillChar(client.centerPos.x, ' ', 5, true) + ', ' + fillChar(client.centerPos.y, ' ', 5, true);
                console.log(" %s | %s | %s | %s | %s | %s", id, ip, nick, cells, score, position);
            } else {
                // No cells = dead player or in-menu
                data = fillChar('DEAD OR NOT PLAYING', '-', ' | CELLS | SCORE  | POSITION    '.length + gameServer.config.playerMaxNickLength, true);
                console.log(" %s | %s | %s", id, ip, data);
            }
        }
    },
    pause: function(gameServer, split) {
        gameServer.run = !gameServer.run; // Switches the pause state
        var s = gameServer.run ? "Unpaused" : "Paused";
        println(gameServer, " " + s + " the game.");
    },
    reload: function (gameServer, split) {
        // Validation checks
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            println(gameServer, " Please specify a valid gameserver.ini ID. (Such as 1 for gameserver1.ini)");
            return;
        }

        gameServer.loadConfig("./gameserver" + id + ".ini");
        println(gameServer, " Configuration file reloaded successfully for gameserver" + id + ".ini.");
    },
    select: function(gameServer, split, masterServer) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            println(gameServer, " Please specify a realm ID!");
            return;
        }

        if (masterServer) {
            masterServer.swap(id);
        } else {
            println(gameServer, " Master server not found!");
        }
    },
    status: function(gameServer, split) {
        // Get amount of humans/bots
        var humans = 0,
            bots = 0;
        for (var i = 0; i < gameServer.clients.length; i++) {
            if ('_socket' in gameServer.clients[i]) {
                humans++;
            } else {
                bots++;
            }
        }
        //
        println(gameServer, " Connected players: " + gameServer.clients.length + "/" + gameServer.config.serverMaxConnections);
        println(gameServer, " Players: " + humans + " Bots: " + bots);
        println(gameServer, " Server has been running for " + process.uptime() + " seconds.");
        println(gameServer, " Current memory usage: " + process.memoryUsage().heapUsed / 1000 + "/" + process.memoryUsage().heapTotal / 1000 + " kb");
        println(gameServer, " Current game mode: " + gameServer.gameMode.name);
    },
    tp: function(gameServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            println(gameServer, " Please specify a valid player ID!");
            return;
        }

        // Make sure the input values are numbers
        var pos = {
            x: parseInt(split[2]),
            y: parseInt(split[3])
        };
        if (isNaN(pos.x) || isNaN(pos.y)) {
            println(gameServer, " Invalid coordinates");
            return;
        }

        // Spawn
        for (var i in gameServer.clients) {
            if (gameServer.clients[i].playerTracker.pID == id) {
                var client = gameServer.clients[i].playerTracker;
                for (var j in client.cells) {
                    client.cells[j].position.x = pos.x;
                    client.cells[j].position.y = pos.y;
                }

                println(gameServer, " Teleported " + client.name + " to (" + pos.x + " , " + pos.y + ")");
                break;
            }
        }
    },
    unban: function(gameServer, split) {
        var ip = split[1]; // Get ip
        var index = gameServer.banned.indexOf(ip);
        if (index > -1) {
            gameServer.banned.splice(index, 1);
            println(gameServer, " Unbanned " + ip);
        } else {
            println(gameServer, " That IP is not banned");
        }
    },
    virus: function(gameServer, split) {
        var pos = {
            x: parseInt(split[1]),
            y: parseInt(split[2])
        };
        var mass = parseInt(split[3]);

        // Make sure the input values are numbers
        if (isNaN(pos.x) || isNaN(pos.y)) {
            println(gameServer, " Invalid coordinates");
            return;
        }
        if (isNaN(mass)) {
            mass = gameServer.config.virusStartMass;
        }

        // Spawn
        var v = new Entity.Virus(gameServer.getNextNodeId(), null, pos, mass);
        gameServer.addNode(v);
        println(gameServer, " Spawned 1 virus at (" + pos.x + " , " + pos.y + ")");
    },
};

// Master server commands

Commands.master = {
    add: function(masterServer, split) {
        var ip = split[1];
        if (typeof ip == 'undefined') {
            console.log(masterServer.getName() + " Please enter an IP address");
            return;
        }

        var port = parseInt(split[2]);
        if (isNaN(port)) {
            console.log(masterServer.getName() + " Invalid Port!");
            return;
        }

        var reg = split[3];
        if (typeof masterServer.REGIONS[reg] == 'undefined') {
            console.log(masterServer.getName() + " Invalid region name!");
            return;
        }

        // Adds
        masterServer.addServer(ip, port, reg);
    },
    all: function(masterServer, split) {
        var com = split[1];
        if (typeof com == 'undefined') {
            console.log(masterServer.getName() + " Invalid string!");
            return;
        }

        split.splice(0, 1); // Removes the "all" command

        for (var i in masterServer.gameServers) {
            var gs = masterServer.gameServers[i];
            gs.commands[com].execute(gs, split, masterServer);
        }
    },
    create: function(masterServer, split) {
        if (typeof masterServer.REGIONS[split[1]] == 'undefined') {
            console.log(masterServer.getName() + " Invalid region name!");
            return;
        }

        var mode = parseInt(split[2]);
        if (isNaN(mode)) {
            mode = 0;
        }

        // Adds
        masterServer.createServer(split[1], mode);
    },
    select: function(masterServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            console.log(masterServer.getName() + " Please specify a realm ID!");
            return;
        }

        if (masterServer) {
            masterServer.swap(id);
        } else {
            console.log(masterServer.getName() + " Master server not found!");
        }
    },
    serverlist: function(masterServer) {
        console.log(masterServer.getName() + " Showing connected servers: ");
        for (var i in masterServer.gameServers) {
            var h = masterServer.gameServers[i];

            if (h) { // Do not show deleted game servers
                console.log("ID: " + h.server.realmID + "  IP: " + h.ip + " Region: " + h.server.region + "  Mode: " + h.stats.mode + "  Players: " + h.stats.players + "/" + h.stats.max);
            }
        }
    },
    remove: function(masterServer, split) {
        var id = parseInt(split[1]);
        if (isNaN(id)) {
            console.log(masterServer.getName() + " Please specify a realm ID!");
            return;
        }

        // Removes
        masterServer.removeServer(id, true);
    },
};