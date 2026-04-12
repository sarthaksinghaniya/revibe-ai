import { Router } from "express";

import { generateAnalysis } from "../services/analyzeService.js";
import { badRequest } from "../utils/httpErrors.js";

export const analyzeRouter = Router();

analyzeRouter.post("/", (req, res, next) => {
  (async () => {
    try {
    const { itemName, notes } = req.body ?? {};

    if (typeof itemName !== "string" || itemName.trim().length < 2) {
      throw badRequest("`itemName` is required (string, min 2 chars).");
    }
    if (notes !== undefined && typeof notes !== "string") {
      throw badRequest("`notes` must be a string if provided.");
    }

    const recommendation = await generateAnalysis({
      itemName,
      notes: notes ?? "",
    });

    res.json({
      success: true,
      data: recommendation,
    });
    } catch (err) {
      next(err);
    }
  })();
});
