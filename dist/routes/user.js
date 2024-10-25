"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("@middlewares/auth"));
const user_1 = require("@controllers/user");
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)([client_1.UserRolesEnum.SHOP_OWNER]), user_1.create);
router.post("/login", user_1.login);
router.post("/sign-up", user_1.signUp);
router.post("/change-password", user_1.resetPassword);
router.get("/:id", (0, auth_1.default)([client_1.UserRolesEnum.SHOP_OWNER]), user_1.get);
router.get("/", (0, auth_1.default)([client_1.UserRolesEnum.SHOP_OWNER]), user_1.getAll);
router.patch("/:id", (0, auth_1.default)([client_1.UserRolesEnum.SHOP_OWNER]), user_1.update);
router.delete("/:id", (0, auth_1.default)([client_1.UserRolesEnum.SHOP_OWNER]), user_1.remove);
exports.default = router;
//# sourceMappingURL=user.js.map