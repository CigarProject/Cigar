// Imports
var http = require('http');
var WebSocket = require('ws');
var qs = require('querystring');
var fs = require("fs");
var ini = require('./modules/ini.js');

var GameServer = require('./GameServer');
var Commands = require('./modules/CommandList');

function MasterServer(selected) {
    this.gameServers = []; // List of gameservers this server is connected to

    this.realmID = 0; // An id of 0 is reserved for the master server
    this.lastID = 1; // DONT CHANGE
    this.selected = selected; // Selected server for commands

    this.commands = Commands.master; // Special set of commands for the master server

    this.config = {
        serverIP: "127.0.0.1",
        serverPort: 88,
        gameserverPort: 445,
        updateTime: 60,
        regions: {"US-Fremont":1},
    };

    this.REGIONS;

    this.info = {
        "MASTER_START": +new Date,
        "regions": {
            "US-Fremont":{"numPlayers":0,"numRealms":1,"numServers":1},
        },
    };
}

module.exports = MasterServer;

var MS;

MasterServer.prototype.start = function() {
    this.loadConfig();
    setInterval(this.onTick.bind(this),this.config.updateTime * 1000);
    this.onTick(); // Init
    MS = this;

    this.httpServer = http.createServer(function(req, res) {
        // Client connection
        //console.log("[Master] Connect: %s:%d", req.connection.remoteAddress, req.connection.remotePort);

        // Handle the request
        if (req.method == 'POST') {
            var body = '';
            req.on('data', function (data) {
                body += data;

                if (body.length > 1e6) {
                    request.connection.destroy();
                }
            });
            req.on('end', function () {
                var post = qs.parse(body);

                // Data
                var key = Object.keys(post)[0];

                if (key in MS.REGIONS) {
                    // Send if region exists
                    post = MS.getServer(key);
                } else {
                    // Region does not exist!
                    post = "0.0.0.0";
                }

                res.setHeader('Access-Control-Allow-Origin', '*');
                res.writeHead(200);
                res.end(post);
            });
        } else if ((req.method == 'GET') && (req.url = "/info")) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.writeHead(200);
            res.end(JSON.stringify(this.info));
        }

        /*
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(200);
        res.end('127.0.0.1:444');
        */
    }.bind(this));

    this.httpServer.listen(this.config.serverPort, function() {
        console.log("[Master] Listening on port %d", this.config.serverPort);
    }.bind(this));
};

MasterServer.prototype.getName = function() {
    // Gets the name of this server. For use in the console
    return "[Master]";
}

MasterServer.prototype.getNextID = function() {
    return this.lastID++;
}

MasterServer.prototype.getServer = function(key) {
    var h = this.REGIONS[key][Math.floor(Math.random() * this.REGIONS[key].length)];
    return h ? h.ip : "0.0.0.0";
}

MasterServer.prototype.onTick = function() {
    this.info.regions = {};
    for (var key in this.REGIONS) {
        var json = {"numPlayers":this.getPlayerAmount(this.REGIONS[key]),"numRealms":this.REGIONS[key].length,"numServers":this.REGIONS[key].length};
        this.info.regions[key] = json;
    }
};

MasterServer.prototype.getPlayerAmount = function(array) {
    var a = 0;
    for (var i in array) {
        array[i].updatePlayers();
        a += array[i].stats.players;
    }
    return a;
};

MasterServer.prototype.loadConfig = function() {
    try {
        // Load the contents of the config file
        var load = ini.parse(fs.readFileSync('./masterserver.ini', 'utf-8'));

        // Replace all the default config's values with the loaded config's values
        for (var obj in load) {
            this.config[obj] = load[obj];
        }

        // Parse config
        this.REGIONS = JSON.parse(this.config.regions);
        for (var key in this.REGIONS) {
            var ii = this.REGIONS[key];
            this.REGIONS[key] = [];

            for (var i = 0; i < ii; i++) {
                this.createServer(key);
            }
        }

        // Intial selection
        if (this.gameServers[0]) {
            this.selected.server = this.gameServers[0].server;
        } else {
            // No game servers
            this.selected.server = this;
        }
    } catch (err) {
        // No config
        console.log(err);

        // Create a new config
        fs.writeFileSync('./masterserver.ini', ini.stringify(this.config));
    }
};

// Server management

MasterServer.prototype.addServer = function(ip,port,reg) {
    try {
        var ws = new WebSocket('ws://'+ip+':'+port);
        var id;

        ws.on('error', function err(er) {
            console.log("[Master] Error connecting to a game server!");
        });
        
        ws.on('open', function open() {
            id = MS.getNextID(); // Get new ID
            ws.send('Hi'+id);
        });

        ws.on('message', function(data, flags) {
            if (data == 'Hello') {
                // Add to server list
                var h = new holderWS(MS,ws); // Server holder

                // Server stuff
                ws.holder = h;
                ws.realmID = id;

                // Add to region/server list
                MS.REGIONS[reg].push(h);
                h.server.region = reg; // Gameserver variable
                MS.gameServers[id - 1] = h;

                // Override
                ws.on('message', function(data, flags) {
                    if (data.charAt(0) == '[') {
                        console.log(data);
                    } else {
                        ws.holder.stats = JSON.parse(data);
                    }
                });
            }
        });

        ws.on('close', function close() {
            // Remove holder here
        });
    } catch (er) {
        console.log("[Master] Error connecting to a game server!");
        return;
    }

    
};

MasterServer.prototype.createServer = function(key,mode) {
    var id = this.getNextID(); // Get new ID

    var gs = new GameServer(id,'./gameserver'+id+'.ini');
    gs.config.serverPort = this.config.gameserverPort+id;
    gs.config.serverGamemode = mode;
    gs.start(); // Start server

    // Holder
    var h = new holderGS(this, gs);

    // Command handler
    h.server.commands = Commands.list;

    // Add to region/server list
    this.REGIONS[key].push(h);
    h.server.region = key; // Gameserver variable
    this.gameServers[id - 1] = h; 
};

MasterServer.prototype.removeServer = function(id,log) {
    // Game server
    var h = this.gameServers[id - 1];
    if (h) {
        this.gameServers.splice((id - 1),1,null); // Replace with null to keep the array in order

        var index = this.REGIONS[h.server.region].indexOf(h);
        if (index > -1) { // Remove from region array
            this.REGIONS[h.server.region].splice(index,1);
        }
        
        h.remove(); // Remove
        if (log) console.log(this.getName()+" Removed Game Server with ID: "+id);
    } else {
        if (log) console.log(this.getName()+" Invalid game server selected!");
    }
};

// Console commands

MasterServer.prototype.swap = function(id) {
    if (id == 0) {
        // User wants to slect the master server
        this.selected.server = this;
        console.log(this.getName()+" Switched to Master Server");
        return;
    }

    // Holder
    var h = this.gameServers[id - 1];
    if (h.server) {
        this.selected.server = h.server;
        console.log(this.getName()+" Switched to Game Server "+id);
    } else {
        console.log(this.getName()+" Invalid game server selected!");
    }
}

// Game Server Holder

function holderGS(masterServer,server) {
    this.server = server;
    this.master = masterServer;
    this.stats = {
        players: 0,
        max: 0,
        mode: "None",
    };

    this.ip = masterServer.config.serverIP + ":" + this.server.config.serverPort;

    this.updatePlayers = function () {
        this.stats = {
            players: this.server.clients.length,
            max: this.server.config.serverMaxConnections,
            mode: this.server.gameMode.name,
        };
    }

    this.remove = function() {
        this.server.socketServer.close(); // Remove
    }

    // Constructor
    this.updatePlayers();
}

// Remote Game Server holder

function holderWS(masterServer,server) {
    this.server = server;
    this.master = masterServer;
    this.stats = {
        players: 0,
        max: 0,
        mode: "None",
    };

    this.ip = this.server._socket.remoteAddress + ":" + this.server._socket.remotePort;

    this.updatePlayers = function () {

    }

    this.remove = function() {
        this.server.terminate();
    }

}
