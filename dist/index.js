"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const server_1 = __importDefault(require("@config/server"));
const httpServer = http_1.default.createServer(server_1.default);
httpServer.listen(process.env.PORT || 3000, async () => {
    console.log(`The server is running on port ${process.env.PORT}`);
});
//# sourceMappingURL=index.js.map