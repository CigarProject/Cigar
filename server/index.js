// Imports
var Commands = require('./modules/CommandList');
var GameServer = require('./GameServer');
var path = require('path');
var fs = require('fs');

// Init variables
var runMaster = true;
var showConsole = true;

var masterServer;
var debug = false;

var selected = function consoleObj() {
    this.server;
};
// Start msg
console.log("\u001B[32m  ____ _                  ____            _           _   ");
console.log(" / ___(_) __ _  __ _ _ __|  _ \\ _ __ ___ (_) ___  ___| |_ ");
console.log("| |   | |/ _` |/ _` | '__| |_) | '__/ _ \\| |/ _ \\/ __| __|");
console.log("| |___| | (_| | (_| | |  |  __/| | | (_) | |  __/ (__| |_ ");
console.log(" \\____|_|\\__, |\\__,_|_|  |_|   |_|  \\___// |\\___|\\___|\\__|");
console.log("         |___/ \u001B[33m- Better than Ogar!     \u001B[32m|__/               \u001B[0m");
console.log("-------------------------------------------------------");

// Handle arguments
process.argv.forEach(function(val) {
    if (val == "--nomaster") {
        runMaster = false;
    } else if (val == "--noconsole") {
        showConsole = false;
    } else if (val == "--debug") {
        showConsole = false;
        debug = true;
    } else if (val == "--help") {
        console.log("Proper Usage: node index.js [--master]");
        console.log("    --master            Run the Agar master server.");
        console.log("    --noconsole         Disables the console");
        console.log("    --debug             Debug log");
        console.log("    --help              Help menu.");
        console.log("");
    }
});

if (runMaster) {
    ensureDirExists(path.join(__dirname, '..', 'client', 'skins'), 0744, function(err) {
        if (err) {
            console.error('Could not create ' + path.join(__dirname, 'client', 'skins'));
            process.exit(1);
        }
    });
    // Initialize the master server
    MasterServer = require('./MasterServer');
    masterServer = new MasterServer(selected);
    masterServer.start();
} else {
    // Initialize the game server
    GameServer = require('./GameServer');
    var gameServer = new GameServer(1, './gameserver.ini');
    gameServer.start();
    gameServer.debug = debug; // Debug stuff
    // Add command handler
    gameServer.commands = Commands.list;
    selected.server = gameServer; // Selects this server
}

// Initialize the server console
if (showConsole) {
    var readline = require('readline');
    var in_ = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    setTimeout(prompt, 100);
}

// Directory functions
function ensureDirExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}

// Console functions

function prompt() {
    in_.question("<" + selected.server.realmID + ">", function(str) {
        parseCommands(str);
        return prompt(); // Too lazy to learn async
    });
};

function parseCommands(str) {
    // Splits the string
    var split = str.split(" ");

    // Process the first string value
    var first = split[0].toLowerCase();

    // Remote server
    if ((typeof selected.server.send != 'undefined') && (first != "select")) {
        selected.server.send(str);
        return;
    }

    // Get command function
    var execute = selected.server.commands[first];

    if (typeof execute != 'undefined') {
        execute(selected.server, split, masterServer);
    } else {
        console.log(selected.server.getName() + " Invalid Command!");
    }
};