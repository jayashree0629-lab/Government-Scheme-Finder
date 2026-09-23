import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { runSchemeFinderAgent } from "../services/agentService";
import { AppError } from "../utils/AppError";

const profileSchema = z
  .object({
    age: z.coerce.number().int().min(0).max(120).optional(),
    state: z.string().trim().max(100).optional(),
    occupation: z.string().trim().max(100).optional(),
    education: z.string().trim().max(100).optional(),
    familyIncome: z.coerce.number().min(0).max(1_000_000_000).optional(),
    category: z.string().trim().max(100).optional(),
    freeText: z.string().trim().max(1000).optional(),
  })
  .refine(
    (data) =>
      data.freeText || data.state || data.occupation || data.education || data.age !== undefined,
    { message: "Provide at least a free-text question or some profile details (state, age, occupation, education)." },
  );

export async function handleSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request data.";
      throw new AppError(message, 400);
    }

    const result = await runSchemeFinderAgent(parsed.data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
