"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const IInsightFacade_1 = require("../../src/controller/IInsightFacade");
const InsightFacade_1 = __importDefault(require("../../src/controller/InsightFacade"));
const chai_1 = require("chai");
const TestUtil_1 = require("../TestUtil");
const folder_test_1 = require("@ubccpsc310/folder-test");
describe("InsightFacade", function () {
    let courses;
    before(function () {
        courses = (0, TestUtil_1.getContentFromArchives)("courses.zip");
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
        it("should list one dataset", function () {
            return facade
                .addDataset("courses", courses, IInsightFacade_1.InsightDatasetKind.Courses)
                .then((addedIds) => facade.listDatasets())
                .then((insightDatasets) => {
                (0, chai_1.expect)(insightDatasets).to.deep.equal([
                    {
                        id: "courses",
                        kind: IInsightFacade_1.InsightDatasetKind.Courses,
                        numRows: 64612,
                    },
                ]);
            });
        });
        it("should list multiple datasets", function () {
            return facade
                .addDataset("courses-1", courses, IInsightFacade_1.InsightDatasetKind.Courses)
                .then(() => {
                return facade.addDataset("courses-2", courses, IInsightFacade_1.InsightDatasetKind.Courses);
            })
                .then(() => {
                return facade.listDatasets();
            })
                .then((insightDatasets) => {
                const expectedDatasets = [
                    {
                        id: "courses-1",
                        kind: IInsightFacade_1.InsightDatasetKind.Courses,
                        numRows: 64612,
                    },
                    {
                        id: "courses-2",
                        kind: IInsightFacade_1.InsightDatasetKind.Courses,
                        numRows: 64612,
                    },
                ];
                (0, chai_1.expect)(insightDatasets).to.be.an.instanceof(Array);
                (0, chai_1.expect)(insightDatasets).to.have.deep.members(expectedDatasets);
                (0, chai_1.expect)(insightDatasets).to.have.length(2);
            });
        });
    });
    describe("Dataset Validity while adding", function () {
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
        it("should not be a zip file", async () => {
            let thistestsfile;
            thistestsfile = (0, TestUtil_1.getContentFromArchives)("nozip.txt");
            try {
                await facade.addDataset("IDNOZIP", thistestsfile, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("Should not have run since file supplied was .txt file");
            }
            catch (ErrorThrownByTheirImplementation) {
                (0, chai_1.expect)(ErrorThrownByTheirImplementation).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not have whitespaces as id", async () => {
            try {
                await facade.addDataset(" ", courses, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("Should not have run since id was just a single whitespace");
            }
            catch (ErrorThrownByTheirImplementation) {
                (0, chai_1.expect)(ErrorThrownByTheirImplementation).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not contain underscore in id", async () => {
            try {
                await facade.addDataset("courses_to_query_over", courses, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("Should not have run since id contained underscores");
            }
            catch (ErrorThrownByTheirImplementation) {
                (0, chai_1.expect)(ErrorThrownByTheirImplementation).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not contain id that is a duplicate", async () => {
            try {
                await facade.addDataset("id1", courses, IInsightFacade_1.InsightDatasetKind.Courses);
                await facade.addDataset("id1", courses, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("Should not have run since id was already run");
            }
            catch (ErrorThrownByTheirImplementation) {
                (0, chai_1.expect)(ErrorThrownByTheirImplementation).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should contain courses as subdirectory", async () => {
            try {
                let thistestsfile;
                thistestsfile = (0, TestUtil_1.getContentFromArchives)("nosubdir.zip");
                await facade.addDataset("nosubdir", thistestsfile, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("Should not have run since there is no courses subdirectory");
            }
            catch (ErrorThrownByTheirImplementation) {
                (0, chai_1.expect)(ErrorThrownByTheirImplementation).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not be empty dataset", async () => {
            try {
                let thistestsfile;
                thistestsfile = (0, TestUtil_1.getContentFromArchives)("empty.zip");
                await facade.addDataset("empty", thistestsfile, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("Should not have run since courses directory is empty");
            }
            catch (ErrorThrownByTheirImplementation) {
                (0, chai_1.expect)(ErrorThrownByTheirImplementation).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not take in dataset with empty json files", async () => {
            try {
                let thistestsfile;
                thistestsfile = (0, TestUtil_1.getContentFromArchives)("nonjson.zip");
                await facade.addDataset("nonjson", thistestsfile, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("Should not have run since courses directory contains no json files");
            }
            catch (ErrorThrownByTheirImplementation) {
                (0, chai_1.expect)(ErrorThrownByTheirImplementation).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not take in dataset with no json file with valid sections", async () => {
            try {
                let thistestsfile;
                thistestsfile = (0, TestUtil_1.getContentFromArchives)("emptyjson.zip");
                await facade.addDataset("emptyjson", thistestsfile, IInsightFacade_1.InsightDatasetKind.Courses);
                chai_1.expect.fail("Should not have run since courses directory json file that does not contain valid sections");
            }
            catch (ErrorThrownByTheirImplementation) {
                (0, chai_1.expect)(ErrorThrownByTheirImplementation).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
    });
    describe("Dataset removing properly", function () {
        let facade;
        beforeEach(function () {
            (0, TestUtil_1.clearDisk)();
            facade = new InsightFacade_1.default();
        });
        it("should not contain underscore in id", async () => {
            try {
                await facade.removeDataset("courses_for_my_lab");
                chai_1.expect.fail("Should not have run since id contained underscores");
            }
            catch (ErrorThrownByTheirImplementation) {
                (0, chai_1.expect)(ErrorThrownByTheirImplementation).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not have id with only whitespaces", async () => {
            try {
                await facade.removeDataset(" ");
                chai_1.expect.fail("Should not have run since id is made up of only whitespaces");
            }
            catch (ErrorThrownByTheirImplementation) {
                (0, chai_1.expect)(ErrorThrownByTheirImplementation).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should successfully remove a dataset", async () => {
            try {
                await facade.addDataset("removetest", courses, IInsightFacade_1.InsightDatasetKind.Courses);
                let resp;
                resp = await facade.removeDataset("removetest");
                (0, chai_1.expect)(resp).to.equal("removetest");
            }
            catch (ErrorThrownByTheirImplementation) {
                (0, chai_1.expect)(ErrorThrownByTheirImplementation).to.be.instanceof(IInsightFacade_1.InsightError);
            }
        });
        it("should not remove one that hasn't yet been added", async () => {
            try {
                await facade.removeDataset("neveradded");
                chai_1.expect.fail("Should have failed since I never added this id");
            }
            catch (ErrorThrownByTheirImplementation) {
                (0, chai_1.expect)(ErrorThrownByTheirImplementation).to.be.instanceof(IInsightFacade_1.NotFoundError);
            }
        });
    });
    describe("Query Engine stuff", function () {
        let facade;
        before(async () => {
            (0, TestUtil_1.clearDisk)();
            facade = new InsightFacade_1.default();
            await facade.addDataset("Dataset1", courses, IInsightFacade_1.InsightDatasetKind.Courses);
            await facade.addDataset("Dataset2", courses, IInsightFacade_1.InsightDatasetKind.Courses);
        });
        (0, folder_test_1.folderTest)("Testing all made up json file dynamically", (input) => {
            return facade.performQuery(input);
        }, "./test/resources/queries", {
            assertOnResult(actual, expected) {
                (0, chai_1.expect)(actual).to.be.instanceof(Array);
                (0, chai_1.expect)(actual).to.have.length(expected.length);
                (0, chai_1.expect)(actual).to.have.deep.members(expected);
            },
            assertOnError(actual, expected) {
                if (expected === "InsightError") {
                    (0, chai_1.expect)(actual).to.be.an.instanceof(IInsightFacade_1.InsightError);
                }
                else if (actual === "ResultTooLargeError") {
                    (0, chai_1.expect)(actual).to.be.an.instanceof(IInsightFacade_1.ResultTooLargeError);
                }
                else {
                    chai_1.expect.fail("Unexpected error");
                }
            },
        });
    });
});
//# sourceMappingURL=InsightFacadecopy.spec.js.map