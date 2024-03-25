import {Decimal} from "decimal.js";
import {InsightError} from "./IInsightFacade";
import {handleAnd, handleNot, handleOr} from "./QueryHelpers";

export function handleTransform(filtered: object, transformations: object, queryColumns: object) {
	const dataset = JSON.parse(JSON.stringify(filtered));
	const transformObject = JSON.parse(JSON.stringify(transformations));
	let groups: {[index: string]: object[]} = {};
	const queryGroup = transformObject["GROUP"];
	const queryApply = transformObject["APPLY"];
	const columns = JSON.parse(JSON.stringify(queryColumns));
	if(queryGroup === undefined || queryApply === undefined || (Object.keys(transformObject).length > 2)) {
		throw new InsightError("transform incorrect keys");
	}
	for(let prop in queryGroup) {
		if (!columns.includes(queryGroup[prop])){
			throw new InsightError("group key is not a column");
		}
	}
	for (let prop in dataset) {
		let groupName = [];
		for (let prop2 in queryGroup) {
			groupName.push(dataset[prop][queryGroup[prop2]]);
		}
		let group = JSON.stringify(groupName);
		if(groups[group] === undefined) {
			groups[group] = [dataset[prop]];
		} else {
			groups[group].push(dataset[prop]);
		}
	}
	let final = handleApply(groups, queryApply, queryGroup);
	return final;
}

export function handleApply(groupOb: object, queryApply: object, queryGroup: object): object {
	const dataset = JSON.parse(JSON.stringify(groupOb));
	const applyOb = JSON.parse(JSON.stringify(queryApply));
	let applyKeyArray = new Array(0);
	for (let prop in applyOb) {
		const applyKeys = Object.keys(applyOb[prop]);
		const applyBodyKeys = Object.keys(applyOb[prop][applyKeys[0]]);
		if (applyKeys.length > 1 || applyKeys[0] === undefined ||
			applyBodyKeys.length > 1 || applyBodyKeys[0] === undefined ||
			applyKeyArray.includes(JSON.stringify(applyKeys[0])) || typeof applyKeys[0] !== "string" ) {
			throw new InsightError("error in apply keys");
		}
		applyKeyArray.push(JSON.stringify(applyKeys[0]));
	}
	const final = new Array(0);
	const groups = JSON.parse(JSON.stringify(queryGroup));
	for (let key in dataset) {
		let keyOb = JSON.parse(key);
		let newOb: {[index: string]: any} = {};
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
					throw new InsightError("wrong key");
			}
		}
		final.push(newOb);
	}
	return final;
}

export function handleMin(key: string, data: object): number {
	const dataOb = JSON.parse(JSON.stringify(data));
	let min: number = Infinity;
	for(let prop in data) {
		if(typeof dataOb[prop][key] === "number") {
			if(dataOb[prop][key] < min) {
				min = dataOb[prop][key];
			}
		} else {
			throw new InsightError("non number passed to min");
		}
	}
	return min;
}

export function handleMax(key: string, data: object): number {
	const dataOb = JSON.parse(JSON.stringify(data));
	let max: number = 0;
	for(let prop in data) {
		if(typeof dataOb[prop][key] === "number") {
			if(dataOb[prop][key] > max) {
				max = dataOb[prop][key];
			}
		} else {
			throw new InsightError("non number passed to max");
		}
	}
	return max;
}

export function handleAvg(key: string, data: object): number {
	const dataOb = JSON.parse(JSON.stringify(data));
	let total: Decimal = new Decimal(0);
	let numRows: number = Object.keys(dataOb).length;
	for(let prop in data) {
		if(typeof dataOb[prop][key] === "number") {
			let toAdd: Decimal = new Decimal(dataOb[prop][key]);
			total = Decimal.add(total, toAdd);
		} else {
			throw new InsightError("non number passed to avg");
		}
	}
	// console.log(total);
	let avg = total.toNumber() / numRows;
	return Number(avg.toFixed(2));
}

export function handleSum(key: string, data: object): number {
	const dataOb = JSON.parse(JSON.stringify(data));
	let sum: number = 0;

	for(let prop in data) {
		if(typeof dataOb[prop][key] === "number") {
			sum += dataOb[prop][key];
		} else {
			throw new InsightError("non number passed to su,");
		}
	}
	return Number(sum.toFixed(2));
}


export function handleCount(key: string, data: object): number {
	const dataOb = JSON.parse(JSON.stringify(data));
	let array = new Array(0);
	for(let prop in dataOb) {
		if(dataOb[prop][key] !== undefined) {
			array.push(dataOb[prop][key]);
		} else {
			throw new InsightError("error in count");
		}
	}
	return new Set(array).size;
}


