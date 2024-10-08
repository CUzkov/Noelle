#!/usr/bin/env bash
# Start script generated by ServerPackCreator.
# This script checks for the Minecraft and Forge JAR-Files, and if they are not found, they are downloaded and installed.
# If everything is in order, the server is started.

JAVA="java"
MINECRAFT="1.20.4"
ARGS=""
OTHERARGS="-Dlog4j2.formatMsgNoLookups=true"

if [[ ! -s "server.jar" ]];then
  echo "Minecraft Server JAR-file not found. Downloading...";
  curl https://piston-data.mojang.com/v1/objects/59353fb40c36d304f2035d51e7d6e6baa98dc05c/server.jar --output server.jar ;
else
  echo "server.jar present. Moving on...";
fi

if [[ ! -s "eula.txt" ]];then
  echo "eula=true" >> eula.txt;
else
  echo "eula.txt present. Moving on...";
fi

echo "Starting server...";
echo "Minecraft version: $MINECRAFT";
echo "Java version:"
$JAVA -version
echo "Java args: $ARGS";

$JAVA $OTHERARGS $ARGS -jar server.jar nogui
