"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFileNames = exports.IsIdValidDel = exports.IsIdValid = exports.GetKeys = exports.GetSections = void 0;
function GetSections(rawStringData, id) {
    let ret = [];
    let keys = GetKeys(id);
    for (const item of rawStringData) {
        try {
            const parsedData = JSON.parse(item);
            let j = 0;
            while (j < parsedData["result"].length) {
                let Dept = parsedData["result"][j]["Subject"];
                let Cid = parsedData["result"][j]["Course"];
                let Avg = parsedData["result"][j]["Avg"];
                let Instructor = parsedData["result"][j]["Professor"];
                let Title = parsedData["result"][j]["Title"];
                let Pass = parsedData["result"][j]["Pass"];
                let Fail = parsedData["result"][j]["Fail"];
                let Audit = parsedData["result"][j]["Audit"];
                let Uuid = parsedData["result"][j]["id"].toString(10);
                let Year;
                if (parsedData["result"][j]["Section"] === "overall") {
                    Year = 1900;
                }
                else {
                    Year = parseInt(parsedData["result"][j]["Year"], 10);
                }
                ret.push({
                    [keys[0]]: Dept,
                    [keys[1]]: Cid,
                    [keys[2]]: Avg,
                    [keys[3]]: Instructor,
                    [keys[4]]: Title,
                    [keys[5]]: Pass,
                    [keys[6]]: Fail,
                    [keys[7]]: Audit,
                    [keys[8]]: Uuid,
                    [keys[9]]: Year
                });
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
function GetKeys(id) {
    return [id + "_dept", id + "_id", id + "_avg", id + "_instructor", id + "_title", id
            + "_pass", id + "_fail", id + "_audit", id + "_uuid", id + "_year"];
}
exports.GetKeys = GetKeys;
function IsIdValid(id, AddedIds) {
    let temp = [];
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
function IsIdValidDel(id) {
    let temp = [];
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
function GetFileNames(FileObj) {
    let ret = [];
    for (let file in FileObj.files) {
        if (file.startsWith("courses/") && file !== "courses/") {
            ret.push(file);
        }
    }
    return ret;
}
exports.GetFileNames = GetFileNames;
//# sourceMappingURL=GetSections.js.map