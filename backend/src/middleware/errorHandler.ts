import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `No route: ${req.method} ${req.path}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.userMessage, err);
    } else {
      logger.warn(err.userMessage);
    }
    res.status(err.statusCode).json({ error: err.userMessage });
    return;
  }

  logger.error("Unhandled server error", err);
  res.status(500).json({ error: "Something went wrong on the server. Please try again." });
}
