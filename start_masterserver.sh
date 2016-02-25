#/bin/bash
echo [BATCH] Starting Server with MasterServer
while true
do
	clear
	node server/index.js --master
	echo [BATCH] Server Shutdown, waiting 15 seconds before a restart.
	sleep 15
done