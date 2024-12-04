import APIError from "@utils/api-error";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// eslint-disable-next-line no-unused-vars
export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	let error = err;
	console.log(error);
	if (!(err instanceof APIError)) {
		error = new APIError({
			message: err.message,
			status: StatusCodes.INTERNAL_SERVER_ERROR,
		});
	}
	res.status(500).send({ message: error.message });
};
