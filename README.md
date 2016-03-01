![Language](https://img.shields.io/badge/language-JavaScript-yellow.svg) ![Demo](https://img.shields.io/badge/demo-MastaCoder-blue.svg)

To see the latest, fully functional version of the server active, go look at the [Live Demo](http://172.110.29.74:90/).

# Cigar
A fully functional open source Agar.io server implementation, written in Node.js. Cigar is based on the same code as Ogar, but introduces features that can only be used with unofficial clients.

## Using the official client
If you are not interested in additional features and only want to connect with the most recent version of the official client, [Ogar](https://github.com/forairan/Ogar) is probably better suited for you. Cigar was [forked](https://en.wikipedia.org/wiki/Fork_(software_development)) from Ogar in order to add features not supported by the official client.

## Obtaining and Using
As Cigar is written in Node.js, you must have Node.js and some dependencies installed to use it. You can usually download Node using your distribution's package manager (for *nix-like systems), or from [the Node website](http://nodejs.org). If you have git installed, download Cigar as follows:

```sh
~$ git clone git://github.com/CigarProject/Cigar.git Cigar
```

Otherwise download it using the `Download zip` button on the right side. Next, you'll have to cd into the directory. If you downloaded it without using git, you'll have to adjust the path.

```sh
~$ cd Cigar
```

Now on different operating systems, you're going to have to run a different file. If you are on Linux, run the following commands:

```
sh install_modules.sh
```

And on windows it would running the install_modules.bat file.

Now once you have done that, you can run the masterServer or just the gameservers by selecting the right file for your OS and choice of use.

Currently, Cigar listens on the following addresses and ports (by default):
* *:88 - for the master server
* *:150x - for the game server
* *:160x - for the stats server

Please note that on some systems, you may have to run the process as root or otherwise elevate your privileges to allow the process to listen on the needed ports. **If you are getting an EADDRINUSE error, it means that the port required to run Cigar is being used. Usually, Skype is the culprit. To solve this, either close out skype, or change the serverPort value in gameserver.ini to a different port. You will have to change your connection ip to "127.0.0.1:PORT"**

Once the gameserver is running, visit the client of your choice and join the server. If you used the MasterServer then you can simply go to 127.0.0.1:88.

## Configuring Cigar
Use "gameserver1.ini" to modify Cigar's configurations field. Player bots are currently basic and for testing purposes. To use them, change "serverBots" to a value higher than zero in the configuration file. To add/remove bot names, edit the file named "botnames.txt" which is in the same folder as "gameserver.ini". Names should be separated by using the enter key.

## Custom Game modes
Cigar has support for custom game modes. To switch between game modes, change the value of "serverGamemode" in the configurations file to the selected game mode id and restart the server. Please check [GAMEMODES.md](https://github.com/CigarProject/Cigar/blob/master/doc/GAMEMODES.md) for the list of gamemodes.

## Console Commands
Command names are not case sensitive, but the gameserver.ini variables are. This is a list of every thing you can type into the console upon opening Cigar. All commands can be found at [COMMANDS.md](https://github.com/CigarProject/Cigar/blob/master/doc/COMMANDS.md)

## Contributing
Please see [CONTRIBUTING.md](https://github.com/CigarProject/Cigar/blob/master/doc/CONTRIBUTING.md) for contribution guidelines.

## License
Please see [LICENSE.md](https://github.com/CigarProject/Cigar/blob/master/doc/LICENSE.md).
