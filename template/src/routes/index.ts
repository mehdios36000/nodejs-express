import JWTCheck from "@middlewares/auth";
import { UserRolesEnum } from "@prisma/client";
import express, { type Router } from "express";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import user from "@routes/user";
// __IMPORT__

const router: Router = express.Router();

router.get(
	"/is-logged",
	JWTCheck([UserRolesEnum.ADMIN]),
	(req: Request, res: Response): void => {
		res.sendStatus(StatusCodes.OK);
		return;
	},
);
router.use("/users", user);
// __ROUTE__

export default router;
