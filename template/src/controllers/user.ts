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


const refresh = async (req:Request, res:Response) => {
  const token = req.headers.authorization;
  const userId = req.body.userId;
  if (!token) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Authorization token is required' });
    return;
  }
  const newToken = await userService.refresh(token, userId);
  res.status(HttpStatus.OK).json(newToken);
}

const verifyEmail = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: "Email and verification code are required" });
    return;
  }
  try {
    await userService.verifyEmail(email, code);
    res.status(HttpStatus.OK).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: (error as Error).message });
  }
};


const resendVerificationEmail = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: "Email is required" });
    return;
  }
  try {
    await userService.resendVerificationEmail(email);
    res.status(HttpStatus.OK).json({ message: "Verification code resent successfully" });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: (error as Error).message });
  }
};

export { create, get, getAll, login, remove, resetPassword, signUp, update ,refresh,verifyEmail,resendVerificationEmail};
