import { envs } from "@config/vars";
/* eslint-disable import/no-extraneous-dependencies */
import type { UserRolesEnum } from "@prisma/client";
import type { UserLoginPayload } from "@services/user";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export type JWTPayload = {
	user: UserLoginPayload;
};

const JWTCheck = (roles: UserRolesEnum[]) => {
	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		try {
			const authHeader = req.headers.authorization;
			if (!authHeader) {
				res
					.status(StatusCodes.UNAUTHORIZED)
					.json({ message: "Authorization header missing" });
				return;
			}

			const token = authHeader.split(" ")[1];
			if (!token) {
				res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token missing" });
				return;
			}

			const decoded = jwt.verify(token, envs.jwtSecret) as JWTPayload;
			if (!decoded || !decoded.user) {
				res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
				return;
			}

			const { user } = decoded;
			if (!roles.includes(user.role)) {
				res
					.status(StatusCodes.FORBIDDEN)
					.json({ message: "Insufficient permissions" });
				return;
			}

			req.body.user = user;
			next();
		} catch (error) {
			const errorMessage = (error as Error).message;
			res
				.status(StatusCodes.UNAUTHORIZED)
				.json({ message: "Authentication failed", error: errorMessage });
		}
	};
};

export default JWTCheck;
