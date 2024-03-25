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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const InsightFacade_1 = __importDefault(require("../controller/InsightFacade"));
const IInsightFacade_1 = require("../controller/IInsightFacade");
const fs = __importStar(require("fs"));
class Server {
    constructor(port) {
        console.info(`Server::<init>( ${port} )`);
        this.port = port;
        this.express = (0, express_1.default)();
        this.registerMiddleware();
        this.registerRoutes();
        this.express.use(express_1.default.static("./frontend/public"));
    }
    start() {
        return new Promise((resolve, reject) => {
            console.info("Server::start() - start");
            if (this.server !== undefined) {
                console.error("Server::start() - server already listening");
                reject();
            }
            else {
                this.server = this.express.listen(this.port, () => {
                    console.info(`Server::start() - server listening on port: ${this.port}`);
                    resolve();
                }).on("error", (err) => {
                    console.error(`Server::start() - server ERROR: ${err.message}`);
                    reject(err);
                });
            }
        });
    }
    stop() {
        console.info("Server::stop()");
        return new Promise((resolve, reject) => {
            if (this.server === undefined) {
                console.error("Server::stop() - ERROR: server not started");
                reject();
            }
            else {
                this.server.close(() => {
                    console.info("Server::stop() - server closed");
                    resolve();
                });
            }
        });
    }
    registerMiddleware() {
        this.express.use(express_1.default.json());
        this.express.use(express_1.default.raw({ type: "application/*", limit: "10mb" }));
        this.express.use((0, cors_1.default)());
    }
    registerRoutes() {
        this.express.get("/echo/:msg", Server.echo);
        this.express.put("/dataset/:id/:kind", Server.add);
        this.express.delete("/dataset/:id", Server.delete);
        this.express.post("/query", Server.query);
        this.express.get("/datasets", Server.list);
    }
    static echo(req, res) {
        try {
            console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
            const response = Server.performEcho(req.params.msg);
            res.status(200).json({ result: response });
        }
        catch (err) {
            res.status(400).json({ error: err });
        }
    }
    static performEcho(msg) {
        if (typeof msg !== "undefined" && msg !== null) {
            return `${msg}...${msg}`;
        }
        else {
            return "Message not provided";
        }
    }
    static add(request, response) {
        try {
            let ZContent = Buffer.from(request.body).toString("base64");
            let kind = request.params.kind;
            if (kind !== IInsightFacade_1.InsightDatasetKind.Rooms && kind !== IInsightFacade_1.InsightDatasetKind.Courses) {
                throw new IInsightFacade_1.InsightError("Invalid Kind");
            }
            Server.facade.addDataset(request.params.id, ZContent, kind)
                .then((arr) => {
                response.status(200).json({ result: arr });
            })
                .catch((err) => {
                response.status(400).json({ error: err.message });
            });
        }
        catch (err) {
            response.status(400).json({ error: err.message });
        }
    }
    static delete(request, response) {
        try {
            let id = request.params.id;
            Server.facade.removeDataset(id)
                .then((str) => {
                response.status(200).json({ result: str });
            }).catch((err) => {
                if (err instanceof IInsightFacade_1.NotFoundError) {
                    response.status(404).json({ error: err.message });
                }
                else {
                    response.status(400).json({ error: err.message });
                }
            });
        }
        catch (err) {
            if (err instanceof IInsightFacade_1.NotFoundError) {
                response.status(404).json({ error: err.message });
            }
            else {
                response.status(400).json({ error: err.message });
            }
        }
    }
    static query(request, response) {
        if (!fs.existsSync("./data")) {
            response.status(400).json({ error: "Missing Data Directory" });
        }
        try {
            Server.facade.performQuery(request.body)
                .then((arr) => {
                response.status(200).json({ result: arr });
            }).catch((err) => {
                response.status(400).json({ error: err.message });
            });
        }
        catch (err) {
            response.status(400).json({ error: err.message });
        }
    }
    static list(request, response) {
        try {
            Server.facade.listDatasets()
                .then((arr) => {
                response.status(200).json({ result: arr });
            }).catch((err) => {
                response.status(400).json({ error: err.message });
            });
        }
        catch (err) {
            response.status(400).json({ error: err.message });
        }
    }
}
exports.default = Server;
Server.facade = new InsightFacade_1.default();
//# sourceMappingURL=Server.js.map