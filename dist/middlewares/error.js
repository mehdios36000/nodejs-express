"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const http_status_ts_1 = require("http-status-ts");
const api_error_1 = __importDefault(require("@utils/api-error"));
const errorHandler = (err, req, res, next) => {
    let error = err;
    console.log(error);
    if (!(err instanceof api_error_1.default)) {
        error = new api_error_1.default({
            message: err.message,
            status: http_status_ts_1.HttpStatus.INTERNAL_SERVER_ERROR,
        });
    }
    res.status(500).send({ message: error.message });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.js.map