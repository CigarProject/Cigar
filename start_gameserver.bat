@echo off
echo [BATCH] Starting Server without MasterServer
:loop
   cls
   node server/index.js
   echo [BATCH] Server Shutdown, waiting 15 seconds before a restart.
   timeout /t 15
   goto loop