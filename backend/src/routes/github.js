import { Router } from "express";

import { fetchPublicGitHubData } from "../services/githubService.js";
import { logInfo } from "../utils/logger.js";

export const githubRouter = Router();

githubRouter.get("/:username", async (req, res, next) => {
  try {
    const requestId = req.requestId ?? "unknown";
    const username = req.params.username;

    logInfo("github.request.received", {
      requestId,
      route: req.originalUrl,
      username,
    });

    const data = await fetchPublicGitHubData({ username, requestId });

    res.json({
      success: true,
      data,
      meta: { requestId },
    });
  } catch (error) {
    next(error);
  }
});
