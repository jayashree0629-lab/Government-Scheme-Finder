export class AppError extends Error {
  public readonly statusCode: number;
  public readonly userMessage: string;

  constructor(userMessage: string, statusCode = 500, cause?: unknown) {
    super(userMessage, cause !== undefined ? { cause } : undefined);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.userMessage = userMessage;
  }
}
