/* --------------------------------------------------------------------------
 * Module:       MMM-FlightsAbove
 * FileName:     node_helper.js
 * Author:       E:V:A
 * License:      MIT
 * Date:         2018-02-27
 * Version:      0.0.1
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
//const async = require('async');
const radar = require('flightradar24-client/lib/radar'); // This API return improper JSON

module.exports = NodeHelper.create({

    start: function() {
        console.log("------------------------------------------------------------");
        console.log(this.name + " started");
        console.log("------------------------------------------------------------");
        this.config = null;
        // get radar CONFIG here?
        //this.sendSocketNotification("REQUEST_CONFIG");
    },

    stop: function() {
        console.log(this.name + " is shutting down");
        //this.connection.close();
    },

    radarPing: function() {
        console.log("ENTER (inside)");
        Promise.all([
            //radar(-8.20917,114.62177,-9.28715,115.71243)  // "PDS" (Bali Airport)
            radar(53.05959,12.52388,51.98161,14.29552) // (Berlin)
            ]).then(function(results) {
                var ping = JSON.stringify(results);

                console.log("Sending NEW_DATA:");
                console.log(ping);

                // WTF! This below is never shown!
                this.sendSocketNotification("NEW_DATA", ping); //self?
                console.log("Sent NEW_DATA!");
                console.log("NEW_DATA is: %O", ping);
                console.dir(ping, {depth: null, colors: true});

                //return ping;
            }).then(function(error) {
                //console.log("ERROR:")
                console.log(error);
            });
        console.log("EXIT (inside)");
    },

/*    readData: function() {
        var radarData = "";
        radarData = this.radarPing();
        console.log("The DATA:\n", radarData);

        //if ( radarData === "" ) {
        //}
        //let cleanData = jZen(data);
        //let cleanData = jZen(radarData);
        let cleanData = radarData;
        if (isJSON(cleanData) ) {
            this.sendSocketNotification("NEW_DATA", cleanData);
        } else {
            // So WTF is it?
            console.log("- JSON: false");
            console.log("- isAO(dirty): " + isAO(radarData));
            console.log("- isAO(clean): " + isAO(cleanData));
            console.log("- Data:\n", radarData);
        }
    },
*/
    socketNotificationReceived: function (notification, payload) {
        //if (notification === "RADAR_CONFIG") {
            //this.config = payload;
        //} else
        if (notification === "REQUEST_DATA") {
            console.log("Received REQUEST_DATA!");
            this.config = payload;
            //this.readData();
            this.radarPing();
            setInterval(() => {
                //this.readData();
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
