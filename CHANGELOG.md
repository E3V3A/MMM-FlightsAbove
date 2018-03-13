### MMM-FlightsAbove Change Log

All notable changes to this project will be documented in this file.

**Q**: *Why keep a changelog?*  
**A**: [BECAUSE](http://keepachangelog.com/en/1.0.0/)

**Q**: *How?*  
**A**: By carefully describing what was: *added, fixed*, and *changed*.

---

#### [1.0.4] - 2018-03-13

- Added remote control of module from other modules (fixes #18)
- Added config option for squawk watchList (fixes #13)
- Added config option for homeIata (fixes #19)
- Fixed CSS font color bug (fixes #17)
- Fixed CSS table header background color
- Added config.txt template to copy into config.js
- Added new screenshot for flight table 
- Added badges to README for:
  + MagicMirror version
  + Documentation staus
  + Maintenance status
  + Average Issue resolve time
  + MIT License 
- Removed version info from node_helper.js and MMM-FLightsAbove.js
- Changed node_helper to use the custom installed flightradar24-client in `./lib` 
  until new API items are resolved.


#### [1.0.3] - 2018-03-04

- Added config option maxItems (fixes #4)
- Fixed immediate data avilablity for new clients (fixes #14)


#### [1.0.2] - 2018-03-01

- Added config option radarBBox (fixes #7)
- Added config option compassHeading (fixes #12)
- Fixed Bearing center alignment
- Added layoutColumnsOnNewData to Tabulator
- Enabled fitDataFill in Tabulator
- Increased default MAX table height


#### [1.0.1] - 2018-03-01

- Fixed update timer for multiple connection instances (fixes #10)
- Fixed updateInterval config to use seconds instead of milliseconds (fixes #3)

#### [1.0.0] - 2018-02-28

- First working Version
- Fixed radarPing in node_helper (@raywo)
- Removed debug logging from module
- Update README with new info
- Added MagicRadarBB calculator


#### [0.0.1] - 2018-02-27

- Initial (non-working) Version
