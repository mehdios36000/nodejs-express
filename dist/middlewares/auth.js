"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_ts_1 = require("http-status-ts");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const vars_1 = require("@config/vars");
const JWTCheck = (roles) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                res.status(http_status_ts_1.HttpStatus.UNAUTHORIZED).json({ message: "Authorization header missing" });
                return;
            }
            const token = authHeader.split(" ")[1];
            if (!token) {
                res.status(http_status_ts_1.HttpStatus.UNAUTHORIZED).json({ message: "Token missing" });
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token, vars_1.envs.jwtSecret);
            if (!decoded || !decoded.user) {
                res.status(http_status_ts_1.HttpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
                return;
            }
            const { user } = decoded;
            if (!roles.includes(user.role)) {
                res.status(http_status_ts_1.HttpStatus.FORBIDDEN).json({ message: "Insufficient permissions" });
                return;
            }
            req.body.user = user;
            next();
        }
        catch (error) {
            const errorMessage = error.message;
            res.status(http_status_ts_1.HttpStatus.UNAUTHORIZED).json({ message: "Authentication failed", error: errorMessage });
        }
    };
};
exports.default = JWTCheck;
//# sourceMappingURL=auth.js.map