import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";


import * as roomhelper from "./RoomHelper";
import JSZip from "jszip";
import * as fs from "fs-extra";
import * as getSection from "./GetSections";
import parse5 from "parse5";
import * as help from "./QueryHelpers";
import * as orderHelpers from "./OrderHelpers";
import * as tHelpers from "./TransformationHelpers";
import {getKind} from "./QueryHelpers";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export default class InsightFacade implements IInsightFacade {

	private AddedIds: string[];
	private Datasets: InsightDataset[] = [];
	private RoomsData: string[] = [];		// Temp Variable for passing data between files
	private RCodes: string[] = [];			// Building Short Names
	private RAddress: string[] = [];		// Building Addresses with spaces
	private RBuildings: string[] = [];		// Building Names
	private Rlinks: string[] = [];			// Building Links in the folder
	private GLocation: any[] = [];		// Building Lat and Lon


	constructor() {
		console.log("InsightFacadeImpl::init()");
		this.AddedIds = [];
	}


	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if(!getSection.IsIdValid(id, this.AddedIds)){
			return Promise.reject(new InsightError("invalid ID"));
		}
		if(kind === InsightDatasetKind.Rooms){
			try{
				await this.addRooms(id, content, kind);
				return Promise.resolve(this.AddedIds);
			} catch (Error){
				return Promise.reject(new InsightError("Unable to add Rooms Dataset"));
			}
		} else {
			return new Promise<string[]>((resolve, reject) => {
				let FileNames: string[] = [];
				let zipVar = new JSZip();
				zipVar.loadAsync(content, {base64: true})
					.then(async (allFiles) => {
						FileNames = getSection.GetFileNames(allFiles);
						if (FileNames.length === 0 || FileNames.length === undefined) {
							reject(new InsightError("No valid sections"));
						}
						let allData = this.getFiles(FileNames, allFiles);
						return Promise.all(allData);
					})
					.then((rawStringData) => {
						let sections = getSection.GetSections(rawStringData, id);
						if(sections.length === 0){
							reject(new InsightError("No sections found"));
						}
						return Promise.resolve(sections);
					})
					.then((Sections) =>{
						this.PushDataset(id,Sections.length, InsightDatasetKind.Courses);
						fs.ensureDirSync("./data/");
						let path = "./data/" + id + ".json";
						try{
							fs.writeJsonSync(path,Sections);
						}catch (Error){
							reject (new InsightError("Couldn't write file"));
						}
						this.AddedIds.push(id);
						resolve(this.AddedIds);
					})
					.catch((Error) => {
						throw new InsightError("Unable to add dataset");
					});
			});
		}
	}

	private getFiles(FileNames: string[], allFiles: JSZip): Array<Promise<string>> {
		let allData: Array<Promise<string>> = [];
		for (const item of FileNames) {
			if(allFiles.file(item) !== null){
				allData.push(allFiles.file(item)!.async("string"));
			}
		}
		return allData;
	}

	private addRooms(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			let zipVar = new JSZip();
			zipVar.loadAsync(content, {base64: true})
				.then(async (allFiles) => {
					allFiles.file("rooms/index.htm")!.async("string")
						.then((indexFile) => {
							let parsedFile = parse5.parse(indexFile);
							this.getIndexfields(parsedFile);
							return Promise.resolve(roomhelper.GetGLocation(this.RAddress));
						})
						.catch((Error) => {
							throw new InsightError("Unable to read Index file");
						})
						.then((Geolocations) => {
							this.GLocation = Geolocations;
							let retP: Array<Promise<string>> = [];
							for (const item of this.Rlinks) {
								if (allFiles.file(item) !== null) {
									retP.push(allFiles.file(item)!.async("string"));
								}
							}
							return Promise.all(retP);
						})
						.then((RawFileData) => {
							let parsedRoomFiles: any[] = [];
							for (let File of RawFileData) {
								parsedRoomFiles.push(parse5.parse(File));
							}
							let rooms = roomhelper.GetRooms(this.RBuildings, this.GLocation, this.RCodes, this.RAddress,
								parsedRoomFiles, id);
							return Promise.resolve(rooms);
						})
						.then((rooms) => {
							fs.ensureDirSync("./data/");
							let path = "./data/" + id + ".json";
							try {
								fs.writeJsonSync(path, rooms);
							} catch (Error) {
								reject(new InsightError("Couldn't write file"));
							}
							this.clearVariables();
							this.AddedIds.push(id);
							this.PushDataset(id, rooms.length, InsightDatasetKind.Rooms);
							resolve(this.AddedIds); // If you comment it, the file gets written perfectly, doesn't get written when you resolve it.
						});
				});
		});
	}

	private clearVariables() {
		this.RCodes = [];
		this.RoomsData = [];
		this.Rlinks = [];
		this.GLocation = [];
		this.RAddress = [];
		this.RBuildings = [];
	}

	private getIndexfields(parsedFile: any) {
		this.RCodes = roomhelper.TreeExplorer(this.RoomsData, parsedFile,
			"views-field views-field-field-building-code", false);
		this.RoomsData = [];
		this.RAddress = roomhelper.TreeExplorer(this.RoomsData, parsedFile,
			"views-field views-field-field-building-address", false);
		this.RoomsData = [];
		this.Rlinks = roomhelper.TreeExplorer(this.RoomsData, parsedFile, "views-field views-field-title", false);
		this.RoomsData = [];
		this.RBuildings = roomhelper.TreeExplorer(this.RoomsData, parsedFile, "views-field views-field-title", true);
	}

	public removeDataset(id: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			if(!getSection.IsIdValidDel(id)){
				reject(new InsightError("Invalid ID"));
			}
			if(!(this.AddedIds.indexOf(id) > -1)){
				reject(new NotFoundError("Id not found."));
			}
			this.Datasets.splice(this.AddedIds.indexOf(id),1);
			this.AddedIds.splice(this.AddedIds.indexOf(id),1);
			fs.removeSync("./data/" + id + ".json");
			resolve(id);
		});
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve(this.Datasets);
	}


	// This functions pushes to class variable Datasets, which is used by listDataset.
	private PushDataset(id: string, length: number, kind: InsightDatasetKind) {
		this.Datasets.push({
			id: id,
			kind: kind,
			numRows: length
		});
	}

	// This function generates keys for sections object.
	private GetKeysCourses(id: string) {
		return [id + "_dept",id + "_id",id + "_avg",id + "_instructor",id + "_title",id
		+ "_pass",id + "_fail",id + "_audit",id + "_uuid",id + "_year"];
	}

	private GetKeysRooms(id: string) {
		return [id + "_fullname",id + "_shortname",id + "_number",id + "_name",id + "_address",id
		+ "_lat",id + "_lon",id + "_seats",id + "_type",id + "_furniture", id + "_href"];
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return new Promise<InsightResult[]>((resolve, reject) => {
			try {
				let dataset: object;
				if (!(query instanceof Object)) {
					throw (new InsightError("Query is not an object!"));
				}
				const queryObject = JSON.parse(JSON.stringify(query));
				const queryWhere = queryObject["WHERE"];
				const queryOptions = queryObject["OPTIONS"];
				const queryTrans = queryObject["TRANSFORMATIONS"];
				if (Object.keys(query).length > 3 || queryOptions === undefined || queryWhere === undefined ||
					(Object.keys(query).length > 2 && queryTrans === undefined)) {
					reject(new InsightError("Query incorrect keys"));
				}
				const queryColumns = queryOptions["COLUMNS"];
				const queryOrder = queryOptions["ORDER"];
				if (Object.keys(queryOptions).length > 2 || queryColumns === undefined ||
					(queryOrder === undefined && Object.keys(queryOptions).length > 1)) {
					reject(new InsightError("QueryOptions has key error"));
				}
				const datasetID = queryColumns[0].split("_", 2)[0];
				const kind = getKind(queryColumns[0].split("_", 2)[1]);
				let allColumns = [];
				if(kind === "rooms") {
					allColumns = this.GetKeysRooms(datasetID);
				} else {
					allColumns = this.GetKeysCourses(datasetID);
				}
				try {
					dataset = require("../../data/" + datasetID + ".json");
				} catch (err) {
					throw new InsightError("dataset does not exist");
				}
				let filtered = JSON.parse(JSON.stringify(help.handleWhereQuery(queryWhere, datasetID, dataset, kind)));
				if (queryTrans !== undefined) {
					filtered = JSON.parse(JSON.stringify(tHelpers.handleTransform(filtered, queryTrans, allColumns)));
					allColumns = Object.keys(filtered[0]);
				}
				if (filtered.length > 5000) {
					throw new ResultTooLargeError("too many results");
				}
				const final = orderHelpers.handleOrder(filtered, allColumns, queryColumns, queryOrder);
				resolve(JSON.parse(JSON.stringify(final)));
			} catch (err) {
				reject(err);
			}
		});
	}
}
