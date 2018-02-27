#!/bin/bash

# Local package Installation:
# This require a working package.json
if ! [ -f ./package.json ]; then
	echo "Error: No package.json found!"
	exit 1
fi

echo "Installing jquery packages locally:"

npm install jquery --save
npm install jquery-ui-dist --save
npm install jquery.tabulator --save

echo "Installing the flightradar24-client package 'normally':"
npm install flightradar24-client
#echo "Make sure to install the 'flightradar24-client' package with:"
#echo "npm install flightradar24-client"

echo "Required packages successfully installed"
exit 1

