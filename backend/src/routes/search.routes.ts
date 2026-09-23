import { Router } from "express";
import { handleSearch } from "../controllers/search.controller";
import { searchRateLimiter } from "../middleware/rateLimit";

export const searchRouter = Router();

searchRouter.post("/", searchRateLimiter, handleSearch);
