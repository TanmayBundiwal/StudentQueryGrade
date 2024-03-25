"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCount = exports.handleSum = exports.handleAvg = exports.handleMax = exports.handleMin = exports.handleApply = exports.handleTransform = void 0;
const decimal_js_1 = require("decimal.js");
const IInsightFacade_1 = require("./IInsightFacade");
function handleTransform(filtered, transformations, queryColumns) {
    const dataset = JSON.parse(JSON.stringify(filtered));
    const transformObject = JSON.parse(JSON.stringify(transformations));
    let groups = {};
    const queryGroup = transformObject["GROUP"];
    const queryApply = transformObject["APPLY"];
    const columns = JSON.parse(JSON.stringify(queryColumns));
    if (queryGroup === undefined || queryApply === undefined || (Object.keys(transformObject).length > 2)) {
        throw new IInsightFacade_1.InsightError("transform incorrect keys");
    }
    for (let prop in queryGroup) {
        if (!columns.includes(queryGroup[prop])) {
            throw new IInsightFacade_1.InsightError("group key is not a column");
        }
    }
    for (let prop in dataset) {
        let groupName = [];
        for (let prop2 in queryGroup) {
            groupName.push(dataset[prop][queryGroup[prop2]]);
        }
        let group = JSON.stringify(groupName);
        if (groups[group] === undefined) {
            groups[group] = [dataset[prop]];
        }
        else {
            groups[group].push(dataset[prop]);
        }
    }
    let final = handleApply(groups, queryApply, queryGroup);
    return final;
}
exports.handleTransform = handleTransform;
function handleApply(groupOb, queryApply, queryGroup) {
    const dataset = JSON.parse(JSON.stringify(groupOb));
    const applyOb = JSON.parse(JSON.stringify(queryApply));
    let applyKeyArray = new Array(0);
    for (let prop in applyOb) {
        const applyKeys = Object.keys(applyOb[prop]);
        const applyBodyKeys = Object.keys(applyOb[prop][applyKeys[0]]);
        if (applyKeys.length > 1 || applyKeys[0] === undefined ||
            applyBodyKeys.length > 1 || applyBodyKeys[0] === undefined ||
            applyKeyArray.includes(JSON.stringify(applyKeys[0])) || typeof applyKeys[0] !== "string") {
            throw new IInsightFacade_1.InsightError("error in apply keys");
        }
        applyKeyArray.push(JSON.stringify(applyKeys[0]));
    }
    const final = new Array(0);
    const groups = JSON.parse(JSON.stringify(queryGroup));
    for (let key in dataset) {
        let keyOb = JSON.parse(key);
        let newOb = {};
        for (let prop in groups) {
            newOb[groups[prop]] = keyOb[prop];
        }
        for (let prop in applyOb) {
            const applyKeys = Object.keys(applyOb[prop]);
            const newKey = (Object.keys(applyOb[prop][applyKeys[0]])[0]);
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
    const dataOb = JSON.parse(JSON.stringify(data));
    let min = Infinity;
    for (let prop in data) {
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
    const dataOb = JSON.parse(JSON.stringify(data));
    let max = 0;
    for (let prop in data) {
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
    const dataOb = JSON.parse(JSON.stringify(data));
    let total = new decimal_js_1.Decimal(0);
    let numRows = Object.keys(dataOb).length;
    for (let prop in data) {
        if (typeof dataOb[prop][key] === "number") {
            let toAdd = new decimal_js_1.Decimal(dataOb[prop][key]);
            total = decimal_js_1.Decimal.add(total, toAdd);
        }
        else {
            throw new IInsightFacade_1.InsightError("non number passed to avg");
        }
    }
    let avg = total.toNumber() / numRows;
    return Number(avg.toFixed(2));
}
exports.handleAvg = handleAvg;
function handleSum(key, data) {
    const dataOb = JSON.parse(JSON.stringify(data));
    let sum = 0;
    for (let prop in data) {
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
    const dataOb = JSON.parse(JSON.stringify(data));
    let array = new Array(0);
    for (let prop in dataOb) {
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
//# sourceMappingURL=TransformationHelpers.js.map