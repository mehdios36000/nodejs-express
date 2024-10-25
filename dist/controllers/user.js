"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.signUp = exports.resetPassword = exports.remove = exports.login = exports.getAll = exports.get = exports.create = void 0;
const http_status_ts_1 = require("http-status-ts");
const user_1 = require("@services/user");
const create = async (req, res) => {
    const newuser = await user_1.userService.create(req.body);
    res.status(http_status_ts_1.HttpStatus.OK).json(newuser);
};
exports.create = create;
const signUp = async (req, res) => {
    const newuser = await user_1.userService.signUp(req.body);
    res.status(http_status_ts_1.HttpStatus.OK).json(newuser);
};
exports.signUp = signUp;
const login = async (req, res) => {
    const newuser = await user_1.userService.login(req.body);
    res.status(http_status_ts_1.HttpStatus.OK).json(newuser);
};
exports.login = login;
const getAll = async (req, res) => {
    const users = await user_1.userService.getAll();
    res.status(http_status_ts_1.HttpStatus.OK).json(users);
};
exports.getAll = getAll;
const get = async (req, res) => {
    const { id } = req.params;
    const user = await user_1.userService.get(id);
    res.status(http_status_ts_1.HttpStatus.OK).json(user);
};
exports.get = get;
const update = async (req, res) => {
    const { id } = req.params;
    const user = await user_1.userService.update(id, req.body);
    res.status(http_status_ts_1.HttpStatus.OK).json(user);
};
exports.update = update;
const remove = async (req, res) => {
    const { id } = req.params;
    const user = await user_1.userService.remove(id);
    res.status(http_status_ts_1.HttpStatus.OK).json(user);
};
exports.remove = remove;
const resetPassword = async (req, res) => {
    await user_1.userService.resetPassword(req.body);
    res.sendStatus(http_status_ts_1.HttpStatus.OK);
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=user.js.map