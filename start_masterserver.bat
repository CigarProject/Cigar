@echo off
echo [BATCH] Starting Server with MasterServer
:loop
   cls
   node server/index.js --master
   echo -------------------------------------------------------
   echo [BATCH] Server Shutdown, waiting 15 seconds before a restart.
   timeout /t 15 > nul
   goto loop