"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_ts_1 = require("http-status-ts");
class APIError extends Error {
    constructor({ message, status = http_status_ts_1.HttpStatus.INTERNAL_SERVER_ERROR, }) {
        super(message);
        this.status = status;
        this.additionnalInfo = message;
    }
}
exports.default = APIError;
//# sourceMappingURL=api-error.js.map