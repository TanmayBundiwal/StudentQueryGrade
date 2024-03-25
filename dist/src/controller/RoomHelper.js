"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.GetRoomKeys = exports.RoomTreeExplorer = exports.TreeExplorer = exports.GetGLocation = exports.GetRooms = void 0;
const http = __importStar(require("http"));
function GetRooms(RBuildings, GLocation, RCodes, RAddress, parsedRoomFiles, id) {
    let ret = [];
    let roomData = [];
    let keys = GetRoomKeys(id);
    for (let i = 0; i < RAddress.length; i++) {
        let capacity = RoomTreeExplorer(roomData, parsedRoomFiles[i], "views-field views-field-field-room-capacity", false);
        roomData = [];
        let furniture = RoomTreeExplorer(roomData, parsedRoomFiles[i], "views-field views-field-field-room-furniture", false);
        roomData = [];
        let type = RoomTreeExplorer(roomData, parsedRoomFiles[i], "views-field views-field-field-room-type", false);
        roomData = [];
        let number = RoomTreeExplorer(roomData, parsedRoomFiles[i], "views-field views-field-field-room-number", false);
        roomData = [];
        let href = RoomTreeExplorer(roomData, parsedRoomFiles[i], "views-field views-field-field-room-number", true);
        roomData = [];
        if (capacity.length !== 0) {
            let j = 0;
            while (j < capacity.length) {
                ret.push({
                    [keys[0]]: RBuildings[i],
                    [keys[1]]: RCodes[i],
                    [keys[2]]: number[j],
                    [keys[3]]: RCodes[i] + "_" + number[j],
                    [keys[4]]: RAddress[i],
                    [keys[5]]: GLocation[i].lat,
                    [keys[6]]: GLocation[i].lon,
                    [keys[7]]: parseInt(capacity[j], 10),
                    [keys[8]]: type[j],
                    [keys[9]]: furniture[j],
                    [keys[10]]: href[j]
                });
                j++;
            }
        }
    }
    return ret;
}
exports.GetRooms = GetRooms;
function GetGLocation(RAddress) {
    return new Promise((resolve, reject) => {
        let url;
        let response = [];
        let lat = [];
        let lon = [];
        for (const item of RAddress) {
            if (item !== undefined) {
                url = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team633/" + encodeURI(item);
                response.push(new Promise((fulfill) => {
                    http.get(url, (res) => {
                        res.setEncoding("utf8");
                        res.on("data", (chunk) => {
                            let result = JSON.parse(chunk);
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
    for (let child of obj.childNodes) {
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
    for (let child of obj.childNodes) {
        if (Object.keys(child).includes("childNodes")) {
            if (child.tagName === "td") {
                if (child.attrs[0].value === class_) {
                    if (class_ === "views-field views-field-field-room-number" && href) {
                        RoomsData.push(child.childNodes[1].attrs[0].value);
                    }
                    else if (class_ === "views-field views-field-field-room-number" && !href) {
                        RoomsData.push(child.childNodes[1].childNodes[0].value);
                    }
                    else {
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
function sleep(milliseconds) {
    let start = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}
exports.sleep = sleep;
//# sourceMappingURL=RoomHelper.js.map