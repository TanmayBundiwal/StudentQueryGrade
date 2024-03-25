"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var IInsightFacade_1 = require("./IInsightFacade");
var roomhelper = require("./RoomHelper");
var jszip_1 = require("jszip");
var fs = require("fs-extra");
var getSection = require("./GetSections");
var parse5_1 = require("parse5");
var help = require("./QueryHelpers");
var orderHelpers = require("./OrderHelpers");
var tHelpers = require("./TransformationHelpers");
var QueryHelpers_1 = require("./QueryHelpers");
/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
var InsightFacade = /** @class */ (function () {
    function InsightFacade() {
        this.Datasets = [];
        this.RoomsData = []; // Temp Variable for passing data between files
        this.RCodes = []; // Building Short Names
        this.RAddress = []; // Building Addresses with spaces
        this.RBuildings = []; // Building Names
        this.Rlinks = []; // Building Links in the folder
        this.GLocation = []; // Building Lat and Lon
        console.log("InsightFacadeImpl::init()");
        this.AddedIds = [];
    }
    InsightFacade.prototype.addDataset = function (id, content, kind) {
        return __awaiter(this, void 0, void 0, function () {
            var Error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!getSection.IsIdValid(id, this.AddedIds)) {
                            return [2 /*return*/, Promise.reject(new IInsightFacade_1.InsightError("invalid ID"))];
                        }
                        if (!(kind === IInsightFacade_1.InsightDatasetKind.Rooms)) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.addRooms(id, content, kind)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, Promise.resolve(this.AddedIds)];
                    case 3:
                        Error_1 = _a.sent();
                        return [2 /*return*/, Promise.reject(new IInsightFacade_1.InsightError("Unable to add Rooms Dataset"))];
                    case 4: return [3 /*break*/, 6];
                    case 5: return [2 /*return*/, new Promise(function (resolve, reject) {
                            var FileNames = [];
                            var zipVar = new jszip_1.default();
                            zipVar.loadAsync(content, { base64: true })
                                .then(function (allFiles) { return __awaiter(_this, void 0, void 0, function () {
                                var allData;
                                return __generator(this, function (_a) {
                                    FileNames = getSection.GetFileNames(allFiles);
                                    if (FileNames.length === 0 || FileNames.length === undefined) {
                                        reject(new IInsightFacade_1.InsightError("No valid sections"));
                                    }
                                    allData = this.getFiles(FileNames, allFiles);
                                    return [2 /*return*/, Promise.all(allData)];
                                });
                            }); })
                                .then(function (rawStringData) {
                                var sections = getSection.GetSections(rawStringData, id);
                                if (sections.length === 0) {
                                    reject(new IInsightFacade_1.InsightError("No sections found"));
                                }
                                return Promise.resolve(sections);
                            })
                                .then(function (Sections) {
                                _this.PushDataset(id, Sections.length, IInsightFacade_1.InsightDatasetKind.Courses);
                                fs.ensureDirSync("./data/");
                                var path = "./data/" + id + ".json";
                                try {
                                    fs.writeJsonSync(path, Sections);
                                }
                                catch (Error) {
                                    reject(new IInsightFacade_1.InsightError("Couldn't write file"));
                                }
                                _this.AddedIds.push(id);
                                resolve(_this.AddedIds);
                            })
                                .catch(function (Error) {
                                throw new IInsightFacade_1.InsightError("Unable to add dataset");
                            });
                        })];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    InsightFacade.prototype.getFiles = function (FileNames, allFiles) {
        var allData = [];
        for (var _i = 0, FileNames_1 = FileNames; _i < FileNames_1.length; _i++) {
            var item = FileNames_1[_i];
            if (allFiles.file(item) !== null) {
                allData.push(allFiles.file(item).async("string"));
            }
        }
        return allData;
    };
    InsightFacade.prototype.addRooms = function (id, content, kind) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var zipVar = new jszip_1.default();
            zipVar.loadAsync(content, { base64: true })
                .then(function (allFiles) { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    allFiles.file("rooms/index.htm").async("string")
                        .then(function (indexFile) {
                        var parsedFile = parse5_1.default.parse(indexFile);
                        _this.getIndexfields(parsedFile);
                        return Promise.resolve(roomhelper.GetGLocation(_this.RAddress));
                    })
                        .catch(function (Error) {
                        throw new IInsightFacade_1.InsightError("Unable to read Index file");
                    })
                        .then(function (Geolocations) {
                        _this.GLocation = Geolocations;
                        var retP = [];
                        for (var _i = 0, _a = _this.Rlinks; _i < _a.length; _i++) {
                            var item = _a[_i];
                            if (allFiles.file(item) !== null) {
                                retP.push(allFiles.file(item).async("string"));
                            }
                        }
                        return Promise.all(retP);
                    })
                        .then(function (RawFileData) {
                        var parsedRoomFiles = [];
                        for (var _i = 0, RawFileData_1 = RawFileData; _i < RawFileData_1.length; _i++) {
                            var File_1 = RawFileData_1[_i];
                            parsedRoomFiles.push(parse5_1.default.parse(File_1));
                        }
                        var rooms = roomhelper.GetRooms(_this.RBuildings, _this.GLocation, _this.RCodes, _this.RAddress, parsedRoomFiles, id);
                        return Promise.resolve(rooms);
                    })
                        .then(function (rooms) {
                        fs.ensureDirSync("./data/");
                        var path = "./data/" + id + ".json";
                        try {
                            fs.writeJsonSync(path, rooms);
                        }
                        catch (Error) {
                            reject(new IInsightFacade_1.InsightError("Couldn't write file"));
                        }
                        _this.clearVariables();
                        _this.AddedIds.push(id);
                        _this.PushDataset(id, rooms.length, IInsightFacade_1.InsightDatasetKind.Rooms);
                        resolve(_this.AddedIds); // If you comment it, the file gets written perfectly, doesn't get written when you resolve it.
                    });
                    return [2 /*return*/];
                });
            }); });
        });
    };
    InsightFacade.prototype.clearVariables = function () {
        this.RCodes = [];
        this.RoomsData = [];
        this.Rlinks = [];
        this.GLocation = [];
        this.RAddress = [];
        this.RBuildings = [];
    };
    InsightFacade.prototype.getIndexfields = function (parsedFile) {
        this.RCodes = roomhelper.TreeExplorer(this.RoomsData, parsedFile, "views-field views-field-field-building-code", false);
        this.RoomsData = [];
        this.RAddress = roomhelper.TreeExplorer(this.RoomsData, parsedFile, "views-field views-field-field-building-address", false);
        this.RoomsData = [];
        this.Rlinks = roomhelper.TreeExplorer(this.RoomsData, parsedFile, "views-field views-field-title", false);
        this.RoomsData = [];
        this.RBuildings = roomhelper.TreeExplorer(this.RoomsData, parsedFile, "views-field views-field-title", true);
    };
    InsightFacade.prototype.removeDataset = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!getSection.IsIdValidDel(id)) {
                reject(new IInsightFacade_1.InsightError("Invalid ID"));
            }
            if (!(_this.AddedIds.indexOf(id) > -1)) {
                reject(new IInsightFacade_1.NotFoundError("Id not found."));
            }
            _this.Datasets.splice(_this.AddedIds.indexOf(id), 1);
            _this.AddedIds.splice(_this.AddedIds.indexOf(id), 1);
            fs.removeSync("./data/" + id + ".json");
            resolve(id);
        });
    };
    InsightFacade.prototype.listDatasets = function () {
        return Promise.resolve(this.Datasets);
    };
    // This functions pushes to class variable Datasets, which is used by listDataset.
    InsightFacade.prototype.PushDataset = function (id, length, kind) {
        this.Datasets.push({
            id: id,
            kind: kind,
            numRows: length
        });
    };
    // This function generates keys for sections object.
    InsightFacade.prototype.GetKeysCourses = function (id) {
        return [id + "_dept", id + "_id", id + "_avg", id + "_instructor", id + "_title", id
                + "_pass", id + "_fail", id + "_audit", id + "_uuid", id + "_year"];
    };
    InsightFacade.prototype.GetKeysRooms = function (id) {
        return [id + "_fullname", id + "_shortname", id + "_number", id + "_name", id + "_address", id
                + "_lat", id + "_lon", id + "_seats", id + "_type", id + "_furniture", id + "_href"];
    };
    InsightFacade.prototype.performQuery = function (query) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var dataset = void 0;
                if (!(query instanceof Object)) {
                    throw (new IInsightFacade_1.InsightError("Query is not an object!"));
                }
                var queryObject = JSON.parse(JSON.stringify(query));
                var queryWhere = queryObject["WHERE"];
                var queryOptions = queryObject["OPTIONS"];
                var queryTrans = queryObject["TRANSFORMATIONS"];
                if (Object.keys(query).length > 3 || queryOptions === undefined || queryWhere === undefined ||
                    (Object.keys(query).length > 2 && queryTrans === undefined)) {
                    reject(new IInsightFacade_1.InsightError("Query incorrect keys"));
                }
                var queryColumns = queryOptions["COLUMNS"];
                var queryOrder = queryOptions["ORDER"];
                if (Object.keys(queryOptions).length > 2 || queryColumns === undefined ||
                    (queryOrder === undefined && Object.keys(queryOptions).length > 1)) {
                    reject(new IInsightFacade_1.InsightError("QueryOptions has key error"));
                }
                var datasetID = queryColumns[0].split("_", 2)[0];
                var kind = (0, QueryHelpers_1.getKind)(queryColumns[0].split("_", 2)[1]);
                var allColumns = [];
                if (kind === "rooms") {
                    allColumns = _this.GetKeysRooms(datasetID);
                }
                else {
                    allColumns = _this.GetKeysCourses(datasetID);
                }
                try {
                    dataset = require("../../data/" + datasetID + ".json");
                }
                catch (err) {
                    throw new IInsightFacade_1.InsightError("dataset does not exist");
                }
                var filtered = JSON.parse(JSON.stringify(help.handleWhereQuery(queryWhere, datasetID, dataset, kind)));
                if (queryTrans !== undefined) {
                    filtered = JSON.parse(JSON.stringify(tHelpers.handleTransform(filtered, queryTrans, allColumns)));
                    allColumns = Object.keys(filtered[0]);
                }
                if (filtered.length > 5000) {
                    throw new IInsightFacade_1.ResultTooLargeError("too many results");
                }
                var final = orderHelpers.handleOrder(filtered, allColumns, queryColumns, queryOrder);
                resolve(JSON.parse(JSON.stringify(final)));
            }
            catch (err) {
                reject(err);
            }
        });
    };
    return InsightFacade;
}());
exports.default = InsightFacade;
