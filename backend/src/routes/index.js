import { Router } from "express";

import { healthRouter } from "./health.js";
import { analyzeRouter } from "./analyze.js";
import { postsRouter } from "./posts.js";
import { githubRouter } from "./github.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/analyze", analyzeRouter);
apiRouter.use("/posts", postsRouter);
apiRouter.use("/github", githubRouter);
