import { UserRolesEnum } from "@prisma/client";
import express, { Router } from "express";
import {HttpStatus }from "http-status-ts";
import JWTCheck from '@middlewares/auth';
import {Request, Response } from 'express';

import user from "@routes/user";
// __IMPORT__

const router: Router = express.Router();


router.get(
  "/is-logged",
  JWTCheck([
    UserRolesEnum.SHOP_OWNER,
    UserRolesEnum.CUSTOMER
  ]),
  (req: Request, res: Response): void => { res.sendStatus(HttpStatus.OK); return; }
);
router.use("/users", user);
// __ROUTE__

export default router;
