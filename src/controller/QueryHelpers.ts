import {InsightError} from "./IInsightFacade";

export function handleWhereQuery(whereQuery: object, datasetID: string, dataset: object, kind: string): object {
	const whereObject = JSON.parse(JSON.stringify(whereQuery));
	const whereKeys = Object.keys(whereObject);
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
				throw new InsightError();
		}
	} else {
		throw new InsightError("incorrect number of keys in WHERE");
	}
}

export function handleAnd(andQuery: object, datasetID: string, dataset: object, kind: string): object {
	if (Object.keys(andQuery).length < 1) {
		throw new InsightError("incorrect number of keys in AND");
	}
	const queryAndObject = JSON.parse(JSON.stringify(andQuery));
	let array = new Array(0);
	let compare = new Array(0);
	let compare2 = new Array(0);

	for (let prop in queryAndObject) {
		compare = JSON.parse(JSON.stringify(handleWhereQuery(queryAndObject[prop], datasetID, dataset, kind)));
		if (prop === "0") {
			for (let prop2 in compare) {
				array.push(compare[prop2]);
			}
		} else {
			compare2 = [];
			for (let prop2 in array) {
				compare2.push(JSON.stringify(array[prop2]));
			}
			array = [];
			for (let prop1 in compare) {
				if(compare2.includes(JSON.stringify(compare[prop1]))) {
					array.push(compare[prop1]);
				}
			}
		}
	}
	return array;
}

export function handleOr(orQuery: object, datasetID: string, dataset: object, kind: string): object {
	if (Object.keys(orQuery).length < 1) {
		throw new InsightError("incorrect number of keys in OR");
	}
	const queryOrObject = JSON.parse(JSON.stringify(orQuery));
	let stringArray = new Array(0);
	for (let prop in queryOrObject) {
		const array = JSON.parse(JSON.stringify(handleWhereQuery(queryOrObject[prop], datasetID, dataset, kind)));
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

export function handleNot(notQuery: object, datasetID: string, dataset: object, kind: string): object {
	if (Object.keys(notQuery).length !== 1) {
		throw new InsightError("incorrect number of keys in NOT");
	}
	const datasetObject = JSON.parse(JSON.stringify(dataset));
	const queryNotObject = JSON.parse(JSON.stringify(notQuery));
	const array1 = JSON.parse(JSON.stringify(handleWhereQuery(queryNotObject, datasetID, dataset, kind)));
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

export function handleGT(GTQuery: object, datasetID: string, dataset: object, kind: string): object {
	const returnArray = new Array(0);
	const datasetString = JSON.stringify(dataset);
	const datasetObject = JSON.parse(datasetString);
	if (Object.keys(GTQuery).length !== 1) {
		throw new InsightError("incorrect number of keys in GT");
	}
	const compare = handleMField(GTQuery, datasetID, kind);
	for (const prop in dataset) {
		if (datasetObject[prop][Object.keys(GTQuery)[0]] > compare) {
			returnArray.push(datasetObject[prop]);
		}
	}
	return returnArray;
}

export function handleLT(LTQuery: object, datasetID: string, dataset: object, kind: string) {
	const returnArray = new Array(0);
	const datasetString = JSON.stringify(dataset);
	const datasetObject = JSON.parse(datasetString);
	if (Object.keys(LTQuery).length !== 1) {
		throw new InsightError("incorrect number of keys in LT");
	}
	const compare = handleMField(LTQuery, datasetID, kind);
	for (const prop in dataset) {
		if (datasetObject[prop][Object.keys(LTQuery)[0]] < compare) {
			returnArray.push(datasetObject[prop]);
		}
	}
	return returnArray;
}

export function handleEQ(EQQuery: object, datasetID: string, dataset: object, kind: string) {
	const returnArray = new Array(0);
	const datasetString = JSON.stringify(dataset);
	const datasetObject = JSON.parse(datasetString);
	if (Object.keys(EQQuery).length !== 1) {
		throw new InsightError("incorrect number of keys in IS");
	}
	const compare = handleMField(EQQuery, datasetID, kind);
	for (const prop in dataset) {
		if (datasetObject[prop][Object.keys(EQQuery)[0]] === compare) {
			returnArray.push(datasetObject[prop]);
		}
	}
	return returnArray;
}

export function handleIS(ISQuery: object, datasetID: string, dataset: object, kind: string): object {
	const returnArray = new Array(0);
	const datasetString = JSON.stringify(dataset);
	const datasetObject = JSON.parse(datasetString);
	if (Object.keys(ISQuery).length !== 1) {
		throw new InsightError("incorrect number of keys in IS");
	}
	let SField: string = handleSField(ISQuery, datasetID, kind);
	if((SField.charAt(0) === "*") && (SField.charAt(SField.length - 1) === "*")) {
		SField = SField.slice(1, SField.length - 1);
		checkAsterisks(SField);
		for (const prop in dataset) {
			if (datasetObject[prop][Object.keys(ISQuery)[0]].includes(SField)) {
				returnArray.push(datasetObject[prop]);
			}
		}
	} else if(SField.charAt(0) === "*") {
		SField = SField.slice(1, SField.length);
		checkAsterisks(SField);
		for (const prop in dataset) {
			if (datasetObject[prop][Object.keys(ISQuery)[0]].endsWith(SField)) {
				returnArray.push(datasetObject[prop]);
			}
		}
	} else if(SField.charAt(SField.length - 1) === "*") {
		SField = SField.slice(0, SField.length - 1);
		checkAsterisks(SField);
		for (const prop in dataset) {
			if (datasetObject[prop][Object.keys(ISQuery)[0]].startsWith(SField)) {
				returnArray.push(datasetObject[prop]);
			}
		}
	} else {
		checkAsterisks(SField);
		for (const prop in dataset) {
			if (datasetObject[prop][Object.keys(ISQuery)[0]] === SField) {
				returnArray.push(datasetObject[prop]);
			}
		}
	}
	return returnArray;
}

export function handleMField(field: object, datasetID: string, kind: string): number {
	const fieldKeys = Object.keys(field);
	const fieldString = JSON.stringify(field);
	const fieldObject = JSON.parse(fieldString);

	if (fieldKeys.length !== 1) {
		throw new InsightError("incorrect number of keys in mField");
	}
	if(kind === "courses") {
		if (fieldKeys[0] === (datasetID + "_avg") || fieldKeys[0] === (datasetID + "_pass") ||
			fieldKeys[0] === (datasetID + "_fail") || fieldKeys[0] === (datasetID + "_audit") ||
			fieldKeys[0] === (datasetID + "_year")) {
			if ((typeof fieldObject[fieldKeys[0]]) === "number" || fieldObject[fieldKeys[0]] instanceof Number) {
				return fieldObject[fieldKeys[0]];
			} else {
				throw new InsightError("non-number passed to mField");
			}
		} else {
			throw new InsightError("incorrect key (mField)");
		}
	} else if (fieldKeys[0] === (datasetID + "_lat") || fieldKeys[0] === (datasetID + "_lon") ||
		fieldKeys[0] === (datasetID + "_seats")) {
		if ((typeof fieldObject[fieldKeys[0]]) === "number" || fieldObject[fieldKeys[0]] instanceof Number) {
			return fieldObject[fieldKeys[0]];
		} else {
			throw new InsightError("non-number passed to mField");
		}
	} else {
		throw new InsightError("incorrect key (mField)");
	}
}

export function handleSField(field: object, datasetID: string, kind: string): string {
	const fieldKeys = Object.keys(field);
	const fieldString = JSON.stringify(field);
	const fieldObject = JSON.parse(fieldString);

	if (fieldKeys.length !== 1) {
		throw new InsightError("incorrect number of keys in sField");
	}
	if(kind === "courses"){
		if (fieldKeys[0] === (datasetID + "_dept") || fieldKeys[0] === (datasetID + "_id") ||
			fieldKeys[0] === (datasetID + "_instructor") || fieldKeys[0] === (datasetID + "_title") ||
			fieldKeys[0] === (datasetID + "_uuid")) {
			if ((typeof fieldObject[fieldKeys[0]]) === "string" || fieldObject[fieldKeys[0]] instanceof String) {
				return fieldObject[fieldKeys[0]];
			} else {
				throw new InsightError("non-string passed to sField");
			}
		} else {
			throw new InsightError("incorrect key (sField)");
		}
	} else if (fieldKeys[0] === (datasetID + "_fullname") || fieldKeys[0] === (datasetID + "_shortname") ||
		fieldKeys[0] === (datasetID + "_number") || fieldKeys[0] === (datasetID + "_name") ||
		fieldKeys[0] === (datasetID + "_address") || fieldKeys[0] === (datasetID + "_type") ||
		fieldKeys[0] === (datasetID + "_furniture") || fieldKeys[0] === (datasetID + "_href")) {
		if ((typeof fieldObject[fieldKeys[0]]) === "string" || fieldObject[fieldKeys[0]] instanceof String) {
			return fieldObject[fieldKeys[0]];
		} else {
			throw new InsightError("non-string passed to sField");
		}
	} else {
		throw new InsightError("incorrect key (sField)");
	}
}

// check if string contains asterisks
export function checkAsterisks(SField: string) {
	if(SField.includes("*")) {
		throw new InsightError("contains *");
	}
}

// check if string contains asterisks
export function getKind(key: string): string {
	if (key === "dept" || key === "id" || key === "instructor" || key === "title" || key === "uuid"
	|| key === "avg" || key === "pass" || key === "fail" || key === "audit" || key === "year") {
		return "courses";
	}
	if (key === "lat" || key === "lon" || key === "seats" || key === "fullname" || key === "shortname" || key === "href"
		|| key === "number" || key === "name" || key === "address" || key === "type" || key === "furniture") {
		return "rooms";
	}
	throw new InsightError("not a course or room");
}
