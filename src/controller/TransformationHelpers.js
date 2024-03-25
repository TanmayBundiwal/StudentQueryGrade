"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCount = exports.handleSum = exports.handleAvg = exports.handleMax = exports.handleMin = exports.handleApply = exports.handleTransform = void 0;
var decimal_js_1 = require("decimal.js");
var IInsightFacade_1 = require("./IInsightFacade");
function handleTransform(filtered, transformations, queryColumns) {
    var dataset = JSON.parse(JSON.stringify(filtered));
    var transformObject = JSON.parse(JSON.stringify(transformations));
    var groups = {};
    var queryGroup = transformObject["GROUP"];
    var queryApply = transformObject["APPLY"];
    var columns = JSON.parse(JSON.stringify(queryColumns));
    if (queryGroup === undefined || queryApply === undefined || (Object.keys(transformObject).length > 2)) {
        throw new IInsightFacade_1.InsightError("transform incorrect keys");
    }
    for (var prop in queryGroup) {
        if (!columns.includes(queryGroup[prop])) {
            throw new IInsightFacade_1.InsightError("group key is not a column");
        }
    }
    for (var prop in dataset) {
        var groupName = [];
        for (var prop2 in queryGroup) {
            groupName.push(dataset[prop][queryGroup[prop2]]);
        }
        var group = JSON.stringify(groupName);
        if (groups[group] === undefined) {
            groups[group] = [dataset[prop]];
        }
        else {
            groups[group].push(dataset[prop]);
        }
    }
    var final = handleApply(groups, queryApply, queryGroup);
    return final;
}
exports.handleTransform = handleTransform;
function handleApply(groupOb, queryApply, queryGroup) {
    var dataset = JSON.parse(JSON.stringify(groupOb));
    var applyOb = JSON.parse(JSON.stringify(queryApply));
    var applyKeyArray = new Array(0);
    for (var prop in applyOb) {
        var applyKeys = Object.keys(applyOb[prop]);
        var applyBodyKeys = Object.keys(applyOb[prop][applyKeys[0]]);
        if (applyKeys.length > 1 || applyKeys[0] === undefined ||
            applyBodyKeys.length > 1 || applyBodyKeys[0] === undefined ||
            applyKeyArray.includes(JSON.stringify(applyKeys[0])) || typeof applyKeys[0] !== "string") {
            throw new IInsightFacade_1.InsightError("error in apply keys");
        }
        applyKeyArray.push(JSON.stringify(applyKeys[0]));
    }
    var final = new Array(0);
    var groups = JSON.parse(JSON.stringify(queryGroup));
    for (var key in dataset) {
        var keyOb = JSON.parse(key);
        var newOb = {};
        for (var prop in groups) {
            newOb[groups[prop]] = keyOb[prop];
        }
        for (var prop in applyOb) {
            var applyKeys = Object.keys(applyOb[prop]);
            var newKey = (Object.keys(applyOb[prop][applyKeys[0]])[0]);
            switch (newKey) {
                case "MIN":
                    newOb[applyKeys[0]] = handleMin(applyOb[prop][applyKeys[0]][newKey], dataset[key]);
                    break;
                case "MAX":
                    newOb[applyKeys[0]] = handleMax(applyOb[prop][applyKeys[0]][newKey], dataset[key]);
                    break;
                case "AVG":
                    newOb[applyKeys[0]] = handleAvg(applyOb[prop][applyKeys[0]][newKey], dataset[key]);
                    break;
                case "SUM":
                    newOb[applyKeys[0]] = handleSum(applyOb[prop][applyKeys[0]][newKey], dataset[key]);
                    break;
                case "COUNT":
                    newOb[applyKeys[0]] = handleCount(applyOb[prop][applyKeys[0]][newKey], dataset[key]);
                    break;
                default:
                    throw new IInsightFacade_1.InsightError("wrong key");
            }
        }
        final.push(newOb);
    }
    return final;
}
exports.handleApply = handleApply;
function handleMin(key, data) {
    var dataOb = JSON.parse(JSON.stringify(data));
    var min = Infinity;
    for (var prop in data) {
        if (typeof dataOb[prop][key] === "number") {
            if (dataOb[prop][key] < min) {
                min = dataOb[prop][key];
            }
        }
        else {
            throw new IInsightFacade_1.InsightError("non number passed to min");
        }
    }
    return min;
}
exports.handleMin = handleMin;
function handleMax(key, data) {
    var dataOb = JSON.parse(JSON.stringify(data));
    var max = 0;
    for (var prop in data) {
        if (typeof dataOb[prop][key] === "number") {
            if (dataOb[prop][key] > max) {
                max = dataOb[prop][key];
            }
        }
        else {
            throw new IInsightFacade_1.InsightError("non number passed to max");
        }
    }
    return max;
}
exports.handleMax = handleMax;
function handleAvg(key, data) {
    var dataOb = JSON.parse(JSON.stringify(data));
    var total = new decimal_js_1.Decimal(0);
    var numRows = Object.keys(dataOb).length;
    for (var prop in data) {
        if (typeof dataOb[prop][key] === "number") {
            var toAdd = new decimal_js_1.Decimal(dataOb[prop][key]);
            total = decimal_js_1.Decimal.add(total, toAdd);
        }
        else {
            throw new IInsightFacade_1.InsightError("non number passed to avg");
        }
    }
    // console.log(total);
    var avg = total.toNumber() / numRows;
    return Number(avg.toFixed(2));
}
exports.handleAvg = handleAvg;
function handleSum(key, data) {
    var dataOb = JSON.parse(JSON.stringify(data));
    var sum = 0;
    for (var prop in data) {
        if (typeof dataOb[prop][key] === "number") {
            sum += dataOb[prop][key];
        }
        else {
            throw new IInsightFacade_1.InsightError("non number passed to su,");
        }
    }
    return Number(sum.toFixed(2));
}
exports.handleSum = handleSum;
function handleCount(key, data) {
    var dataOb = JSON.parse(JSON.stringify(data));
    var array = new Array(0);
    for (var prop in dataOb) {
        if (dataOb[prop][key] !== undefined) {
            array.push(dataOb[prop][key]);
        }
        else {
            throw new IInsightFacade_1.InsightError("error in count");
        }
    }
    return new Set(array).size;
}
exports.handleCount = handleCount;
