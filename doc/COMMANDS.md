# Console Commands

 - Addbot [Number]
   * Adds [Number] of bots to the server. If an amount is not specified, 1 bot will be added.
 - Ban [IP]
   * Prevents anyone with the banned IP from joining.
 - Banlist {clear}
   * Shows a list of currently banned IPs. You can clear the banlist by typing "clear" as the 2nd parameter.
 - Board [String 1] [String 2] [String 3] ...
   * Replaces the text on the leaderboard with the string text.
 - Boardreset
   * Resets the leaderboard to display the proper data for the current gamemode
 - Change [Config setting] [Value]
   * Changes a config setting to a value. Ex. "change serverMaxConnections 32" will change the variable serverMaxConnections to 32. Note that some config values (Like serverGamemode) are parsed before the server starts so changing them mid game will have no effect.
 - Clear
   * Clears the console output
 - Color [Player ID] [Red] [Green] [Blue]
   * Replaces the color of the specified player with this color.
 - Exit
   * Stops the process of the server and restarts.
 - Food [X position] [Y position] [Mass]
   * Spawns a food cell at those coordinates. If a mass value is not specified, then the server will default to "foodStartMass" in the config.
 - Gamemode [Id]
   * Changes the gamemode of the server. Warning - This can cause problems.
 - Kill [Player ID]
   * Kills all cells belonging to the specified player.
 - Killall
   * Kills all player cells on the map.
 - Mass [Player ID] [Number]
   * Sets the mass of all cells belonging to the specified player to [Number].
 - Merge [Player ID]
   * Forces all the cells of the selected player to merge.
 - Playerlist
   * Shows a list of connected players, their IP, player ID, the amount of cells they have, total mass, and their position. 
 - Pause
   * Pauses/Unpauses the game.
 - Reload [Gameserver ID]
   * Reloads the settings in the gameserver.ini.
 - Select [Server ID]
   * Selects the specified server, using an ID of 0 will select the master server. All commands will affect the selected server. Only available when the master server is running.
 - Split [Player ID]
   * Forces the selected player to split into the max amount of cells that it can.
 - Status
   * Shows the amount of players currently connected, time elapsed, memory usage (memory used/memory allocated), and the current gamemode.
 - Tp [Player ID] [X position] [Y position]
   * Teleports the specified player to the specified coordinates.
 - Unban [IP]
   * Unbans the specified IP.
 - Virus [X position] [Y position] [Mass]
   * Spawns a virus cell at those coordinates. If a mass value is not specified, then the server will default to "virusStartMass" in the config.
   
The master server commands are differnet than the game server commands:
 - Add [Server IP] [Server Port] [Region Name]
   * Adds an existing server to the master server list
 - All {Command}
   * Executes the command on all game servers
 - Create [Region Name] [Game mode]
   * Creates a server and adds it to the master server list. 
 - Select [Server ID]
   * Same as the game server command.
 - Serverlist
   * Displays the list of servers that are connected, their ID, region, gamemode, and connected players.
 - Remove [Server ID]
   * Removes the selected server ID from the server list.