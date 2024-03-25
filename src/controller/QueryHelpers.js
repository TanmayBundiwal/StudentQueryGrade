"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKind = exports.checkAsterisks = exports.handleSField = exports.handleMField = exports.handleIS = exports.handleEQ = exports.handleLT = exports.handleGT = exports.handleNot = exports.handleOr = exports.handleAnd = exports.handleWhereQuery = void 0;
var IInsightFacade_1 = require("./IInsightFacade");
function handleWhereQuery(whereQuery, datasetID, dataset, kind) {
    var whereObject = JSON.parse(JSON.stringify(whereQuery));
    var whereKeys = Object.keys(whereObject);
    if (whereKeys.length === 0) {
        return dataset;
    }
    if (whereKeys.length === 1) {
        switch (whereKeys[0]) {
            case "GT":
                return handleGT(whereObject["GT"], datasetID, dataset, kind);
            case "EQ":
                return handleEQ(whereObject["EQ"], datasetID, dataset, kind);
            case "LT":
                return handleLT(whereObject["LT"], datasetID, dataset, kind);
            case "IS":
                return handleIS(whereObject["IS"], datasetID, dataset, kind);
            case "NOT":
                return handleNot(whereObject["NOT"], datasetID, dataset, kind);
            case "AND":
                return handleAnd(whereObject["AND"], datasetID, dataset, kind);
            case "OR":
                return handleOr(whereObject["OR"], datasetID, dataset, kind);
            default:
                throw new IInsightFacade_1.InsightError();
        }
    }
    else {
        throw new IInsightFacade_1.InsightError("incorrect number of keys in WHERE");
    }
}
exports.handleWhereQuery = handleWhereQuery;
function handleAnd(andQuery, datasetID, dataset, kind) {
    if (Object.keys(andQuery).length < 1) {
        throw new IInsightFacade_1.InsightError("incorrect number of keys in AND");
    }
    var queryAndObject = JSON.parse(JSON.stringify(andQuery));
    var array = new Array(0);
    var compare = new Array(0);
    var compare2 = new Array(0);
    for (var prop in queryAndObject) {
        compare = JSON.parse(JSON.stringify(handleWhereQuery(queryAndObject[prop], datasetID, dataset, kind)));
        if (prop === "0") {
            for (var prop2 in compare) {
                array.push(compare[prop2]);
            }
        }
        else {
            compare2 = [];
            for (var prop2 in array) {
                compare2.push(JSON.stringify(array[prop2]));
            }
            array = [];
            for (var prop1 in compare) {
                if (compare2.includes(JSON.stringify(compare[prop1]))) {
                    array.push(compare[prop1]);
                }
            }
        }
    }
    return array;
}
exports.handleAnd = handleAnd;
function handleOr(orQuery, datasetID, dataset, kind) {
    if (Object.keys(orQuery).length < 1) {
        throw new IInsightFacade_1.InsightError("incorrect number of keys in OR");
    }
    var queryOrObject = JSON.parse(JSON.stringify(orQuery));
    var stringArray = new Array(0);
    for (var prop in queryOrObject) {
        var array = JSON.parse(JSON.stringify(handleWhereQuery(queryOrObject[prop], datasetID, dataset, kind)));
        for (var prop2 in array) {
            if (!(stringArray.includes(JSON.stringify(array[prop2])))) {
                stringArray.push(JSON.stringify(array[prop2]));
            }
        }
    }
    var returnArray = new Array(0);
    for (var prop in stringArray) {
        returnArray.push(JSON.parse(stringArray[prop]));
    }
    return returnArray;
}
exports.handleOr = handleOr;
function handleNot(notQuery, datasetID, dataset, kind) {
    if (Object.keys(notQuery).length !== 1) {
        throw new IInsightFacade_1.InsightError("incorrect number of keys in NOT");
    }
    var datasetObject = JSON.parse(JSON.stringify(dataset));
    var queryNotObject = JSON.parse(JSON.stringify(notQuery));
    var array1 = JSON.parse(JSON.stringify(handleWhereQuery(queryNotObject, datasetID, dataset, kind)));
    var compareArray = new Array(0);
    for (var prop1 in array1) {
        compareArray.push(JSON.stringify(array1[prop1]));
    }
    var returnArray = new Array(0);
    for (var prop2 in datasetObject) {
        if (!(compareArray.includes(JSON.stringify(datasetObject[prop2])))) {
            returnArray.push(datasetObject[prop2]);
        }
    }
    return returnArray;
}
exports.handleNot = handleNot;
function handleGT(GTQuery, datasetID, dataset, kind) {
    var returnArray = new Array(0);
    var datasetString = JSON.stringify(dataset);
    var datasetObject = JSON.parse(datasetString);
    if (Object.keys(GTQuery).length !== 1) {
        throw new IInsightFacade_1.InsightError("incorrect number of keys in GT");
    }
    var compare = handleMField(GTQuery, datasetID, kind);
    for (var prop in dataset) {
        if (datasetObject[prop][Object.keys(GTQuery)[0]] > compare) {
            returnArray.push(datasetObject[prop]);
        }
    }
    return returnArray;
}
exports.handleGT = handleGT;
function handleLT(LTQuery, datasetID, dataset, kind) {
    var returnArray = new Array(0);
    var datasetString = JSON.stringify(dataset);
    var datasetObject = JSON.parse(datasetString);
    if (Object.keys(LTQuery).length !== 1) {
        throw new IInsightFacade_1.InsightError("incorrect number of keys in LT");
    }
    var compare = handleMField(LTQuery, datasetID, kind);
    for (var prop in dataset) {
        if (datasetObject[prop][Object.keys(LTQuery)[0]] < compare) {
            returnArray.push(datasetObject[prop]);
        }
    }
    return returnArray;
}
exports.handleLT = handleLT;
function handleEQ(EQQuery, datasetID, dataset, kind) {
    var returnArray = new Array(0);
    var datasetString = JSON.stringify(dataset);
    var datasetObject = JSON.parse(datasetString);
    if (Object.keys(EQQuery).length !== 1) {
        throw new IInsightFacade_1.InsightError("incorrect number of keys in IS");
    }
    var compare = handleMField(EQQuery, datasetID, kind);
    for (var prop in dataset) {
        if (datasetObject[prop][Object.keys(EQQuery)[0]] === compare) {
            returnArray.push(datasetObject[prop]);
        }
    }
    return returnArray;
}
exports.handleEQ = handleEQ;
function handleIS(ISQuery, datasetID, dataset, kind) {
    var returnArray = new Array(0);
    var datasetString = JSON.stringify(dataset);
    var datasetObject = JSON.parse(datasetString);
    if (Object.keys(ISQuery).length !== 1) {
        throw new IInsightFacade_1.InsightError("incorrect number of keys in IS");
    }
    var SField = handleSField(ISQuery, datasetID, kind);
    if ((SField.charAt(0) === "*") && (SField.charAt(SField.length - 1) === "*")) {
        SField = SField.slice(1, SField.length - 1);
        checkAsterisks(SField);
        for (var prop in dataset) {
            if (datasetObject[prop][Object.keys(ISQuery)[0]].includes(SField)) {
                returnArray.push(datasetObject[prop]);
            }
        }
    }
    else if (SField.charAt(0) === "*") {
        SField = SField.slice(1, SField.length);
        checkAsterisks(SField);
        for (var prop in dataset) {
            if (datasetObject[prop][Object.keys(ISQuery)[0]].endsWith(SField)) {
                returnArray.push(datasetObject[prop]);
            }
        }
    }
    else if (SField.charAt(SField.length - 1) === "*") {
        SField = SField.slice(0, SField.length - 1);
        checkAsterisks(SField);
        for (var prop in dataset) {
            if (datasetObject[prop][Object.keys(ISQuery)[0]].startsWith(SField)) {
                returnArray.push(datasetObject[prop]);
            }
        }
    }
    else {
        checkAsterisks(SField);
        for (var prop in dataset) {
            if (datasetObject[prop][Object.keys(ISQuery)[0]] === SField) {
                returnArray.push(datasetObject[prop]);
            }
        }
    }
    return returnArray;
}
exports.handleIS = handleIS;
function handleMField(field, datasetID, kind) {
    var fieldKeys = Object.keys(field);
    var fieldString = JSON.stringify(field);
    var fieldObject = JSON.parse(fieldString);
    if (fieldKeys.length !== 1) {
        throw new IInsightFacade_1.InsightError("incorrect number of keys in mField");
    }
    if (kind === "courses") {
        if (fieldKeys[0] === (datasetID + "_avg") || fieldKeys[0] === (datasetID + "_pass") ||
            fieldKeys[0] === (datasetID + "_fail") || fieldKeys[0] === (datasetID + "_audit") ||
            fieldKeys[0] === (datasetID + "_year")) {
            if ((typeof fieldObject[fieldKeys[0]]) === "number" || fieldObject[fieldKeys[0]] instanceof Number) {
                return fieldObject[fieldKeys[0]];
            }
            else {
                throw new IInsightFacade_1.InsightError("non-number passed to mField");
            }
        }
        else {
            throw new IInsightFacade_1.InsightError("incorrect key (mField)");
        }
    }
    else if (fieldKeys[0] === (datasetID + "_lat") || fieldKeys[0] === (datasetID + "_lon") ||
        fieldKeys[0] === (datasetID + "_seats")) {
        if ((typeof fieldObject[fieldKeys[0]]) === "number" || fieldObject[fieldKeys[0]] instanceof Number) {
            return fieldObject[fieldKeys[0]];
        }
        else {
            throw new IInsightFacade_1.InsightError("non-number passed to mField");
        }
    }
    else {
        throw new IInsightFacade_1.InsightError("incorrect key (mField)");
    }
}
exports.handleMField = handleMField;
function handleSField(field, datasetID, kind) {
    var fieldKeys = Object.keys(field);
    var fieldString = JSON.stringify(field);
    var fieldObject = JSON.parse(fieldString);
    if (fieldKeys.length !== 1) {
        throw new IInsightFacade_1.InsightError("incorrect number of keys in sField");
    }
    if (kind === "courses") {
        if (fieldKeys[0] === (datasetID + "_dept") || fieldKeys[0] === (datasetID + "_id") ||
            fieldKeys[0] === (datasetID + "_instructor") || fieldKeys[0] === (datasetID + "_title") ||
            fieldKeys[0] === (datasetID + "_uuid")) {
            if ((typeof fieldObject[fieldKeys[0]]) === "string" || fieldObject[fieldKeys[0]] instanceof String) {
                return fieldObject[fieldKeys[0]];
            }
            else {
                throw new IInsightFacade_1.InsightError("non-string passed to sField");
            }
        }
        else {
            throw new IInsightFacade_1.InsightError("incorrect key (sField)");
        }
    }
    else if (fieldKeys[0] === (datasetID + "_fullname") || fieldKeys[0] === (datasetID + "_shortname") ||
        fieldKeys[0] === (datasetID + "_number") || fieldKeys[0] === (datasetID + "_name") ||
        fieldKeys[0] === (datasetID + "_address") || fieldKeys[0] === (datasetID + "_type") ||
        fieldKeys[0] === (datasetID + "_furniture") || fieldKeys[0] === (datasetID + "_href")) {
        if ((typeof fieldObject[fieldKeys[0]]) === "string" || fieldObject[fieldKeys[0]] instanceof String) {
            return fieldObject[fieldKeys[0]];
        }
        else {
            throw new IInsightFacade_1.InsightError("non-string passed to sField");
        }
    }
    else {
        throw new IInsightFacade_1.InsightError("incorrect key (sField)");
    }
}
exports.handleSField = handleSField;
// check if string contains asterisks
function checkAsterisks(SField) {
    if (SField.includes("*")) {
        throw new IInsightFacade_1.InsightError("contains *");
    }
}
exports.checkAsterisks = checkAsterisks;
// check if string contains asterisks
function getKind(key) {
    if (key === "dept" || key === "id" || key === "instructor" || key === "title" || key === "uuid"
        || key === "avg" || key === "pass" || key === "fail" || key === "audit" || key === "year") {
        return "courses";
    }
    if (key === "lat" || key === "lon" || key === "seats" || key === "fullname" || key === "shortname" || key === "href"
        || key === "number" || key === "name" || key === "address" || key === "type" || key === "furniture") {
        return "rooms";
    }
    throw new IInsightFacade_1.InsightError("not a course or room");
}
exports.getKind = getKind;
