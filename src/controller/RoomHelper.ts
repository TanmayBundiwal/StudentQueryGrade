import {InsightError} from "./IInsightFacade";
import JSZip from "jszip";
import parse5 from "parse5";
import * as http from "http";

export function GetRooms(RBuildings: string[], GLocation: any[], RCodes: string[], RAddress:
	string[], parsedRoomFiles: any[], id: string) {
	let ret = [];
	let roomData: any[] = [];
	let keys = GetRoomKeys(id);

	for (let i = 0; i < RAddress.length; i++) {
		// console.log("==============================");
		let capacity = RoomTreeExplorer(roomData,parsedRoomFiles[i],
			"views-field views-field-field-room-capacity", false);
		roomData = [];
		let furniture = RoomTreeExplorer(roomData,parsedRoomFiles[i],
			"views-field views-field-field-room-furniture", false);
		roomData = [];
		let type = RoomTreeExplorer(roomData,parsedRoomFiles[i], "views-field views-field-field-room-type", false);
		roomData = [];
		let number = RoomTreeExplorer(roomData,parsedRoomFiles[i], "views-field views-field-field-room-number", false);
		roomData = [];
		let href = RoomTreeExplorer(roomData,parsedRoomFiles[i], "views-field views-field-field-room-number", true);
		roomData = [];

		if(capacity.length !== 0){
			let j = 0;
			while(j < capacity.length){
				ret.push({
					[keys[0]] : RBuildings[i],
					[keys[1]] : RCodes[i],
					[keys[2]] : number[j],
					[keys[3]] : RCodes[i] + "_" + number[j],
					[keys[4]] : RAddress[i],
					[keys[5]] : GLocation[i].lat,
					[keys[6]] : GLocation[i].lon,
					[keys[7]] : parseInt(capacity[j], 10),
					[keys[8]] : type[j],
					[keys[9]] : furniture[j],
					[keys[10]] : href[j]
				});
				j++;
			}
		}
	}

	return ret;
}

export function GetGLocation(RAddress: string[]): Promise<string[]>{
	return new Promise<string[]>((resolve, reject) => {
		let url: string;
		let response:  any[] = [];
		let lat: number[] = [];
		let lon: number[] = [];
		for(const item of RAddress){
			if(item !== undefined){
				url = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team633/" + encodeURI(item);
				response.push(new Promise((fulfill) => {
					http.get(url, (res: any) => {
						res.setEncoding("utf8");
						res.on("data", (chunk: any) => {
							let result = JSON.parse(chunk);
							lat.push(result.lat);
							lon.push(result.lon);
							fulfill(result);
						});
					});
				}));
			}
		}
		resolve( Promise.all(response) );
	});
}

export function TreeExplorer(RoomsData: string[], obj: any, class_: string, buildingName: boolean): string[] {
	for(let child of obj.childNodes){
		if(Object.keys(child).includes("childNodes")){
			if(child.tagName === "td"){
				if(child.attrs[0].value === class_){
					if(class_ === "views-field views-field-title" && !buildingName){
						RoomsData.push(child.childNodes[1].attrs[0].value.replace(".","rooms"));
					} else if(class_ === "views-field views-field-title" && buildingName){
						RoomsData.push(child.childNodes[1].childNodes[0].value);
					} else{
						RoomsData.push(child.childNodes[0].value.trim());
					}
				}
			}
			TreeExplorer(RoomsData, child, class_, buildingName);
		}
	}
	return RoomsData;
}

export function RoomTreeExplorer(RoomsData: string[], obj: any, class_: string, href: boolean): string [] {

	for(let child of obj.childNodes){
		if(Object.keys(child).includes("childNodes")){
			if(child.tagName === "td"){
				if(child.attrs[0].value === class_){
					if(class_ === "views-field views-field-field-room-number" && href){
						// console.log(class_ + "    " + child.childNodes[1].attrs[0].value);
						RoomsData.push(child.childNodes[1].attrs[0].value);
					} else if(class_ === "views-field views-field-field-room-number" && !href){
						// console.log(class_ + "    " + child.childNodes[1].childNodes[0].value);
						RoomsData.push(child.childNodes[1].childNodes[0].value);
					} else{
						// console.log(class_ + "    " + child.childNodes[0].value.trim());
						RoomsData.push(child.childNodes[0].value.trim());
					}
				}
			}
			RoomTreeExplorer(RoomsData, child, class_, href);
		}
	}
	return RoomsData;
}

export function GetRoomKeys(id: string) {
	return [id + "_fullname",id + "_shortname",id + "_number",id + "_name",id + "_address",id
	+ "_lat",id + "_lon",id + "_seats",id + "_type",id + "_furniture", id + "_href"];
}

// Got from stack over flow. Put here to check if file was not getting written because the promise was resolving before the write command could complete.
export function sleep(milliseconds: number) {
	let start = new Date().getTime();
	for (let i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}
