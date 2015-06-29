# PROTOCOL

## Protocol extensions
As the server has to tell whether the client supports protocol extensions, the values of package 254 and 255 have been adjusted.
Package 255 now contains "Ogar" in ASCII (1332175218) while package 254 contains the version number. When modifying the protocol,
only new features can be implemented. Also, the client must be compatible with older versions of the server.

## Changes
Please document any changes introduced here. Direction has to be either `S2C` (server to client) or `C2S`.

### Version 1


| Direction  | ID  | Value | Description|
| :------------ |:---------------| :-----|:----|
|C2S       | 254 |                1 | Version number|
|C2S       | 255 |       1332175218 | String "Ogar" - Tells the server how to use the modified protocol|
|S2C       |  48 | behaves like #49 | Leaderboard without numbers|
|C2S       |  99 | flags (uint8) [1], message | For in-game chat, each char is in Uint16 |
|S2C       |  99 | flags (uint8) [1], r (uint8), g (uint8), b (uint8), nick, '\0', message, '\0' | same as above |

 [1] If flags has the 2, 4, or 8 bit set, an offset of 4, 8, or 16 bytes follows before any other data. Until these additional
   bytes are used, just skip them. 

Hint : to use Packet 48, make sure the packet ID in case 48 of Ogar/src/packet/UpdateLeaderboard.js is adjusted like this: 
```
view.setUint8(0, this.packetLB, true);
```
You can also use https://github.com/m-byte/Ogar, which already has this feature enabled.

### Version 2
TODO: We could add chat functionality in this version. That way, only one websocket server would be needed.
