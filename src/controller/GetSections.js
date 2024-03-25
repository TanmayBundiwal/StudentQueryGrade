"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFileNames = exports.IsIdValidDel = exports.IsIdValid = exports.GetKeys = exports.GetSections = void 0;
// This function gets an array of all valid sections from raw extracted data from individual files.
function GetSections(rawStringData, id) {
    var _a;
    var ret = [];
    var keys = GetKeys(id);
    for (var _i = 0, rawStringData_1 = rawStringData; _i < rawStringData_1.length; _i++) {
        var item = rawStringData_1[_i];
        try {
            var parsedData = JSON.parse(item);
            var j = 0;
            while (j < parsedData["result"].length) {
                var Dept = parsedData["result"][j]["Subject"];
                var Cid = parsedData["result"][j]["Course"];
                var Avg = parsedData["result"][j]["Avg"];
                var Instructor = parsedData["result"][j]["Professor"];
                var Title = parsedData["result"][j]["Title"];
                var Pass = parsedData["result"][j]["Pass"];
                var Fail = parsedData["result"][j]["Fail"];
                var Audit = parsedData["result"][j]["Audit"];
                var Uuid = parsedData["result"][j]["id"].toString(10);
                var Year = void 0;
                if (parsedData["result"][j]["Section"] === "overall") {
                    Year = 1900;
                }
                else {
                    Year = parseInt(parsedData["result"][j]["Year"], 10);
                }
                ret.push((_a = {},
                    _a[keys[0]] = Dept,
                    _a[keys[1]] = Cid,
                    _a[keys[2]] = Avg,
                    _a[keys[3]] = Instructor,
                    _a[keys[4]] = Title,
                    _a[keys[5]] = Pass,
                    _a[keys[6]] = Fail,
                    _a[keys[7]] = Audit,
                    _a[keys[8]] = Uuid,
                    _a[keys[9]] = Year,
                    _a));
                j++;
            }
        }
        catch (Error) {
            continue;
        }
    }
    return ret;
}
exports.GetSections = GetSections;
// This function generates keys for sections object.
function GetKeys(id) {
    return [id + "_dept", id + "_id", id + "_avg", id + "_instructor", id + "_title", id
            + "_pass", id + "_fail", id + "_audit", id + "_uuid", id + "_year"];
}
exports.GetKeys = GetKeys;
// This function checks if the id passed to addDataset is valid or not.
function IsIdValid(id, AddedIds) {
    var temp = [];
    if (id === null || id === undefined) {
        return false;
    }
    temp = id.split("_");
    if (temp.length > 1) {
        return false;
    }
    if (id.trim().length === 0) {
        return false;
    }
    if (AddedIds.indexOf(id) > -1) {
        return false;
    }
    return true;
}
exports.IsIdValid = IsIdValid;
// This function does not check for index. Needed new function since delete requires different index checking.
function IsIdValidDel(id) {
    var temp = [];
    if (id === null || id === undefined) {
        return false;
    }
    temp = id.split("_");
    if (temp.length > 1) {
        return false;
    }
    if (id.trim().length === 0) {
        return false;
    }
    return true;
}
exports.IsIdValidDel = IsIdValidDel;
// This function takes in the jzip object and returns an array of valid file names
function GetFileNames(FileObj) {
    var ret = [];
    for (var file in FileObj.files) {
        if (file.startsWith("courses/") && file !== "courses/") {
            ret.push(file);
        }
    }
    return ret;
}
exports.GetFileNames = GetFileNames;
