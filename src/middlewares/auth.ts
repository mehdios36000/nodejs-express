/* eslint-disable import/no-extraneous-dependencies */
import { UserRolesEnum } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "http-status-ts";
import jwt from "jsonwebtoken";
import { UserLoginPayload } from "@services/user";
import { envs } from "@config/vars";




export type JWTPayload = {
  user: UserLoginPayload;
};

const JWTCheck = (roles: UserRolesEnum[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: "Authorization header missing" });
        return;
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: "Token missing" });
        return;
      }

      const decoded = jwt.verify(token, envs.jwtSecret) as JWTPayload;
      if (!decoded || !decoded.user) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        return;
      }

      const { user } = decoded;
      if (!roles.includes(user.role)) {
        res.status(HttpStatus.FORBIDDEN).json({ message: "Insufficient permissions" });
        return;
      }

      

      req.body.user = user;
      next();
    } catch (error) {
      const errorMessage = (error as Error).message;
      res.status(HttpStatus.UNAUTHORIZED).json({ message: "Authentication failed", error: errorMessage });
    }
  };
};

export default JWTCheck;
