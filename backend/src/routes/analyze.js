import { Router } from "express";

import { generateAnalysis } from "../services/analyzeService.js";
import { badRequest } from "../utils/httpErrors.js";
import { logInfo } from "../utils/logger.js";

export const analyzeRouter = Router();

analyzeRouter.post("/", (req, res, next) => {
  (async () => {
    try {
      const requestId = req.requestId ?? "unknown";
      const { itemName, notes } = req.body ?? {};

      logInfo("analyze.request.received", {
        requestId,
        route: req.originalUrl,
        hasItemName: typeof itemName === "string",
        itemNameLength: typeof itemName === "string" ? itemName.trim().length : 0,
        hasNotes: notes !== undefined,
        notesLength: typeof notes === "string" ? notes.trim().length : 0,
      });

      if (typeof itemName !== "string" || itemName.trim().length < 2) {
        throw badRequest("`itemName` is required (string, min 2 chars).", {
          field: "itemName",
        });
      }
      if (notes !== undefined && typeof notes !== "string") {
        throw badRequest("`notes` must be a string if provided.", { field: "notes" });
      }

      const recommendation = await generateAnalysis({
        itemName,
        notes: notes ?? "",
        requestId,
      });

      logInfo("analyze.request.succeeded", {
        requestId,
        material: recommendation.material,
        ideaCount: Array.isArray(recommendation.ideas) ? recommendation.ideas.length : 0,
        stepCount: Array.isArray(recommendation.steps) ? recommendation.steps.length : 0,
      });

      res.json({
        success: true,
        data: recommendation,
        meta: { requestId },
      });
    } catch (err) {
      next(err);
    }
  })();
});
