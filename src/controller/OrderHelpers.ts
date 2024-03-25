import {InsightError} from "./IInsightFacade";

// order array by key (ascending), if order = string
export function handleOrderString(preOrdered: object, orderKey: string): object {
	const preOrderedObject = JSON.parse(JSON.stringify(preOrdered));
	preOrderedObject.sort(function (a: object, b: object) {
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

// order array by first (ascending), if order = object
export function handleOrderAsc(preOrdered: object, orderKeys: object, orderPos: number): object {
	const preOrderedObject = JSON.parse(JSON.stringify(preOrdered));
	const orderObject = JSON.parse(JSON.stringify(orderKeys));
	preOrderedObject.sort(function (a: object, b: object) {
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

// compare 2 objects by nth key (ASC)
export function compareASC(object1: object, object2: object, order: object, orderPos: number): number {
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

export function handleOrderDesc(preOrdered: object, orderKeys: object, orderPos: number): object {
	const preOrderedObject = JSON.parse(JSON.stringify(preOrdered));
	const orderObject = JSON.parse(JSON.stringify(orderKeys));
	preOrderedObject.sort(function (a: object, b: object) {
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

export function compareDESC(object1: object, object2: object, order: object, orderPos: number): number {
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


// handles columns and order of query
export function handleOrder(filtered: object, allColumns: object, queryColumns: object, queryOrder: any): object {
	const filter = JSON.parse(JSON.stringify(filtered));
	const allColumn = JSON.parse(JSON.stringify(allColumns));
	const Column = JSON.parse(JSON.stringify(queryColumns));
	for(let prop1 in filter) {
		for(let prop2 in allColumns) {
			if(!(Column.includes(allColumn[prop2]))) {
				delete filter[prop1][allColumn[prop2]];
			}
		}
	}
	if (queryOrder === undefined) {
		return filter;
	}
	if(typeof queryOrder === "string") {
		if (Column.includes(queryOrder)) {
			const final = handleOrderString(filter, queryOrder);
			return final;
		}
		throw new InsightError("Query ORDER key is not in COLUMNS");
	}
	if (typeof queryOrder === "object") {
		const orderObject = JSON.parse(JSON.stringify(queryOrder));
		const keys = orderObject["keys"];
		const dir = orderObject["dir"];
		for (let prop in keys) {
			if (!Column.includes(keys[prop])){
				throw new InsightError("Query ORDER key is not in COLUMNS");
			}
		}
		if(keys === undefined || dir === undefined) {
			throw new InsightError("missing keys or dir");
		}
		if(typeof keys !== "object" || typeof dir !== "string") {
			throw new InsightError("wrong type for keys or dir");
		}
		if(dir === "UP") {
			return handleOrderAsc(filter, keys, 0);
		}
		if(dir === "DOWN") {
			const final = handleOrderDesc(filter, keys, 0);
			// console.log(final);
			return final;
		}
	}
	throw new InsightError("queryOrder incorrect type");
}
