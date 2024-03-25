"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IInsightFacade_1 = require("./IInsightFacade");
const roomhelper = __importStar(require("./RoomHelper"));
const jszip_1 = __importDefault(require("jszip"));
const fs = __importStar(require("fs-extra"));
const getSection = __importStar(require("./GetSections"));
const parse5_1 = __importDefault(require("parse5"));
const help = __importStar(require("./QueryHelpers"));
const orderHelpers = __importStar(require("./OrderHelpers"));
const tHelpers = __importStar(require("./TransformationHelpers"));
const QueryHelpers_1 = require("./QueryHelpers");
class InsightFacade {
    constructor() {
        this.Datasets = [];
        this.RoomsData = [];
        this.RCodes = [];
        this.RAddress = [];
        this.RBuildings = [];
        this.Rlinks = [];
        this.GLocation = [];
        console.log("InsightFacadeImpl::init()");
        this.AddedIds = [];
    }
    async addDataset(id, content, kind) {
        if (!getSection.IsIdValid(id, this.AddedIds)) {
            return Promise.reject(new IInsightFacade_1.InsightError("invalid ID"));
        }
        if (kind === IInsightFacade_1.InsightDatasetKind.Rooms) {
            try {
                await this.addRooms(id, content, kind);
                return Promise.resolve(this.AddedIds);
            }
            catch (Error) {
                return Promise.reject(new IInsightFacade_1.InsightError("Unable to add Rooms Dataset"));
            }
        }
        else {
            return new Promise((resolve, reject) => {
                let FileNames = [];
                let zipVar = new jszip_1.default();
                zipVar.loadAsync(content, { base64: true })
                    .then(async (allFiles) => {
                    FileNames = getSection.GetFileNames(allFiles);
                    if (FileNames.length === 0 || FileNames.length === undefined) {
                        reject(new IInsightFacade_1.InsightError("No valid sections"));
                    }
                    let allData = this.getFiles(FileNames, allFiles);
                    return Promise.all(allData);
                })
                    .then((rawStringData) => {
                    let sections = getSection.GetSections(rawStringData, id);
                    if (sections.length === 0) {
                        reject(new IInsightFacade_1.InsightError("No sections found"));
                    }
                    return Promise.resolve(sections);
                })
                    .then((Sections) => {
                    this.PushDataset(id, Sections.length, IInsightFacade_1.InsightDatasetKind.Courses);
                    fs.ensureDirSync("./data/");
                    let path = "./data/" + id + ".json";
                    try {
                        fs.writeJsonSync(path, Sections);
                    }
                    catch (Error) {
                        reject(new IInsightFacade_1.InsightError("Couldn't write file"));
                    }
                    this.AddedIds.push(id);
                    resolve(this.AddedIds);
                })
                    .catch((Error) => {
                    throw new IInsightFacade_1.InsightError("Unable to add dataset");
                });
            });
        }
    }
    getFiles(FileNames, allFiles) {
        let allData = [];
        for (const item of FileNames) {
            if (allFiles.file(item) !== null) {
                allData.push(allFiles.file(item).async("string"));
            }
        }
        return allData;
    }
    addRooms(id, content, kind) {
        return new Promise((resolve, reject) => {
            let zipVar = new jszip_1.default();
            zipVar.loadAsync(content, { base64: true })
                .then(async (allFiles) => {
                allFiles.file("rooms/index.htm").async("string")
                    .then((indexFile) => {
                    let parsedFile = parse5_1.default.parse(indexFile);
                    this.getIndexfields(parsedFile);
                    return Promise.resolve(roomhelper.GetGLocation(this.RAddress));
                })
                    .catch((Error) => {
                    throw new IInsightFacade_1.InsightError("Unable to read Index file");
                })
                    .then((Geolocations) => {
                    this.GLocation = Geolocations;
                    let retP = [];
                    for (const item of this.Rlinks) {
                        if (allFiles.file(item) !== null) {
                            retP.push(allFiles.file(item).async("string"));
                        }
                    }
                    return Promise.all(retP);
                })
                    .then((RawFileData) => {
                    let parsedRoomFiles = [];
                    for (let File of RawFileData) {
                        parsedRoomFiles.push(parse5_1.default.parse(File));
                    }
                    let rooms = roomhelper.GetRooms(this.RBuildings, this.GLocation, this.RCodes, this.RAddress, parsedRoomFiles, id);
                    return Promise.resolve(rooms);
                })
                    .then((rooms) => {
                    fs.ensureDirSync("./data/");
                    let path = "./data/" + id + ".json";
                    try {
                        fs.writeJsonSync(path, rooms);
                    }
                    catch (Error) {
                        reject(new IInsightFacade_1.InsightError("Couldn't write file"));
                    }
                    this.clearVariables();
                    this.AddedIds.push(id);
                    this.PushDataset(id, rooms.length, IInsightFacade_1.InsightDatasetKind.Rooms);
                    resolve(this.AddedIds);
                });
            });
        });
    }
    clearVariables() {
        this.RCodes = [];
        this.RoomsData = [];
        this.Rlinks = [];
        this.GLocation = [];
        this.RAddress = [];
        this.RBuildings = [];
    }
    getIndexfields(parsedFile) {
        this.RCodes = roomhelper.TreeExplorer(this.RoomsData, parsedFile, "views-field views-field-field-building-code", false);
        this.RoomsData = [];
        this.RAddress = roomhelper.TreeExplorer(this.RoomsData, parsedFile, "views-field views-field-field-building-address", false);
        this.RoomsData = [];
        this.Rlinks = roomhelper.TreeExplorer(this.RoomsData, parsedFile, "views-field views-field-title", false);
        this.RoomsData = [];
        this.RBuildings = roomhelper.TreeExplorer(this.RoomsData, parsedFile, "views-field views-field-title", true);
    }
    removeDataset(id) {
        return new Promise((resolve, reject) => {
            if (!getSection.IsIdValidDel(id)) {
                reject(new IInsightFacade_1.InsightError("Invalid ID"));
            }
            if (!(this.AddedIds.indexOf(id) > -1)) {
                reject(new IInsightFacade_1.NotFoundError("Id not found."));
            }
            this.Datasets.splice(this.AddedIds.indexOf(id), 1);
            this.AddedIds.splice(this.AddedIds.indexOf(id), 1);
            fs.removeSync("./data/" + id + ".json");
            resolve(id);
        });
    }
    listDatasets() {
        return Promise.resolve(this.Datasets);
    }
    PushDataset(id, length, kind) {
        this.Datasets.push({
            id: id,
            kind: kind,
            numRows: length
        });
    }
    GetKeysCourses(id) {
        return [id + "_dept", id + "_id", id + "_avg", id + "_instructor", id + "_title", id
                + "_pass", id + "_fail", id + "_audit", id + "_uuid", id + "_year"];
    }
    GetKeysRooms(id) {
        return [id + "_fullname", id + "_shortname", id + "_number", id + "_name", id + "_address", id
                + "_lat", id + "_lon", id + "_seats", id + "_type", id + "_furniture", id + "_href"];
    }
    performQuery(query) {
        return new Promise((resolve, reject) => {
            try {
                let dataset;
                if (!(query instanceof Object)) {
                    throw (new IInsightFacade_1.InsightError("Query is not an object!"));
                }
                const queryObject = JSON.parse(JSON.stringify(query));
                const queryWhere = queryObject["WHERE"];
                const queryOptions = queryObject["OPTIONS"];
                const queryTrans = queryObject["TRANSFORMATIONS"];
                if (Object.keys(query).length > 3 || queryOptions === undefined || queryWhere === undefined ||
                    (Object.keys(query).length > 2 && queryTrans === undefined)) {
                    reject(new IInsightFacade_1.InsightError("Query incorrect keys"));
                }
                const queryColumns = queryOptions["COLUMNS"];
                const queryOrder = queryOptions["ORDER"];
                if (Object.keys(queryOptions).length > 2 || queryColumns === undefined ||
                    (queryOrder === undefined && Object.keys(queryOptions).length > 1)) {
                    reject(new IInsightFacade_1.InsightError("QueryOptions has key error"));
                }
                const datasetID = queryColumns[0].split("_", 2)[0];
                const kind = (0, QueryHelpers_1.getKind)(queryColumns[0].split("_", 2)[1]);
                let allColumns = [];
                if (kind === "rooms") {
                    allColumns = this.GetKeysRooms(datasetID);
                }
                else {
                    allColumns = this.GetKeysCourses(datasetID);
                }
                try {
                    dataset = require("../../data/" + datasetID + ".json");
                }
                catch (err) {
                    throw new IInsightFacade_1.InsightError("dataset does not exist");
                }
                let filtered = JSON.parse(JSON.stringify(help.handleWhereQuery(queryWhere, datasetID, dataset, kind)));
                if (queryTrans !== undefined) {
                    filtered = JSON.parse(JSON.stringify(tHelpers.handleTransform(filtered, queryTrans, allColumns)));
                    allColumns = Object.keys(filtered[0]);
                }
                if (filtered.length > 5000) {
                    throw new IInsightFacade_1.ResultTooLargeError("too many results");
                }
                const final = orderHelpers.handleOrder(filtered, allColumns, queryColumns, queryOrder);
                resolve(JSON.parse(JSON.stringify(final)));
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map