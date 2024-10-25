"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const http_status_ts_1 = require("http-status-ts");
const auth_1 = __importDefault(require("@middlewares/auth"));
const user_1 = __importDefault(require("@routes/user"));
const router = express_1.default.Router();
router.get("/is-logged", (0, auth_1.default)([
    client_1.UserRolesEnum.SHOP_OWNER,
    client_1.UserRolesEnum.CUSTOMER
]), (req, res) => { res.sendStatus(http_status_ts_1.HttpStatus.OK); return; });
router.use("/users", user_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map