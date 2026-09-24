import type { Request, Response, NextFunction } from "express";
import { config } from "../config/env";

const IP_WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_IP_PER_WINDOW = 15;
const GLOBAL_WINDOW_MS = 60 * 60 * 1000;
const MAX_TRACKED_IPS = 10_000;

const ipHits = new Map<string, number[]>();
let globalHits: number[] = [];
let inFlight = 0;

// Drop idle entries so the map cannot grow without bound (e.g. many rotating client IPs).
setInterval(() => {
  const cutoff = Date.now() - IP_WINDOW_MS;
  for (const [key, timestamps] of ipHits) {
    if (timestamps.length === 0 || timestamps[timestamps.length - 1] <= cutoff) ipHits.delete(key);
  }
}, 60_000).unref();

function reject(res: Response, retryAfterSeconds: number, message: string): void {
  res.setHeader("Retry-After", String(retryAfterSeconds));
  res.status(429).json({ error: message });
}

/**
 * In-memory limiter protecting SerpApi/Gemini quota on the expensive search endpoint:
 *  - per client IP (short window),
 *  - one global hourly budget shared by everyone,
 *  - a cap on searches running at the same time.
 * Single-instance only. Behind a reverse proxy, configure Express "trust proxy" so req.ip is the
 * real client rather than the proxy (otherwise every user shares one per-IP bucket).
 */
export function searchRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const now = Date.now();
  const key = req.ip ?? "unknown";

  if (!ipHits.has(key) && ipHits.size >= MAX_TRACKED_IPS) {
    reject(res, 60, "The service is busy. Please try again in a minute.");
    return;
  }
  const timestamps = (ipHits.get(key) ?? []).filter((t) => t > now - IP_WINDOW_MS);
  timestamps.push(now);
  ipHits.set(key, timestamps);
  if (timestamps.length > MAX_REQUESTS_PER_IP_PER_WINDOW) {
    reject(res, Math.ceil(IP_WINDOW_MS / 1000), "Too many search requests. Please wait a few minutes and try again.");
    return;
  }

  globalHits = globalHits.filter((t) => t > now - GLOBAL_WINDOW_MS);
  if (globalHits.length >= config.maxSearchesPerHour) {
    reject(res, 600, "The service has reached its hourly search limit. Please try again later.");
    return;
  }

  if (inFlight >= config.maxConcurrentSearches) {
    reject(res, 30, "The service is busy with other searches. Please try again shortly.");
    return;
  }

  globalHits.push(now);
  inFlight++;
  let released = false;
  const release = () => {
    if (!released) {
      released = true;
      inFlight--;
    }
  };
  res.on("finish", release);
  res.on("close", release);

  next();
}
