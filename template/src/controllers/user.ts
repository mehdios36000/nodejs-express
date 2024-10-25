import { HttpStatus } from "http-status-ts";
import { userService } from "@services/user";
import { Request,Response } from "express";

const create = async (req:Request, res:Response) => {
  const newuser = await userService.create(req.body);
  res.status(HttpStatus.OK).json(newuser);
};

const signUp = async (req:Request, res:Response) => {
  const newuser = await userService.signUp(req.body);
  res.status(HttpStatus.OK).json(newuser);
};

const login = async (req:Request, res:Response) => {
  const newuser = await userService.login(req.body);
  res.status(HttpStatus.OK).json(newuser);
};

const getAll = async (req:Request, res:Response) => {
  const users = await userService.getAll();
  res.status(HttpStatus.OK).json(users);
};

const get = async (req:Request, res:Response) => {
  const { id } = req.params;
  const user = await userService.get(id);
  res.status(HttpStatus.OK).json(user);
};

const update = async (req:Request, res:Response) => {
  const { id } = req.params;
  const user = await userService.update(id, req.body);
  res.status(HttpStatus.OK).json(user);
};

const remove = async (req:Request, res:Response) => {
  const { id } = req.params;
  const user = await userService.remove(id);
  res.status(HttpStatus.OK).json(user);
};

const resetPassword = async (req:Request, res:Response) => {
  await userService.resetPassword(req.body);
  res.sendStatus(HttpStatus.OK);
};

export { create, get, getAll, login, remove, resetPassword, signUp, update };
