import type { Request, Response, NextFunction } from "express";

const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;

const hits = new Map<string, number[]>();

/**
 * Minimal in-memory rate limiter to keep SerpApi/Gemini usage bounded during the demo.
 * Not distributed-safe — fine for a single-instance hackathon deployment.
 */
export function searchRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (hits.get(key) ?? []).filter((t) => t > windowStart);
  timestamps.push(now);
  hits.set(key, timestamps);

  if (timestamps.length > MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({ error: "Too many search requests. Please wait a few minutes and try again." });
    return;
  }

  next();
}
