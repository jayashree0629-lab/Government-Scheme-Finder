import express from "express";
import cors from "cors";
import { config, logConfigWarnings } from "./config/env";
import { healthRouter } from "./routes/health.routes";
import { searchRouter } from "./routes/search.routes";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";

logConfigWarnings();

const app = express();

app.use(cors({ origin: config.frontendOrigin }));
app.use(express.json({ limit: "50kb" }));

app.use("/api/health", healthRouter);
app.use("/api/search", searchRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Backend listening on http://localhost:${config.port}`);
  logger.info(`Allowing requests from frontend origin: ${config.frontendOrigin}`);
});
