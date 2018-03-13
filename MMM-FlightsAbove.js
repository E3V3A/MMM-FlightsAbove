/* --------------------------------------------------------------------------
 * Module:       MMM-FlightsAbove
 * FileName:     MMM-FlightsAbove.js
 * Author:       E:V:A
 * License:      MIT
 * Date:         2018-03-13
 * Version:      1.0.4
 * Description:  A MagicMirror module to display planes in the sky above you
 * Format:       4-space TAB's (no TAB chars), mixed quotes
 *
 * URL1:         https://github.com/E3V3A/MMM-FlightsAbove
 * --------------------------------------------------------------------------
 * About Tabulator CSS & Themes:
 *   http://tabulator.info/docs/3.4?#css
 *   http://tabulator.info/examples/3.4?#theming
 * --------------------------------------------------------------------------
 * Tabulator Requires:
 * "node_modules/jquery/dist/jquery.min.js",
 * "node_modules/jquery-ui-dist/jquery-ui.min.js",
 * "node_modules/jquery-ui-dist/jquery-ui.css",
 * "node_modules/jquery.tabulator/dist/js/tabulator.js",
 * "node_modules/jquery.tabulator/dist/css/tabulator.css",
 * --------------------------------------------------------------------------
 */

'use strict'

Module.register('MMM-FlightsAbove',{

    defaults: {
        header: "Flights Above",            // The module header text, if any. (Use: "" to remove.)
//      footerLegend: true,                 // Enable the color-code legend to the table footer
        compassHeading: false,              // Type of heading indicator. ["true" gives "NE", instead of "45" (degrees)]
        maxItems: 8,                        // MAX Number of rows (flights) to display [default is 8]
        homeIata: "DPS",                    // Airport IATA code for highlighting flights To/From from a "home" airport
//        radarLocation: "-8.748,115.167",  // [Lat,Lon] - The location of radar center in decimal degrees
//        radarRadius: 60,                  // [km] - The maximum distance of planes shown.
        radarBBox: [-8.20917,114.62177,-9.28715,115.71243],  // [NLat,WLon,SLat,ELon] in (dec degrees) Default: "DPS"@60 km
        watchList: [1276,5000,5400,5600,6000,6100,6400],     // Highlight planes/flights/types on watch list
        updateInterval: 180                 // [seconds] Radar scan/ping/update period [default 3 min = 180 seconds]
    },

    requiresVersion: "2.1.0",

    start: function() {
        this.loaded = false;
        // This should be CONFIG!
        //this.sendSocketNotification("CONFIG", this.config);
        this.sendSocketNotification("START_RADAR", this.config);
    },

    getDom: function() {
        let w = document.createElement("div");  // Let w be the "wrapper"
        w.id = "flightsabove";                  // The id used by Tabulator

        if (!this.loaded) {
            w.innerHTML = "Loading...";
            w.className = "dimmed light small";
            return w;
        }
        if (!this.data) {
            w.innerHTML = "No data!";
            w.className = "dimmed light small";
            return w;
        }
        w.innerHTML = "Waiting for Tabulator...";
        return w;
    },

    getScripts: function() {
        return [
            this.file('node_modules/jquery/dist/jquery.min.js'),
            this.file('node_modules/jquery-ui-dist/jquery-ui.min.js'),
            this.file('node_modules/jquery.tabulator/dist/js/tabulator.js')
        ];
    },

    getStyles: function() {
        return [
            this.file('node_modules/jquery-ui-dist/jquery-ui.css'),
            //this.file('node_modules/jquery.tabulator/dist/css/tabulator.css'),                // Standard Theme
            this.file('node_modules/jquery.tabulator/dist/css/tabulator_midnight.min.css'),     // Midnight Theme
            //this.file('node_modules/jquery.tabulator/tabulator_simple.min.css'),              // Simple Theme
            //this.file('node_modules/jquery.tabulator/bootstrap/tabulator_bootstrap.min.css'), // Bootstrap Theme
            "MMM-FlightsAbove.css"                                                              // FlightsAbove Theme
        ];
    },

    getTranslations: function() {
        return false;   // Nothing to translate
    },

    // This come from the MM CORE or from other modules
    notificationReceived: function (notification, payload, sender) {
        if (notification === "DOM_OBJECTS_CREATED") {
            // The div with id "flightsabove" now exists, so we can load Tabulate.
            this.loadTabulate();
        }
        // This come from external control modules like: Hello-Lucy or MMM-voice.
        if (notification === 'HIDE_FLIGHTS') {
            this.hide(1000);
        }  else if (notification === 'SHOW_FLIGHTS') {
            this.show(1000);
        }
    },

    // This comes from YOUR module, usually "node_helper.js"
    socketNotificationReceived: function(notification, payload) {
        switch (notification) {
            //case "RADAR_CONFIG":
                //break;
            case "NEW_RADAR_DATA":
                this.loaded = true;
                this.setTableData(payload);
                //console.error("NEW_RADAR_DATA Received");
                //console.error(payload);
                break;
            default:
                console.error("Unmatched Notification: ", notification);
                //Log.error("Unmatched Notification: ", notification);
        }
    },

    //===================================================================================
    //  From here:  Tabulator specific code
    //===================================================================================
    loadTabulate: function() {

        // see: http://tabulator.info/docs/3.3#mutators
        /*Tabulator.extendExtension("mutator", "mutators", {
            ft2met:function(value, data, type, mutatorParams){
                return (value * 0.3048).toFixed(0);
            },
        });*/

        let self = this;
        Tabulator.extendExtension("format", "formatters", {
            ft2mt: function(cell, formatterParams) {              // Feet to Meters
                return  (0.3048*cell.getValue()).toFixed(0);
            },
            kn2km: function(cell, formatterParams) {              // Knots to Kilometers
                return  (1.852*cell.getValue()).toFixed(0);
            },
            ep2time: function(cell, formatterParams) {            // POSIX epoch to hh:mm:ss
                let date = new Date(cell.getValue());
                // We use "en-GB" only to get the correct formatting for a 24 hr clock, not your TZ.
                return date.toLocaleString('en-GB', { hour:'numeric', minute:'numeric', second:'numeric', hour12:false } );
            },
            deg2dir: function(cell, formatterParams) {            // Heading [deg] to approximate Compass Direction
                if (!self.config.compassHeading) { return cell; }
                let val = Math.floor((cell.getValue() / 22.5) + 0.5);
                let arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
                return arr[(val % 16)];
            },

        });


        let flightTable = $("#flightsabove");
        var flightTableHeight = ( this.config.maxItems * 33 + 33 );   // @12px font-size we have [~33 px/row]
        var sqCodesList = this.config.watchList;
        var homePort = this.config.homeIata;

        flightTable.tabulator({
            height:flightTableHeight,           // [px] Set MAX height of table, this enables the Virtual DOM and improves render speed
            layout:"fitDataFill",               // Resize columns to fit thier data and ensure rows takeup the full table width
            //layout:"fitColumns",                // Resize columns so that they fit perfectly inside the width of the container
            layoutColumnsOnNewData:true,        // Adjust the column width to the data each time you load it into the table
            //headerSort:false,                   // Disable header sorter
            resizableColumns:false,             // Disable manual column resize
            responsiveLayout:true,              // Enable responsive layouts
            placeholder:"Waiting for data...",  // Display message to user on empty table
            initialSort:[                       // Define the sort order:
                {column:"altitude",     dir:"asc"},     // 1'st
                //{column:"flight",     dir:"desc"},    // 2'nd
                //{column:"bearing",    dir:"asc"},     // 3'rd
            ],
            columns:[
                {title:"Flight",        field:"flight",         headerSort:false, sortable:false, responsive:0, align:"left"}, // , width:250},
                {title:"CallSig",       field:"callsign",       headerSort:false, sortable:false, visible:true, responsive:3},
                {title:"To",            field:"destination",    headerSort:false, sortable:false, responsive:0},
                {title:"From",          field:"origin",         headerSort:false, sortable:false, responsive:0},
                {title:"Speed",         field:"speed",          headerSort:false, sortable:false, responsive:2, formatter:"kn2km"},   // [km/h]
                {title:"Bearing",       field:"bearing",        headerSort:false, sortable:false, responsive:1, formatter:"deg2dir", align:"center"}, // [deg/dir]
                {title:"Alt [m]",       field:"altitude",       headerSort:false, sortable:false, responsive:0, formatter:"ft2mt", align:"right", sorter:"number"},
                //{title:"Alt [m]",       field:"altitude",       sortable:true,  responsive:0, align:"right", sorter:"number", mutateType:"data", mutator:ft2met"},
                // Additional items:
                {title:"F24id",         field:"id",             headerSort:false, sortable:false, visible:false},
                {title:"RegID",         field:"registration",   headerSort:false, sortable:false, visible:false},
                {title:"Model",         field:"model",          headerSort:false, sortable:false, visible:true,  responsive:1},
                {title:"ModeS",         field:"modes",          headerSort:false, sortable:false, visible:false},
//                {title:"ModeS",         field:"modeSCode",      headerSort:false, sortable:false, visible:false},
                {title:"Radar",         field:"radar",          headerSort:false, sortable:false, visible:false},
                {title:"Lat",           field:"latitude",       headerSort:false, sortable:false, visible:false},
                {title:"Lon",           field:"longitude",      headerSort:false, sortable:false, visible:false},
                {title:"Time",          field:"timestamp",      headerSort:false, sortable:false, visible:false, responsive:1, formatter:"ep2time"},

                {title:"RoC [ft/m]",    field:"climb",          headerSort:false, sortable:false, visible:false},
                {title:"Squawk",        field:"squawk",         headerSort:false, sortable:false, visible:true, responsive:1}, // formatter:"sqCheck"},
                {title:"isGND",         field:"ground",         headerSort:false, sortable:false, visible:false},
                {title:"isGlider",      field:"glider",         headerSort:false, sortable:false, visible:false},
//                {title:"RoC [ft/m]",    field:"rateOfClimb",    headerSort:false, sortable:false, visible:false},
//                {title:"Squawk",        field:"squawkCode",     headerSort:false, sortable:false, visible:true, responsive:1}, // formatter:"sqCheck"},
//                {title:"isGND",         field:"isOnGround",     headerSort:false, sortable:false, visible:false},
//                {title:"isGlider",      field:"isGlider",       headerSort:false, sortable:false, visible:false},
            ],

            // INSERT rowFormatter functions here!
            rowFormatter: function(row) {

                //let sqCodesMIL = [44xx,5000,5100-5300,5400,6000,6100,6400,7501-7577]; // Squawk codes for Military/Government operations
                //let sqCodesNATO = [74xx]; // Squawk codes for NATO flight operations
                const sqCodesEMG = [7100,7500,7600,7700];  // Squawk codes for Emergencies
                const sqCodesUFO = ["0000",7777];          // Squawk codes that are highly unusual and should not be assigned

                var data = row.getData(); //get data object for row

                // Highlight Flights From: "DPS" (airport IATA code)
                if(data.origin == homePort && data.flight != "null"){
                    row.getElement().css({"color":"#33D9FF", "font-weight":"bold"});    // bright-blue bold
                }

                // Highlight Flights To: "DPS" (aiport IATA code)
                if(data.destination == homePort && data.flight != "null"){
                    row.getElement().css({"color":"#0ff", "font-weight":"normal"});       // aqua normal
                }

                // Highlight Flights with Emergency squawks:
                for (let i of sqCodesEMG) {
                    if (data.squawk == i) {
                        row.getElement().css({"color":"red", "font-weight":"bold"});    // red bold
                        //console.log("Emergency Flight!", i);
                    }
                }

                // Highlight Flights with UFO squawks:
                for (let i of sqCodesUFO) {
                    if (data.squawk == i) {
                        row.getElement().css({"color":"#ffa500", "font-weight":"bold"});   // orange bold
                        //console.log("Illegal Squawk!", i);
                    }
                }

                // Highlight Flights with squawks on watchList:
                for (let i of sqCodesList) {
                    if (data.squawk == i) {
                        row.getElement().css({"color":"#f0f", "font-weight":"bold"});   // fuchsia bold
                        //console.log("Illegal Squawk!", i);
                        this.sendNotification("SHOW_ALERT", {
                            title: "FlightRadar",
                            message: "A flight on your watch list has been detected!",
                            timer: "5000"
                        });
                    }
                }

            },
            // END (rowFormatter)

            // Add the footer color legend
            footerElement:$("<div class='tabulator-footer'>" +
                                "<span style='color:#33D9FF;'>▉</span> = To  " +
                                "<span style='color:#0ff;'>▉</span> = From  &nbsp;" +
                                "<span style='color:#f00;'>▉</span> = Emergency  " +
                                "<span style='color:#f0f;'>▉</span> = watchList  " +
                                "<span style='color:#0f0;'>▉</span> = Mil / Gov  " +
                                "<span style='color:#ffa500;'>▉</span> = UFO" +
                             "</div>"),
            //END
        });

        $(window).resize(function () {
            flightTable.tabulator("redraw");
        });
    },

    setTableData: function(data) {
        $("#flightsabove").tabulator("setData", data);
    }

    // To immediately sort (programatically):
    // $("#flightsabove").tabulator("setSort", "altitude", "asc");

    //trigger AJAX load on "Load Data via AJAX" button click
    /*$("#ajax-trigger").click(function(){
        $("#flightsabove").tabulator("setData", "/sample_data/ajax/data.php");
    });*/

    //===================================================================================

});
