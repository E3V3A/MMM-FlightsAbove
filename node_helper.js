/* --------------------------------------------------------------------------
 * Module:       MMM-FlightsAbove
 * FileName:     node_helper.js
 * Author:       E:V:A
 * License:      MIT
 * Date:         2018-03-13
 * Version:      1.0.4
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
 * DEV NOTES:
 *   - Try-catch is only for synchronous operations! (not async)
 *   -  Google maps BoundingBox Limits are defined by 2 corner points:
 *      SW and NE, whereas Flightradar24 API are using NW and SE corners!
 *      radar(LatMax/North, LonMin/West, LatMin/South, LonMax/East)
 *   - .
 * --------------------------------------------------------------------------
 */

/*jslint node: true */
'use strict';

const NodeHelper = require("node_helper");
const fs = require('fs');
//const radar = require('flightradar24-client/lib/radar'); // Returns an Array of JS objects, not JSON!
const radar = require('./lib/radar'); // Returns an Array of JS objects, not JSON!

module.exports = NodeHelper.create({

    start: function() {
        console.log(this.name + " started");
        this.config = null;
        this.started = false;   // (update timer)
        // get radar CONFIG here?
        //this.sendSocketNotification("REQUEST_RADAR_CONFIG");
    },

    stop: function() {
        console.log(this.name + " is shutting down");
    },

    radarPing: function() {
            const bb = this.config.radarBBox
            radar(bb[0],bb[1],bb[2],bb[3])
            .then((flights) => {
                this.radarData = flights; // save data for new clients
                this.sendSocketNotification("NEW_RADAR_DATA", this.radarData);
                //console.log("Sending NEW_RADAR_DATA:");
                //console.log(flights);
            })
            .catch(function(error) {
                console.log(error);
            });
    },

    socketNotificationReceived: function (notification, payload) {
        // We save this.started (update timer) status, to prevent mutiple timer restarts
        // for each new client connection/instance.
        const self = this; // (update time)
        if (notification === "START_RADAR" && this.started == false) {
            //console.log("Received START_RADAR");
            this.config = payload;
            this.radarPing();
            setInterval(() => {
                this.radarPing();
            }, this.config.updateInterval * 1000 );
            self.started = true; // update timer is started
        } else if (notification === "START_RADAR" && this.started == true) {
            this.sendSocketNotification("NEW_RADAR_DATA", this.radarData);
        }
    }

});
