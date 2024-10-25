"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const http_status_ts_1 = require("http-status-ts");
const joi_1 = __importDefault(require("joi"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("@config/database"));
const vars_1 = require("@config/vars");
const api_error_1 = __importDefault(require("@utils/api-error"));
const errors_1 = __importDefault(require("@utils/errors"));
const schema = joi_1.default.object({
    id: joi_1.default.string().optional(),
    email: joi_1.default.string().required(),
    name: joi_1.default.string().required(),
    phoneNumber: joi_1.default.string().allow(null, ""),
    password: joi_1.default.string().required(),
});
const changePasswordSchema = joi_1.default.object({
    email: joi_1.default.string().required(),
    oldPassword: joi_1.default.string().required(),
    newPassword: joi_1.default.string().required(),
});
const updateShema = joi_1.default.object({
    id: joi_1.default.string().optional(),
    email: joi_1.default.string(),
    name: joi_1.default.string(),
    phoneNumber: joi_1.default.string().allow(null, ""),
    password: joi_1.default.string().optional(),
    role: joi_1.default.string().optional(),
});
const create = async (user) => {
    const { error, value } = schema.validate(user);
    if (error)
        throw new api_error_1.default({
            message: `Bad payload ${error.message}`,
            status: http_status_ts_1.HttpStatus.BAD_REQUEST,
        });
    value.password = crypto_1.default
        .createHash("sha1")
        .update(value.password, "binary")
        .digest("hex");
    const newUser = await database_1.default.user.create({ data: value });
    return newUser;
};
const signUp = async (user) => {
    await new Promise((resolve) => {
        setTimeout(resolve, 500);
    });
    const { error, value } = schema.validate(user);
    if (error)
        throw new api_error_1.default({
            message: `Bad payload ${error.message}`,
            status: http_status_ts_1.HttpStatus.BAD_REQUEST,
        });
    const userExist = await database_1.default.user.findFirst({
        where: { email: value.email.toLowerCase() },
    });
    if (userExist) {
        throw new api_error_1.default({
            message: errors_1.default.users.email_already_exist,
            status: http_status_ts_1.HttpStatus.CONFLICT,
        });
    }
    value.email = value.email.toLowerCase();
    value.password = crypto_1.default
        .createHash("sha1")
        .update(value.password, "binary")
        .digest("hex");
    const newUser = await database_1.default.user.create({ data: value });
    return newUser;
};
const login = async ({ email, password }) => {
    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
    const hashpassword = crypto_1.default
        .createHash("sha1")
        .update(password, "binary")
        .digest("hex");
    const user = await database_1.default.user.findFirst({
        where: { email: email.toLowerCase(), password: hashpassword },
    });
    if (!user) {
        throw new api_error_1.default({
            message: errors_1.default.users.wrong_credentials,
            status: http_status_ts_1.HttpStatus.UNAUTHORIZED,
        });
    }
    const token = jsonwebtoken_1.default.sign({ user }, vars_1.envs.jwtSecret, { expiresIn: "3d" });
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
};
const get = async (id) => {
    const user = await database_1.default.user.findUnique({ where: { id } });
    if (!user)
        throw new api_error_1.default({
            message: "No such user",
            status: http_status_ts_1.HttpStatus.NOT_FOUND,
        });
    return user;
};
const getAll = async () => {
    const users = await database_1.default.user.findMany();
    return users;
};
const update = async (id, payload) => {
    const { error, value } = updateShema.validate(payload);
    if (error)
        throw new api_error_1.default({
            message: `Bad payload ${error.message}`,
            status: http_status_ts_1.HttpStatus.BAD_REQUEST,
        });
    const updatedValue = await database_1.default.user.update({
        where: { id },
        data: value,
    });
    if (!updatedValue)
        throw new api_error_1.default({ message: "Not Found", status: http_status_ts_1.HttpStatus.NOT_FOUND });
    return updatedValue;
};
const remove = async (id) => {
    const user = await get(id);
    if (!user)
        throw new api_error_1.default({
            message: "No such user",
            status: http_status_ts_1.HttpStatus.NOT_FOUND,
        });
    await database_1.default.user.delete({ where: { id } });
};
const resetPassword = async (payload) => {
    const { error } = changePasswordSchema.validate(payload);
    if (error)
        throw new api_error_1.default({
            message: `Bad payload ${error.message}`,
            status: http_status_ts_1.HttpStatus.BAD_REQUEST,
        });
    const user = await database_1.default.user.findFirst({
        where: {
            email: payload.email,
            password: crypto_1.default
                .createHash("sha1")
                .update(payload.oldPassword, "binary")
                .digest("hex"),
        },
    });
    if (!user)
        throw new api_error_1.default({
            message: `No user found with following email ${payload.email}`,
            status: http_status_ts_1.HttpStatus.NOT_FOUND,
        });
    await database_1.default.user.update({
        where: { email: payload.email },
        data: {
            password: crypto_1.default
                .createHash("sha1")
                .update(payload.newPassword, "binary")
                .digest("hex"),
        },
    });
};
exports.userService = {
    create,
    get,
    getAll,
    login,
    update,
    remove,
    resetPassword,
    signUp,
};
//# sourceMappingURL=user.js.map