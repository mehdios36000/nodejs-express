"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("@routes/index"));
const error_1 = require("@middlewares/error");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "*" }));
app.disable("etag");
app.use((0, morgan_1.default)(":date[iso] :remote-addr :remote-user :method :url :status :res[content-length] - :response-time ms"));
app.use(express_1.default.json());
app.use("/api", index_1.default);
app.use(error_1.errorHandler);
exports.default = app;
//# sourceMappingURL=server.js.map