/* --------------------------------------------------------------------------
 * Module:       MMM-FlightsAbove
 * FileName:     node_helper.js
 * Author:       E:V:A
 * License:      MIT
 * Date:         2018-02-28
 * Version:      1.0.0
 * Description:  A MagicMirror module to display planes in the sky above you
 * Format:       4-space TAB's (no TAB chars), mixed quotes
 *
 * URL:          https://github.com/E3V3A/MMM-FlightsAbove
 * Template:     https://github.com/E3V3A/MMM-Tabulator
 * --------------------------------------------------------------------------
 * Tabulator Requires:
 *      "node_modules/jquery/dist/jquery.min.js",
 *      "node_modules/jquery-ui-dist/jquery-ui.min.js",
 *      "node_modules/jquery-ui-dist/jquery-ui.css",
 *      "node_modules/jquery.tabulator/dist/js/tabulator.js",
 *      "node_modules/jquery.tabulator/dist/css/tabulator.css",
 *
 * flightradar24-client Requires:
 *      "dot-prop"
 *      "fetch-ponyfill"
 *      "moment-timezone"
 *      "parse-jsonp"
 *      "pinkie-promise"
 * --------------------------------------------------------------------------
 * NOTES:
 *   - Try-catch is only for synchronous operations! (not async)
 *   - .
 * --------------------------------------------------------------------------
 */

/*jslint node: true */
'use strict';

const NodeHelper = require("node_helper");
const fs = require('fs');
const radar = require('flightradar24-client/lib/radar'); // Returns an Array of JS objects, not JSON!

module.exports = NodeHelper.create({

    start: function() {
        //console.log("------------------------------------------------------------");
        console.log(this.name + " started");
        //console.log("------------------------------------------------------------");
        this.config = null;
        // get radar CONFIG here?
        //this.sendSocketNotification("REQUEST_RADAR_CONFIG");
    },

    stop: function() {
        console.log(this.name + " is shutting down");
        //this.connection.close();
    },

    radarPing: function() {
            // EDIT THE NEXT LINE WITH YOUR OWN BOUNDARY BOX
            //radar(-8.20917,114.62177,-9.28715,115.71243)  // "DPS" (Bali Airport)
            radar(53.05959,12.52388,51.98161,14.29552)      // (Berlin)
            .then((flights) => {
                this.sendSocketNotification("NEW_RADAR_DATA", flights);
                //console.log("Sending NEW_RADAR_DATA:");
                //console.log(flights);
            })
            .catch(function(error) {
                console.log(error);
            });
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "START_RADAR") {
            //console.log("Received START_RADAR");
            this.config = payload;
            this.radarPing();
            setInterval(() => {
                this.radarPing();
            }, this.config.updateInterval);
        }
    }

});

// To check if something is JSON
function isJSON(str) {
    try { return (JSON.parse(str) && !!str); }
    catch (e) { return false; }
}

// To check if something is an Array or Object (parsed JSON)
function isAO(val) {
    return val instanceof Array || val instanceof Object ? true : false;
}

// --------------------------------------------------------------------------
// What:  A dirt simple JSON cleanup function that also compactifies the data
// NOTE:  - Only use on flat and trustworthy ASCII JSON data!
//        - Cannot handle any characters outside [A-Za-z0-9_\-]. (e.g. UTF-8)
//        - Using remote data without further sanitation is a security risk!
// --------------------------------------------------------------------------
const re1 = /([A-Za-z0-9_\-]+):/gm;  // use const to make sure it is compiled
function jZen(juice) {
    //let re1 = /([A-Za-z0-9_\-]+):/gm; // Find all ASCII words $1 before an ":"
    //let data = juice;
    let str = "";
    str = juice.replace(/\s/gm, '');     // Remove all white-space
    str = str.replace(/\'/gm, '\"');    // Replace all ' with "
    str = str.replace(re1, '\"$1\":');  // Replace $1: with "$1":
    //console.log("Dirty JSON is:\n" + data.toString() );
    //console.log("Clean JSON is:\n" + str);
    return str;
}
