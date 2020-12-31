import { CustomError } from "./custom-error";

export class NotAuthorizedError extends CustomError {
  statusCode = 401;
  reason = "Error connecting to Database";
  constructor() {
    super("Not Authorized");
    // Only because we are extending a build-in class
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
  
  serializeErrors() {
    return [{ message: "Not Authorized" }];
  }
}
