export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract serializeErrors(): {
    message: string;
    field?: string;
  }[];

  constructor(message: string) {
    super(message); // good practice for logging purposes.
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
