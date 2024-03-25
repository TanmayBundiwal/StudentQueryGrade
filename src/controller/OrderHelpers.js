"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOrder = exports.compareDESC = exports.handleOrderDesc = exports.compareASC = exports.handleOrderAsc = exports.handleOrderString = void 0;
var IInsightFacade_1 = require("./IInsightFacade");
// order array by key (ascending), if order = string
function handleOrderString(preOrdered, orderKey) {
    var preOrderedObject = JSON.parse(JSON.stringify(preOrdered));
    preOrderedObject.sort(function (a, b) {
        var keyA = JSON.parse(JSON.stringify(a))[orderKey];
        var keyB = JSON.parse(JSON.stringify(b))[orderKey];
        if (keyA < keyB) {
            return -1;
        }
        if (keyA > keyB) {
            return 1;
        }
        return 0;
    });
    return preOrderedObject;
}
exports.handleOrderString = handleOrderString;
// order array by first (ascending), if order = object
function handleOrderAsc(preOrdered, orderKeys, orderPos) {
    var preOrderedObject = JSON.parse(JSON.stringify(preOrdered));
    var orderObject = JSON.parse(JSON.stringify(orderKeys));
    preOrderedObject.sort(function (a, b) {
        var keyA = JSON.parse(JSON.stringify(a))[orderObject[orderPos]];
        var keyB = JSON.parse(JSON.stringify(b))[orderObject[orderPos]];
        if (keyA < keyB) {
            return -1;
        }
        if (keyA > keyB) {
            return 1;
        }
        return compareASC(a, b, orderKeys, 1);
    });
    return preOrderedObject;
}
exports.handleOrderAsc = handleOrderAsc;
// compare 2 objects by nth key (ASC)
function compareASC(object1, object2, order, orderPos) {
    var orderObject = JSON.parse(JSON.stringify(order));
    if (orderObject[orderPos] === undefined) {
        return 0;
    }
    var keyA = JSON.parse(JSON.stringify(object1))[orderObject[orderPos]];
    var keyB = JSON.parse(JSON.stringify(object2))[orderObject[orderPos]];
    if (keyA < keyB) {
        return -1;
    }
    if (keyA > keyB) {
        return 1;
    }
    return compareASC(object1, object2, order, orderPos + 1);
}
exports.compareASC = compareASC;
function handleOrderDesc(preOrdered, orderKeys, orderPos) {
    var preOrderedObject = JSON.parse(JSON.stringify(preOrdered));
    var orderObject = JSON.parse(JSON.stringify(orderKeys));
    preOrderedObject.sort(function (a, b) {
        var keyA = JSON.parse(JSON.stringify(a))[orderObject[orderPos]];
        var keyB = JSON.parse(JSON.stringify(b))[orderObject[orderPos]];
        if (keyA > keyB) {
            return -1;
        }
        if (keyA < keyB) {
            return 1;
        }
        return compareDESC(a, b, orderKeys, 1);
    });
    return preOrderedObject;
}
exports.handleOrderDesc = handleOrderDesc;
function compareDESC(object1, object2, order, orderPos) {
    var orderObject = JSON.parse(JSON.stringify(order));
    if (orderObject[orderPos] === undefined) {
        return 0;
    }
    var keyA = JSON.parse(JSON.stringify(object1))[orderObject[orderPos]];
    var keyB = JSON.parse(JSON.stringify(object2))[orderObject[orderPos]];
    if (keyA > keyB) {
        return -1;
    }
    if (keyA < keyB) {
        return 1;
    }
    return compareDESC(object1, object2, order, orderPos + 1);
}
exports.compareDESC = compareDESC;
// handles columns and order of query
function handleOrder(filtered, allColumns, queryColumns, queryOrder) {
    var filter = JSON.parse(JSON.stringify(filtered));
    var allColumn = JSON.parse(JSON.stringify(allColumns));
    var Column = JSON.parse(JSON.stringify(queryColumns));
    for (var prop1 in filter) {
        for (var prop2 in allColumns) {
            if (!(Column.includes(allColumn[prop2]))) {
                delete filter[prop1][allColumn[prop2]];
            }
        }
    }
    if (queryOrder === undefined) {
        return filter;
    }
    if (typeof queryOrder === "string") {
        if (Column.includes(queryOrder)) {
            var final = handleOrderString(filter, queryOrder);
            return final;
        }
        throw new IInsightFacade_1.InsightError("Query ORDER key is not in COLUMNS");
    }
    if (typeof queryOrder === "object") {
        var orderObject = JSON.parse(JSON.stringify(queryOrder));
        var keys = orderObject["keys"];
        var dir = orderObject["dir"];
        for (var prop in keys) {
            if (!Column.includes(keys[prop])) {
                throw new IInsightFacade_1.InsightError("Query ORDER key is not in COLUMNS");
            }
        }
        if (keys === undefined || dir === undefined) {
            throw new IInsightFacade_1.InsightError("missing keys or dir");
        }
        if (typeof keys !== "object" || typeof dir !== "string") {
            throw new IInsightFacade_1.InsightError("wrong type for keys or dir");
        }
        if (dir === "UP") {
            return handleOrderAsc(filter, keys, 0);
        }
        if (dir === "DOWN") {
            var final = handleOrderDesc(filter, keys, 0);
            // console.log(final);
            return final;
        }
    }
    throw new IInsightFacade_1.InsightError("queryOrder incorrect type");
}
exports.handleOrder = handleOrder;
