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
const IInsightFacade_1 = require("../../src/controller/IInsightFacade");
const InsightFacade_1 = __importDefault(require("../../src/controller/InsightFacade"));
const fs = __importStar(require("fs-extra"));
const folder_test_1 = require("@ubccpsc310/folder-test");
const chai_1 = require("chai");
describe("InsightFacade", function () {
    let insightFacade;
    const persistDir = "./data";
    const datasetContents = new Map();
    const datasetsToLoad = {
        courses: "./test/resources/archives/courses.zip",
    };
    before(function () {
        for (const key of Object.keys(datasetsToLoad)) {
            const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
            datasetContents.set(key, content);
        }
        fs.removeSync(persistDir);
    });
    describe("Add/Remove/List Dataset", function () {
        before(function () {
            console.info(`Before: ${this.test?.parent?.title}`);
        });
        beforeEach(function () {
            console.info(`BeforeTest: ${this.currentTest?.title}`);
            insightFacade = new InsightFacade_1.default();
        });
        after(function () {
            console.info(`After: ${this.test?.parent?.title}`);
        });
        afterEach(function () {
            console.info(`AfterTest: ${this.currentTest?.title}`);
            fs.removeSync(persistDir);
        });
        it("Should add a valid dataset", function () {
            const id = "courses";
            const content = datasetContents.get("courses") ?? "";
            const expected = [id];
            return insightFacade.addDataset(id, content, IInsightFacade_1.InsightDatasetKind.Courses).then((result) => {
                (0, chai_1.expect)(result).to.deep.equal(expected);
            });
        });
    });
    describe("PerformQuery", () => {
        before(function () {
            console.info(`Before: ${this.test?.parent?.title}`);
            insightFacade = new InsightFacade_1.default();
            const loadDatasetPromises = [
                insightFacade.addDataset("courses", datasetContents.get("courses") ?? "", IInsightFacade_1.InsightDatasetKind.Courses),
            ];
            return Promise.all(loadDatasetPromises);
        });
        after(function () {
            console.info(`After: ${this.test?.parent?.title}`);
            fs.removeSync(persistDir);
        });
        (0, folder_test_1.folderTest)("Dynamic InsightFacade PerformQuery tests", (input) => insightFacade.performQuery(input), "./test/resources/queries", {
            errorValidator: (error) => error === "ResultTooLargeError" || error === "InsightError",
            assertOnError(actual, expected) {
                if (expected === "ResultTooLargeError") {
                    (0, chai_1.expect)(actual).to.be.instanceof(IInsightFacade_1.ResultTooLargeError);
                }
                else {
                    (0, chai_1.expect)(actual).to.be.instanceof(IInsightFacade_1.InsightError);
                }
            },
        });
    });
});
//# sourceMappingURL=InsightFacadeOriginal.spec.js.map