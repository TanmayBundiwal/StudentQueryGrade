"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IInsightFacade_1 = require("../../src/controller/IInsightFacade");
const InsightFacade_1 = __importDefault(require("../../src/controller/InsightFacade"));
const chai_1 = require("chai");
const folder_test_1 = require("@ubccpsc310/folder-test");
const TestUtil_1 = require("../TestUtil");
describe("InsightFacade", function () {
    let courses;
    let cpsccourses;
    let allinvalidjsons;
    let someinvalidjsons;
    let emptycoursefolder;
    let wrongfoldername;
    let nofolder;
    let rooms;
    let rooms2;
    before(function () {
        courses = (0, TestUtil_1.getContentFromArchives)("courses.zip");
        cpsccourses = (0, TestUtil_1.getContentFromArchives)("cpsccourses.zip");
        allinvalidjsons = (0, TestUtil_1.getContentFromArchives)("courseswithallinvalidjsons.zip");
        someinvalidjsons = (0, TestUtil_1.getContentFromArchives)("courseswithsomeinvalidjsons.zip");
        emptycoursefolder = (0, TestUtil_1.getContentFromArchives)("courseswithemptycoursefolder.zip");
        wrongfoldername = (0, TestUtil_1.getContentFromArchives)("courseswithfolderwrongname.zip");
        nofolder = (0, TestUtil_1.getContentFromArchives)("courseswithnofolder.zip");
        rooms = (0, TestUtil_1.getContentFromArchives)("rooms.zip");
        rooms2 = (0, TestUtil_1.getContentFromArchives)("rooms.zip");
    });
    describe("List Datasets", function () {
        let facade;
        beforeEach(function () {
            (0, TestUtil_1.clearDisk)();
            facade = new InsightFacade_1.default();
        });
        it("should list no datasets", function () {
            return facade.listDatasets().then((insightDatasets) => {
                (0, chai_1.expect)(insightDatasets).to.be.an.instanceof(Array);
                (0, chai_1.expect)(insightDatasets).to.have.length(0);
            });
        });
        it("should list one datasets", function () {
            return facade.addDataset("courses", courses, IInsightFacade_1.InsightDatasetKind.Courses)
                .then((addedIDs) => facade.listDatasets())
                .then((insightDatasets) => {
                (0, chai_1.expect)(insightDatasets).to.be.an.instanceof(Array);
                (0, chai_1.expect)(insightDatasets).to.have.length(1);
                const [insightDataset] = insightDatasets;
                (0, chai_1.expect)(insightDataset).to.have.property("id");
                (0, chai_1.expect)(insightDataset.id).to.equal("courses");
            });
        });
        it("should list multiple datasets", function () {
            return facade.addDataset("courses", courses, IInsightFacade_1.InsightDatasetKind.Courses)
                .then(() => {
                return facade.addDataset("courses-2", courses, IInsightFacade_1.InsightDatasetKind.Courses);
            })
                .then(() => {
                return facade.listDatasets();
            })
                .then((insightDatasets) => {
                (0, chai_1.expect)(insightDatasets).to.be.an.instanceof(Array);
                (0, chai_1.expect)(insightDatasets).to.have.length(2);
                const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses");
                (0, chai_1.expect)(insightDatasetCourses).to.exist;
                (0, chai_1.expect)(insightDatasetCourses).to.deep.equal({
                    id: "courses",
                    kind: IInsightFacade_1.InsightDatasetKind.Courses,
                    numRows: 64612
                });
            });
        });
    });
    describe("Add/Remove Datasets", function () {
        let facade;
        beforeEach(function () {
            (0, TestUtil_1.clearDisk)();
            facade = new InsightFacade_1.default();
        });
        it("should add a valid dataset successfully", async () => {
            let resp;
            resp = await facade.addDataset("co", courses, IInsightFacade_1.InsightDatasetKind.Courses);
            (0, chai_1.expect)(resp).to.deep.equal(["co"]);
        });
        it("should add a valid Rooms dataset successfully", async () => {
            let resp;
            resp = await facade.addDataset("co", rooms, IInsightFacade_1.InsightDatasetKind.Rooms);
            (0, chai_1.expect)(resp).to.deep.equal(["co"]);
        });
        it("should add 2 different valid Rooms dataset successfully", async () => {
            let resp;
            resp = await facade.addDataset("room", rooms, IInsightFacade_1.InsightDatasetKind.Rooms);
            await facade.addDataset("room2", rooms2, IInsightFacade_1.InsightDatasetKind.Rooms);
            const insightDatasets = await facade.listDatasets();
            (0, chai_1.expect)(insightDatasets).to.be.an.instanceof(Array);
            (0, chai_1.expect)(insightDatasets).to.have.length(2);
            const insightDatasetRooms = insightDatasets.find((dataset) => dataset.id === "room");
            (0, chai_1.expect)(insightDatasetRooms).to.exist;
            (0, chai_1.expect)(insightDatasetRooms).to.deep.equal({
                id: "room",
                kind: IInsightFacade_1.InsightDatasetKind.Rooms,
                numRows: 364
            });
        });
        it("should remove a valid id", async function () {
            await facade.addDataset("courses", cpsccourses, IInsightFacade_1.InsightDatasetKind.Courses);
            await facade.removeDataset("courses");
            const insightDatasets = await facade.listDatasets();
            (0, chai_1.expect)(insightDatasets).to.be.an.instanceof(Array);
            (0, chai_1.expect)(insightDatasets).to.have.length(0);
        });
        it("should add a valid id with a space", async function () {
            await facade.addDataset("courses with space", cpsccourses, IInsightFacade_1.InsightDatasetKind.Courses);
            const insightDatasets = await facade.listDatasets();
            (0, chai_1.expect)(insightDatasets).to.be.an.instanceof(Array);
            (0, chai_1.expect)(insightDatasets).to.have.length(1);
        });
        it("should add a valid dataset with some invalid jsons", async function () {
            await facade.addDataset("courses", someinvalidjsons, IInsightFacade_1.InsightDatasetKind.Courses);
            const insightDatasets = await facade.listDatasets();
            (0, chai_1.expect)(insightDatasets).to.be.an.instanceof(Array);
            (0, chai_1.expect)(insightDatasets).to.have.length(1);
        });
        it("should not add a id with underscore", async function () {
            try {
                await facade.addDataset("courses_", cpsccourses, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("should have rejected due to invalid id : _");
            }
            catch (err) {
                (0, chai_1.expect)(err).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not add a id with white space", async function () {
            try {
                await facade.addDataset(" ", cpsccourses, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("should have rejected due to invalid Id : white space");
            }
            catch (err) {
                (0, chai_1.expect)(err).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not add a id with empty name", async function () {
            try {
                await facade.addDataset("", cpsccourses, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("should have rejected due to invalid Id : no name");
            }
            catch (err) {
                (0, chai_1.expect)(err).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not add a duplicate id", async function () {
            await facade.addDataset("courses", cpsccourses, IInsightFacade_1.InsightDatasetKind.Courses);
            try {
                await facade.addDataset("courses", cpsccourses, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("should have rejected due to invalid Id : duplicate");
            }
            catch (err) {
                (0, chai_1.expect)(err).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not add a dataset with no valid json files", async function () {
            try {
                await facade.addDataset("courses", allinvalidjsons, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("should have rejected due to invalid dataset : no valid json files");
            }
            catch (err) {
                (0, chai_1.expect)(err).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not add a dataset with no folder", async function () {
            try {
                await facade.addDataset("courses", nofolder, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("should have rejected due to invalid dataset : no folder in zip");
            }
            catch (err) {
                (0, chai_1.expect)(err).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not add a dataset with incorrect folder name", async function () {
            try {
                await facade.addDataset("courses", wrongfoldername, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("should have rejected due to invalid dataset : folder is not named courses");
            }
            catch (err) {
                (0, chai_1.expect)(err).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not remove a valid id not yet added", async function () {
            try {
                await facade.removeDataset("courses");
                chai_1.expect.fail("should have rejected due to valid id : not yet added");
            }
            catch (err) {
                (0, chai_1.expect)(err).to.be.instanceof(IInsightFacade_1.NotFoundError);
            }
        });
        it("should not remove an invalid id with only white space", async function () {
            try {
                await facade.removeDataset(" ");
                chai_1.expect.fail("should have rejected due to invalid id : white space");
            }
            catch (err) {
                (0, chai_1.expect)(err).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not remove an invalid id with underscore", async function () {
            try {
                await facade.removeDataset("courses_");
                chai_1.expect.fail("should have rejected due to invalid id : _");
            }
            catch (err) {
                (0, chai_1.expect)(err).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should add, remove, then add same id", async function () {
            await facade.addDataset("courses", cpsccourses, IInsightFacade_1.InsightDatasetKind.Courses);
            await facade.removeDataset("courses");
            await facade.addDataset("courses", cpsccourses, IInsightFacade_1.InsightDatasetKind.Courses);
            const insightDatasets = await facade.listDatasets();
            (0, chai_1.expect)(insightDatasets).to.be.an.instanceof(Array);
            (0, chai_1.expect)(insightDatasets).to.have.length(1);
            const [insightDataset] = insightDatasets;
            (0, chai_1.expect)(insightDataset).to.have.property("id");
            (0, chai_1.expect)(insightDataset.id).to.equal("courses");
        });
        it("should add, remove, then fail to remove same id", async function () {
            await facade.addDataset("courses", cpsccourses, IInsightFacade_1.InsightDatasetKind.Courses);
            await facade.removeDataset("courses");
            try {
                await facade.removeDataset("courses");
                chai_1.expect.fail("should have rejected due to valid id : not yet added");
            }
            catch (err) {
                (0, chai_1.expect)(err).to.be.instanceof(IInsightFacade_1.NotFoundError);
            }
        });
    });
    describe("Query Datasets", function () {
        let facade;
        before(async function () {
            (0, TestUtil_1.clearDisk)();
            facade = new InsightFacade_1.default();
            await facade.addDataset("courses", courses, IInsightFacade_1.InsightDatasetKind.Courses);
            await facade.addDataset("cpsccourses", cpsccourses, IInsightFacade_1.InsightDatasetKind.Courses);
        });
        (0, folder_test_1.folderTest)("Dynamic InsightFacade PerformQuery tests", (input) => facade.performQuery(input), "./test/resources/queries", {
            assertOnResult(actual, expected) {
                (0, chai_1.expect)(actual).to.have.length(expected.length);
                (0, chai_1.expect)(actual).to.have.deep.members(expected);
            },
            errorValidator: (error) => error === "ResultTooLargeError" || error === "InsightError",
            assertOnError(actual, expected) {
                if (expected === "ResultTooLargeError") {
                    (0, chai_1.expect)(actual).to.be.instanceof(IInsightFacade_1.ResultTooLargeError);
                }
                else {
                    (0, chai_1.expect)(actual).to.be.instanceof(IInsightFacade_1.InsightError);
                }
            }
        });
    });
});
//# sourceMappingURL=InsightFacade.spec.js.map