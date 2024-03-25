"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var InsightFacade_1 = require("../controller/InsightFacade");
var IInsightFacade_1 = require("../controller/IInsightFacade");
var fs = require("fs");
var Server = /** @class */ (function () {
    function Server(port) {
        console.info("Server::<init>( ".concat(port, " )"));
        this.port = port;
        this.express = (0, express_1.default)();
        this.registerMiddleware();
        this.registerRoutes();
        // NOTE: you can serve static frontend files in from your express server
        // by uncommenting the line below. This makes files in ./frontend/public
        // accessible at http://localhost:<port>/
        this.express.use(express_1.default.static("./frontend/public"));
    }
    /**
     * Starts the server. Returns a promise that resolves if success. Promises are used
     * here because starting the server takes some time and we want to know when it
     * is done (and if it worked).
     *
     * @returns {Promise<void>}
     */
    Server.prototype.start = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            console.info("Server::start() - start");
            if (_this.server !== undefined) {
                console.error("Server::start() - server already listening");
                reject();
            }
            else {
                _this.server = _this.express.listen(_this.port, function () {
                    console.info("Server::start() - server listening on port: ".concat(_this.port));
                    resolve();
                }).on("error", function (err) {
                    // catches errors in server start
                    console.error("Server::start() - server ERROR: ".concat(err.message));
                    reject(err);
                });
            }
        });
    };
    /**
     * Stops the server. Again returns a promise so we know when the connections have
     * actually been fully closed and the port has been released.
     *
     * @returns {Promise<void>}
     */
    Server.prototype.stop = function () {
        var _this = this;
        console.info("Server::stop()");
        return new Promise(function (resolve, reject) {
            if (_this.server === undefined) {
                console.error("Server::stop() - ERROR: server not started");
                reject();
            }
            else {
                _this.server.close(function () {
                    console.info("Server::stop() - server closed");
                    resolve();
                });
            }
        });
    };
    // Registers middleware to parse request before passing them to request handlers
    Server.prototype.registerMiddleware = function () {
        // JSON parser must be place before raw parser because of wildcard matching done by raw parser below
        this.express.use(express_1.default.json());
        this.express.use(express_1.default.raw({ type: "application/*", limit: "10mb" }));
        // enable cors in request headers to allow cross-origin HTTP requests
        this.express.use((0, cors_1.default)());
    };
    // Registers all request handlers to routes
    Server.prototype.registerRoutes = function () {
        // This is an example endpoint this you can invoke by accessing this URL in your browser:
        // http://localhost:4321/echo/hello
        this.express.get("/echo/:msg", Server.echo);
        // TODO: your other endpoints should go here
        this.express.put("/dataset/:id/:kind", Server.add);
        this.express.delete("/dataset/:id", Server.delete);
        this.express.post("/query", Server.query);
        this.express.get("/datasets", Server.list);
    };
    // The next two methods handle the echo service.
    // These are almost certainly not the best place to put these, but are here for your reference.
    // By updating the Server.echo function pointer above, these methods can be easily moved.
    Server.echo = function (req, res) {
        try {
            console.log("Server::echo(..) - params: ".concat(JSON.stringify(req.params)));
            var response = Server.performEcho(req.params.msg);
            res.status(200).json({ result: response });
        }
        catch (err) {
            res.status(400).json({ error: err });
        }
    };
    Server.performEcho = function (msg) {
        if (typeof msg !== "undefined" && msg !== null) {
            return "".concat(msg, "...").concat(msg);
        }
        else {
            return "Message not provided";
        }
    };
    Server.add = function (request, response) {
        try {
            var ZContent = Buffer.from(request.body).toString("base64");
            var kind = request.params.kind;
            if (kind !== IInsightFacade_1.InsightDatasetKind.Rooms && kind !== IInsightFacade_1.InsightDatasetKind.Courses) {
                throw new IInsightFacade_1.InsightError("Invalid Kind");
            }
            // if(kind === InsightDatasetKind.Rooms) {
            // 	throw new InsightError("Kind Error Test");
            // }
            Server.facade.addDataset(request.params.id, ZContent, kind)
                .then(function (arr) {
                response.status(200).json({ result: arr });
            })
                .catch(function (err) {
                response.status(400).json({ error: err.message });
            });
        }
        catch (err) {
            response.status(400).json({ error: err.message });
        }
    };
    Server.delete = function (request, response) {
        try {
            var id = request.params.id;
            Server.facade.removeDataset(id)
                .then(function (str) {
                response.status(200).json({ result: str });
            }).catch(function (err) {
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
    };
    Server.query = function (request, response) {
        // Checking if directory exists
        if (!fs.existsSync("./data")) {
            response.status(400).json({ error: "Missing Data Directory" });
        }
        try {
            Server.facade.performQuery(request.body)
                .then(function (arr) {
                response.status(200).json({ result: arr });
            }).catch(function (err) {
                response.status(400).json({ error: err.message });
            });
        }
        catch (err) {
            response.status(400).json({ error: err.message });
        }
    };
    Server.list = function (request, response) {
        try {
            // let D = await Server.facade.listDatasets();
            // response.status(200).json({result: D});
            Server.facade.listDatasets()
                .then(function (arr) {
                response.status(200).json({ result: arr });
            }).catch(function (err) {
                response.status(400).json({ error: err.message });
            });
        }
        catch (err) {
            response.status(400).json({ error: err.message });
        }
    };
    Server.facade = new InsightFacade_1.default();
    return Server;
}());
exports.default = Server;
