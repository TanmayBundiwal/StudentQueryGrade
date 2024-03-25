"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.GetRoomKeys = exports.RoomTreeExplorer = exports.TreeExplorer = exports.GetGLocation = exports.GetRooms = void 0;
var http = require("http");
function GetRooms(RBuildings, GLocation, RCodes, RAddress, parsedRoomFiles, id) {
    var _a;
    var ret = [];
    var roomData = [];
    var keys = GetRoomKeys(id);
    for (var i = 0; i < RAddress.length; i++) {
        // console.log("==============================");
        var capacity = RoomTreeExplorer(roomData, parsedRoomFiles[i], "views-field views-field-field-room-capacity", false);
        roomData = [];
        var furniture = RoomTreeExplorer(roomData, parsedRoomFiles[i], "views-field views-field-field-room-furniture", false);
        roomData = [];
        var type = RoomTreeExplorer(roomData, parsedRoomFiles[i], "views-field views-field-field-room-type", false);
        roomData = [];
        var number = RoomTreeExplorer(roomData, parsedRoomFiles[i], "views-field views-field-field-room-number", false);
        roomData = [];
        var href = RoomTreeExplorer(roomData, parsedRoomFiles[i], "views-field views-field-field-room-number", true);
        roomData = [];
        if (capacity.length !== 0) {
            var j = 0;
            while (j < capacity.length) {
                ret.push((_a = {},
                    _a[keys[0]] = RBuildings[i],
                    _a[keys[1]] = RCodes[i],
                    _a[keys[2]] = number[j],
                    _a[keys[3]] = RCodes[i] + "_" + number[j],
                    _a[keys[4]] = RAddress[i],
                    _a[keys[5]] = GLocation[i].lat,
                    _a[keys[6]] = GLocation[i].lon,
                    _a[keys[7]] = parseInt(capacity[j], 10),
                    _a[keys[8]] = type[j],
                    _a[keys[9]] = furniture[j],
                    _a[keys[10]] = href[j],
                    _a));
                j++;
            }
        }
    }
    return ret;
}
exports.GetRooms = GetRooms;
function GetGLocation(RAddress) {
    return new Promise(function (resolve, reject) {
        var url;
        var response = [];
        var lat = [];
        var lon = [];
        for (var _i = 0, RAddress_1 = RAddress; _i < RAddress_1.length; _i++) {
            var item = RAddress_1[_i];
            if (item !== undefined) {
                url = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team633/" + encodeURI(item);
                response.push(new Promise(function (fulfill) {
                    http.get(url, function (res) {
                        res.setEncoding("utf8");
                        res.on("data", function (chunk) {
                            var result = JSON.parse(chunk);
                            lat.push(result.lat);
                            lon.push(result.lon);
                            fulfill(result);
                        });
                    });
                }));
            }
        }
        resolve(Promise.all(response));
    });
}
exports.GetGLocation = GetGLocation;
function TreeExplorer(RoomsData, obj, class_, buildingName) {
    for (var _i = 0, _a = obj.childNodes; _i < _a.length; _i++) {
        var child = _a[_i];
        if (Object.keys(child).includes("childNodes")) {
            if (child.tagName === "td") {
                if (child.attrs[0].value === class_) {
                    if (class_ === "views-field views-field-title" && !buildingName) {
                        RoomsData.push(child.childNodes[1].attrs[0].value.replace(".", "rooms"));
                    }
                    else if (class_ === "views-field views-field-title" && buildingName) {
                        RoomsData.push(child.childNodes[1].childNodes[0].value);
                    }
                    else {
                        RoomsData.push(child.childNodes[0].value.trim());
                    }
                }
            }
            TreeExplorer(RoomsData, child, class_, buildingName);
        }
    }
    return RoomsData;
}
exports.TreeExplorer = TreeExplorer;
function RoomTreeExplorer(RoomsData, obj, class_, href) {
    for (var _i = 0, _a = obj.childNodes; _i < _a.length; _i++) {
        var child = _a[_i];
        if (Object.keys(child).includes("childNodes")) {
            if (child.tagName === "td") {
                if (child.attrs[0].value === class_) {
                    if (class_ === "views-field views-field-field-room-number" && href) {
                        // console.log(class_ + "    " + child.childNodes[1].attrs[0].value);
                        RoomsData.push(child.childNodes[1].attrs[0].value);
                    }
                    else if (class_ === "views-field views-field-field-room-number" && !href) {
                        // console.log(class_ + "    " + child.childNodes[1].childNodes[0].value);
                        RoomsData.push(child.childNodes[1].childNodes[0].value);
                    }
                    else {
                        // console.log(class_ + "    " + child.childNodes[0].value.trim());
                        RoomsData.push(child.childNodes[0].value.trim());
                    }
                }
            }
            RoomTreeExplorer(RoomsData, child, class_, href);
        }
    }
    return RoomsData;
}
exports.RoomTreeExplorer = RoomTreeExplorer;
function GetRoomKeys(id) {
    return [id + "_fullname", id + "_shortname", id + "_number", id + "_name", id + "_address", id
            + "_lat", id + "_lon", id + "_seats", id + "_type", id + "_furniture", id + "_href"];
}
exports.GetRoomKeys = GetRoomKeys;
// Got from stack over flow. Put here to check if file was not getting written because the promise was resolving before the write command could complete.
function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}
exports.sleep = sleep;
