"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOrder = exports.compareDESC = exports.handleOrderDesc = exports.compareASC = exports.handleOrderAsc = exports.handleOrderString = void 0;
const IInsightFacade_1 = require("./IInsightFacade");
function handleOrderString(preOrdered, orderKey) {
    const preOrderedObject = JSON.parse(JSON.stringify(preOrdered));
    preOrderedObject.sort(function (a, b) {
        const keyA = JSON.parse(JSON.stringify(a))[orderKey];
        const keyB = JSON.parse(JSON.stringify(b))[orderKey];
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
function handleOrderAsc(preOrdered, orderKeys, orderPos) {
    const preOrderedObject = JSON.parse(JSON.stringify(preOrdered));
    const orderObject = JSON.parse(JSON.stringify(orderKeys));
    preOrderedObject.sort(function (a, b) {
        const keyA = JSON.parse(JSON.stringify(a))[orderObject[orderPos]];
        const keyB = JSON.parse(JSON.stringify(b))[orderObject[orderPos]];
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
function compareASC(object1, object2, order, orderPos) {
    const orderObject = JSON.parse(JSON.stringify(order));
    if (orderObject[orderPos] === undefined) {
        return 0;
    }
    const keyA = JSON.parse(JSON.stringify(object1))[orderObject[orderPos]];
    const keyB = JSON.parse(JSON.stringify(object2))[orderObject[orderPos]];
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
    const preOrderedObject = JSON.parse(JSON.stringify(preOrdered));
    const orderObject = JSON.parse(JSON.stringify(orderKeys));
    preOrderedObject.sort(function (a, b) {
        const keyA = JSON.parse(JSON.stringify(a))[orderObject[orderPos]];
        const keyB = JSON.parse(JSON.stringify(b))[orderObject[orderPos]];
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
    const orderObject = JSON.parse(JSON.stringify(order));
    if (orderObject[orderPos] === undefined) {
        return 0;
    }
    const keyA = JSON.parse(JSON.stringify(object1))[orderObject[orderPos]];
    const keyB = JSON.parse(JSON.stringify(object2))[orderObject[orderPos]];
    if (keyA > keyB) {
        return -1;
    }
    if (keyA < keyB) {
        return 1;
    }
    return compareDESC(object1, object2, order, orderPos + 1);
}
exports.compareDESC = compareDESC;
function handleOrder(filtered, allColumns, queryColumns, queryOrder) {
    const filter = JSON.parse(JSON.stringify(filtered));
    const allColumn = JSON.parse(JSON.stringify(allColumns));
    const Column = JSON.parse(JSON.stringify(queryColumns));
    for (let prop1 in filter) {
        for (let prop2 in allColumns) {
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
            const final = handleOrderString(filter, queryOrder);
            return final;
        }
        throw new IInsightFacade_1.InsightError("Query ORDER key is not in COLUMNS");
    }
    if (typeof queryOrder === "object") {
        const orderObject = JSON.parse(JSON.stringify(queryOrder));
        const keys = orderObject["keys"];
        const dir = orderObject["dir"];
        for (let prop in keys) {
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
            const final = handleOrderDesc(filter, keys, 0);
            return final;
        }
    }
    throw new IInsightFacade_1.InsightError("queryOrder incorrect type");
}
exports.handleOrder = handleOrder;
//# sourceMappingURL=OrderHelpers.js.map