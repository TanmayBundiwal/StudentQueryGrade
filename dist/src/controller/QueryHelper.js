"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryHelper = void 0;
const IInsightFacade_1 = require("./IInsightFacade");
class QueryHelper {
    handleWhereQuery(whereQuery, datasetID, dataset) {
        const whereObject = JSON.parse(JSON.stringify(whereQuery));
        const whereKeys = Object.keys(whereObject);
        if (whereKeys.length === 0) {
            return dataset;
        }
        if (whereKeys.length === 1) {
            switch (whereKeys[0]) {
                case "GT":
                    return this.handleGT(whereObject["GT"], datasetID, dataset);
                case "EQ":
                    return this.handleEQ(whereObject["EQ"], datasetID, dataset);
                case "LT":
                    return this.handleLT(whereObject["LT"], datasetID, dataset);
                case "IS":
                    return this.handleIS(whereObject["IS"], datasetID, dataset);
                case "NOT":
                    return this.handleNot(whereObject["NOT"], datasetID, dataset);
                case "AND":
                    return this.handleAnd(whereObject["AND"], datasetID, dataset);
                case "OR":
                    return this.handleOr(whereObject["OR"], datasetID, dataset);
                default:
                    throw new IInsightFacade_1.InsightError();
            }
        }
        else {
            throw new IInsightFacade_1.InsightError("incorrect number of keys in WHERE");
        }
    }
    handleAnd(andQuery, datasetID, dataset) {
        if (Object.keys(andQuery).length < 1) {
            throw new IInsightFacade_1.InsightError("incorrect number of keys in AND");
        }
        const queryAndObject = JSON.parse(JSON.stringify(andQuery));
        let array = new Array(0);
        let compare = new Array(0);
        let compare2 = new Array(0);
        for (let prop in queryAndObject) {
            compare = JSON.parse(JSON.stringify(this.handleWhereQuery(queryAndObject[prop], datasetID, dataset)));
            if (prop === "0") {
                for (let prop2 in compare) {
                    array.push(compare[prop2]);
                }
            }
            else {
                compare2 = [];
                for (let prop2 in array) {
                    compare2.push(JSON.stringify(array[prop2]));
                }
                array = [];
                for (let prop1 in compare) {
                    if (compare2.includes(JSON.stringify(compare[prop1]))) {
                        array.push(compare[prop1]);
                    }
                }
            }
        }
        return array;
    }
    handleOr(orQuery, datasetID, dataset) {
        if (Object.keys(orQuery).length < 1) {
            throw new IInsightFacade_1.InsightError("incorrect number of keys in OR");
        }
        const queryOrObject = JSON.parse(JSON.stringify(orQuery));
        let stringArray = new Array(0);
        for (let prop in queryOrObject) {
            const array = JSON.parse(JSON.stringify(this.handleWhereQuery(queryOrObject[prop], datasetID, dataset)));
            for (let prop2 in array) {
                if (!(stringArray.includes(JSON.stringify(array[prop2])))) {
                    stringArray.push(JSON.stringify(array[prop2]));
                }
            }
        }
        let returnArray = new Array(0);
        for (let prop in stringArray) {
            returnArray.push(JSON.parse(stringArray[prop]));
        }
        return returnArray;
    }
    handleNot(notQuery, datasetID, dataset) {
        if (Object.keys(notQuery).length !== 1) {
            throw new IInsightFacade_1.InsightError("incorrect number of keys in NOT");
        }
        const datasetObject = JSON.parse(JSON.stringify(dataset));
        const queryNotObject = JSON.parse(JSON.stringify(notQuery));
        const array1 = JSON.parse(JSON.stringify(this.handleWhereQuery(queryNotObject, datasetID, dataset)));
        let compareArray = new Array(0);
        for (let prop1 in array1) {
            compareArray.push(JSON.stringify(array1[prop1]));
        }
        let returnArray = new Array(0);
        for (let prop2 in datasetObject) {
            if (!(compareArray.includes(JSON.stringify(datasetObject[prop2])))) {
                returnArray.push(datasetObject[prop2]);
            }
        }
        return returnArray;
    }
    handleGT(GTQuery, datasetID, dataset) {
        const returnArray = new Array(0);
        const datasetString = JSON.stringify(dataset);
        const datasetObject = JSON.parse(datasetString);
        if (Object.keys(GTQuery).length !== 1) {
            throw new IInsightFacade_1.InsightError("incorrect number of keys in GT");
        }
        const compare = this.handleMField(GTQuery, datasetID);
        for (const prop in dataset) {
            if (datasetObject[prop][Object.keys(GTQuery)[0]] > compare) {
                returnArray.push(datasetObject[prop]);
            }
        }
        return returnArray;
    }
    handleLT(LTQuery, datasetID, dataset) {
        const returnArray = new Array(0);
        const datasetString = JSON.stringify(dataset);
        const datasetObject = JSON.parse(datasetString);
        if (Object.keys(LTQuery).length !== 1) {
            throw new IInsightFacade_1.InsightError("incorrect number of keys in LT");
        }
        const compare = this.handleMField(LTQuery, datasetID);
        for (const prop in dataset) {
            if (datasetObject[prop][Object.keys(LTQuery)[0]] < compare) {
                returnArray.push(datasetObject[prop]);
            }
        }
        return returnArray;
    }
    handleEQ(EQQuery, datasetID, dataset) {
        const returnArray = new Array(0);
        const datasetString = JSON.stringify(dataset);
        const datasetObject = JSON.parse(datasetString);
        if (Object.keys(EQQuery).length !== 1) {
            throw new IInsightFacade_1.InsightError("incorrect number of keys in IS");
        }
        const compare = this.handleMField(EQQuery, datasetID);
        for (const prop in dataset) {
            if (datasetObject[prop][Object.keys(EQQuery)[0]] === compare) {
                returnArray.push(datasetObject[prop]);
            }
        }
        return returnArray;
    }
    handleIS(ISQuery, datasetID, dataset) {
        const returnArray = new Array(0);
        const datasetString = JSON.stringify(dataset);
        const datasetObject = JSON.parse(datasetString);
        if (Object.keys(ISQuery).length !== 1) {
            throw new IInsightFacade_1.InsightError("incorrect number of keys in IS");
        }
        let SField = this.handleSField(ISQuery, datasetID);
        if ((SField.charAt(0) === "*") && (SField.charAt(SField.length - 1) === "*")) {
            SField = SField.slice(1, SField.length - 1);
            this.checkAsterisks(SField);
            for (const prop in dataset) {
                if (datasetObject[prop][Object.keys(ISQuery)[0]].includes(SField)) {
                    returnArray.push(datasetObject[prop]);
                }
            }
        }
        else if (SField.charAt(0) === "*") {
            SField = SField.slice(1, SField.length);
            this.checkAsterisks(SField);
            for (const prop in dataset) {
                if (datasetObject[prop][Object.keys(ISQuery)[0]].endsWith(SField)) {
                    returnArray.push(datasetObject[prop]);
                }
            }
        }
        else if (SField.charAt(SField.length - 1) === "*") {
            SField = SField.slice(0, SField.length - 1);
            this.checkAsterisks(SField);
            for (const prop in dataset) {
                if (datasetObject[prop][Object.keys(ISQuery)[0]].startsWith(SField)) {
                    returnArray.push(datasetObject[prop]);
                }
            }
        }
        else {
            this.checkAsterisks(SField);
            for (const prop in dataset) {
                if (datasetObject[prop][Object.keys(ISQuery)[0]] === SField) {
                    returnArray.push(datasetObject[prop]);
                }
            }
        }
        return returnArray;
    }
    handleMField(field, datasetID) {
        const fieldKeys = Object.keys(field);
        const fieldString = JSON.stringify(field);
        const fieldObject = JSON.parse(fieldString);
        if (fieldKeys.length !== 1) {
            throw new IInsightFacade_1.InsightError("incorrect number of keys in mField");
        }
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
            throw new IInsightFacade_1.InsightError("incorrect key (sField)");
        }
    }
    handleSField(field, datasetID) {
        const fieldKeys = Object.keys(field);
        const fieldString = JSON.stringify(field);
        const fieldObject = JSON.parse(fieldString);
        if (fieldKeys.length !== 1) {
            throw new IInsightFacade_1.InsightError("incorrect number of keys in sField");
        }
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
    handleOrder(preOrdered, orderKey) {
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
    checkAsterisks(SField) {
        if (SField.includes("*")) {
            throw new IInsightFacade_1.InsightError("contains *");
        }
    }
}
exports.QueryHelper = QueryHelper;
//# sourceMappingURL=QueryHelper.js.map