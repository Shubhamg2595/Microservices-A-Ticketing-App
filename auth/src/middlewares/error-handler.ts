import { Request, Response, NextFunction } from "express";
import { DatabaseConnectionError } from "../errors/database-connection-error";
import { RequestValidationError } from "../errors/request-validation-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
//   console.error("Error found", err);

  if (err instanceof RequestValidationError) {
    console.log("request validation error");
  }

  if (err instanceof DatabaseConnectionError) {
    console.log("DB ERROR");
  }

  res.status(400).send({
    message: err.message,
  });
};
