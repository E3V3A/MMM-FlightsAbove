#!/usr/bin/node

'use strict'
//const radar = require('flightradar24-client/lib/radar')
const radar = require('../lib/radar')

// A no planes place:
//radar(83, 13, 82, 14)
// "DPS" @ 60 km (Bali Airport)
//radar(-8.20917,114.62177,-9.28715,115.71243)
// 60 km @ (Berlin)
radar(53.05959,12.52388,51.98161,14.29552)
.then(console.log)
.catch(console.error)
