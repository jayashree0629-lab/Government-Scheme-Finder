import { Router } from "express";
import { config } from "../config/env";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    serpApiConfigured: Boolean(config.serpApiKey),
    geminiConfigured: Boolean(config.geminiApiKey),
  });
});
