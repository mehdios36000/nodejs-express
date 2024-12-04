import { userService } from "@services/user";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const create = async (req: Request, res: Response) => {
	const newuser = await userService.create(req.body);
	res.status(StatusCodes.OK).json(newuser);
};

const signUp = async (req: Request, res: Response) => {
	const newuser = await userService.signUp(req.body);
	res.status(StatusCodes.OK).json(newuser);
};

const login = async (req: Request, res: Response) => {
	const newuser = await userService.login(req.body);
	res.status(StatusCodes.OK).json(newuser);
};

const getAll = async (req: Request, res: Response) => {
	const users = await userService.getAll();
	res.status(StatusCodes.OK).json(users);
};

const get = async (req: Request, res: Response) => {
	const { id } = req.params;
	const user = await userService.get(id);
	res.status(StatusCodes.OK).json(user);
};

const update = async (req: Request, res: Response) => {
	const { id } = req.params;
	const user = await userService.update(id, req.body);
	res.status(StatusCodes.OK).json(user);
};

const remove = async (req: Request, res: Response) => {
	const { id } = req.params;
	const user = await userService.remove(id);
	res.status(StatusCodes.OK).json(user);
};

const resetPassword = async (req: Request, res: Response) => {
	await userService.resetPassword(req.body);
	res.sendStatus(StatusCodes.OK);
};

const refresh = async (req: Request, res: Response) => {
	const token = req.headers.authorization;
	const userId = req.body.userId;
	if (!token) {
		res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: "Authorization token is required" });
		return;
	}
	const newToken = await userService.refresh(token, userId);
	res.status(StatusCodes.OK).json(newToken);
};

const verifyEmail = async (req: Request, res: Response) => {
	const { email, code } = req.body;
	if (!email || !code) {
		res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: "Email and verification code are required" });
		return;
	}
	try {
		await userService.verifyEmail(email, code);
		res.status(StatusCodes.OK).json({ message: "Email verified successfully" });
	} catch (error) {
		res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: (error as Error).message });
	}
};

const resendVerificationEmail = async (req: Request, res: Response) => {
	const { email } = req.body;
	if (!email) {
		res.status(StatusCodes.BAD_REQUEST).json({ message: "Email is required" });
		return;
	}
	try {
		await userService.resendVerificationEmail(email);
		res
			.status(StatusCodes.OK)
			.json({ message: "Verification code resent successfully" });
	} catch (error) {
		res
			.status(StatusCodes.BAD_REQUEST)
			.json({ message: (error as Error).message });
	}
};

export {
	create,
	get,
	getAll,
	login,
	remove,
	resetPassword,
	signUp,
	update,
	refresh,
	verifyEmail,
	resendVerificationEmail,
};
