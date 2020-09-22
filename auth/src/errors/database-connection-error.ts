import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  reason = "Error connecting to Database";
  constructor() {
    super('DB ERROR');
    // Only because we are extending a build-in class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
