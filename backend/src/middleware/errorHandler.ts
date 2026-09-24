import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

// Generic on purpose: never echo the requested path or method back to the client.
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not found." });
}

interface HttpLikeError {
  type?: string;
  status?: number;
  statusCode?: number;
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

  // Body-parser client errors (malformed JSON, body too large, ...) are the caller's fault, not a 500.
  const httpErr = (typeof err === "object" && err !== null ? err : {}) as HttpLikeError;
  if (httpErr.type === "entity.too.large") {
    res.status(413).json({ error: "Request body is too large." });
    return;
  }
  const clientStatus = httpErr.status ?? httpErr.statusCode;
  if (typeof clientStatus === "number" && clientStatus >= 400 && clientStatus < 500) {
    res.status(400).json({ error: "The request could not be read. Please send valid JSON." });
    return;
  }

  logger.error("Unhandled server error", err);
  res.status(500).json({ error: "Something went wrong on the server. Please try again." });
}
