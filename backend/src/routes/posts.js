import { Router } from "express";

import {
  listPosts,
  getPostById,
  createPost,
} from "../services/postsService.js";
import { badRequest } from "../utils/httpErrors.js";

export const postsRouter = Router();

postsRouter.get("/", async (_req, res, next) => {
  try {
    const posts = await listPosts();
    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
});

postsRouter.get("/:id", async (req, res, next) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Post not found" },
      });
    }
    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
});

postsRouter.post("/", async (req, res, next) => {
  try {
    const { userName, caption, imageSrc, progressPct } = req.body ?? {};

    if (typeof userName !== "string" || userName.trim().length < 2) {
      throw badRequest("`userName` is required (string, min 2 chars).");
    }
    if (typeof caption !== "string" || caption.trim().length < 2) {
      throw badRequest("`caption` is required (string, min 2 chars).");
    }
    if (imageSrc !== undefined && typeof imageSrc !== "string") {
      throw badRequest("`imageSrc` must be a string if provided.");
    }
    if (
      progressPct !== undefined &&
      (typeof progressPct !== "number" ||
        !Number.isFinite(progressPct) ||
        progressPct < 0 ||
        progressPct > 100)
    ) {
      throw badRequest("`progressPct` must be a number between 0 and 100.");
    }

    const post = await createPost({
      userName,
      caption,
      imageSrc,
      progressPct,
    });

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
});
