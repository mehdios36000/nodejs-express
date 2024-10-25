import { HttpStatus } from "http-status-ts";
import APIError from "@utils/api-error";
import { NextFunction, Request,Response } from "express";

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err:Error, req:Request, res:Response, next:NextFunction) => {
  let error = err;
  console.log(error);
  if (!(err instanceof APIError)) {
    error = new APIError({
      message: err.message,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
  res.status(500).send({ message: error.message });
};
