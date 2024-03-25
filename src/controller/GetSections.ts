// import {InsightError} from "./IInsightFacade";
// import InsightFacade from "./InsightFacade";
import JSZip from "jszip";
// This function gets an array of all valid sections from raw extracted data from individual files.
export function GetSections(rawStringData: Array<Awaited<string>>, id: string) {
	let ret = [];
	let keys = GetKeys(id);

	for (const item of rawStringData) {
		try{
			const parsedData = JSON.parse(item);
			let j = 0;
			while(j < parsedData["result"].length){

				let Dept: string = parsedData["result"][j]["Subject"];
				let Cid: string = parsedData["result"][j]["Course"];
				let Avg: number = parsedData["result"][j]["Avg"];
				let Instructor: string = parsedData["result"][j]["Professor"];
				let Title: string = parsedData["result"][j]["Title"];
				let Pass: number = parsedData["result"][j]["Pass"];
				let Fail: number = parsedData["result"][j]["Fail"];
				let Audit: number = parsedData["result"][j]["Audit"];
				let Uuid: string = parsedData["result"][j]["id"].toString(10);
				let Year: number;
				if(parsedData["result"][j]["Section"] === "overall") {
					Year = 1900;
				} else {
					Year = parseInt(parsedData["result"][j]["Year"], 10);
				}

				ret.push({
					[keys[0]] : Dept,
					[keys[1]] : Cid,
					[keys[2]] : Avg,
					[keys[3]] : Instructor,
					[keys[4]] : Title,
					[keys[5]] : Pass,
					[keys[6]] : Fail,
					[keys[7]] : Audit,
					[keys[8]] : Uuid,
					[keys[9]] : Year
				});
				j++;
			}
		} catch (Error){
			continue;
		}
	}
	return ret;
}
// This function generates keys for sections object.
export function GetKeys(id: string) {
	return [id + "_dept",id + "_id",id + "_avg",id + "_instructor",id + "_title",id
	+ "_pass",id + "_fail",id + "_audit",id + "_uuid",id + "_year"];
}
// This function checks if the id passed to addDataset is valid or not.
export function IsIdValid(id: string, AddedIds: string[]): boolean {
	let temp: string[] = [];
	if(id === null || id === undefined){
		return false;
	}
	temp = id.split("_");
	if(temp.length > 1){
		return false;
	}
	if(id.trim().length === 0){
		return false;
	}
	if(AddedIds.indexOf(id) > -1){
		return false;
	}
	return true;
}
// This function does not check for index. Needed new function since delete requires different index checking.
export function IsIdValidDel(id: string): boolean {
	let temp: string[] = [];
	if(id === null || id === undefined){
		return false;
	}
	temp = id.split("_");
	if(temp.length > 1){
		return false;
	}
	if(id.trim().length === 0){
		return false;
	}
	return true;
}
// This function takes in the jzip object and returns an array of valid file names
export function GetFileNames(FileObj: JSZip): string[] {
	let ret: string[] = [];
	for(let file in FileObj.files){
		if(file.startsWith("courses/") && file !== "courses/"){
			ret.push(file);
		}
	}
	return ret;
}
