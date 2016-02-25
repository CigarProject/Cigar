#/bin/bash
echo [BATCH] Starting Server without MasterServer
while true
do
	clear
	node server/index.js
	echo [BATCH] Server Shutdown, waiting 15 seconds before a restart.
	sleep 15
done