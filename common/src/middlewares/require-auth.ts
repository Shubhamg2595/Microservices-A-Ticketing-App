import { Request, Response, NextFunction } from "express";
import { NotAuthorizedError } from "../errors/not-authorized-error";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // check if jwt token is present with the request by testing req.currentUser

  if (!req.currentUser) {
    throw new NotAuthorizedError();
  }

  next();
};
