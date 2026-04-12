import { Router } from "express";
import { randomUUID } from "node:crypto";

import {
  buildGitHubOAuthAuthorizeUrl,
  exchangeGitHubCodeForToken,
  fetchGitHubOAuthUserData,
  fetchPublicGitHubData,
} from "../services/githubService.js";
import { createHttpError } from "../utils/httpErrors.js";
import { logInfo, logWarn } from "../utils/logger.js";
import { env } from "../config/env.js";

export const githubRouter = Router();

const OAUTH_STATE_COOKIE = "revibe_github_oauth_state";
const OAUTH_RETURN_COOKIE = "revibe_github_oauth_return";
const COOKIE_MAX_AGE_MS = 10 * 60 * 1000;

function parseCookies(rawCookie) {
  const cookieHeader = String(rawCookie ?? "");
  const pairs = cookieHeader.split(";");
  const result = {};

  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx <= 0) continue;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (!key) continue;
    result[key] = decodeURIComponent(value);
  }

  return result;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.FRONTEND_BASE_URL.startsWith("https://"),
    maxAge: COOKIE_MAX_AGE_MS,
    path: "/api/github",
  };
}

function clearOAuthCookies(res) {
  res.clearCookie(OAUTH_STATE_COOKIE, { path: "/api/github" });
  res.clearCookie(OAUTH_RETURN_COOKIE, { path: "/api/github" });
}

function resolveFrontendReturn(raw) {
  const base = env.FRONTEND_BASE_URL.replace(/\/$/, "");
  const defaultPath = `${base}/profile`;
  if (!raw) return defaultPath;

  if (raw.startsWith("/")) return `${base}${raw}`;

  try {
    const candidate = new URL(raw);
    const allowedOrigin = new URL(base).origin;
    if (candidate.origin !== allowedOrigin) return defaultPath;
    return candidate.toString();
  } catch {
    return defaultPath;
  }
}

function encodePayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function buildFrontendRedirect(baseUrl, params) {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

githubRouter.get("/auth", async (req, res, next) => {
  try {
    const requestId = req.requestId ?? "unknown";
    const state = randomUUID();
    const returnTo = resolveFrontendReturn(String(req.query.redirect ?? ""));

    res.cookie(OAUTH_STATE_COOKIE, state, cookieOptions());
    res.cookie(OAUTH_RETURN_COOKIE, encodeURIComponent(returnTo), cookieOptions());

    const authorizeUrl = buildGitHubOAuthAuthorizeUrl({ state });

    logInfo("github.oauth.auth.redirect", { requestId, returnTo });
    res.redirect(authorizeUrl);
  } catch (error) {
    next(error);
  }
});

githubRouter.get("/callback", async (req, res, next) => {
  try {
    const requestId = req.requestId ?? "unknown";
    const code = String(req.query.code ?? "");
    const state = String(req.query.state ?? "");
    const deniedError = String(req.query.error ?? "");

    const cookies = parseCookies(req.headers.cookie);
    const savedState = cookies[OAUTH_STATE_COOKIE] ?? "";
    const savedReturnTo = decodeURIComponent(cookies[OAUTH_RETURN_COOKIE] ?? "");
    const returnTo = resolveFrontendReturn(savedReturnTo);

    clearOAuthCookies(res);

    if (deniedError) {
      const deniedRedirect = buildFrontendRedirect(returnTo, {
        github_oauth: "error",
        github_error: "GitHub access was denied by the user.",
      });
      return res.redirect(deniedRedirect);
    }

    if (!code || !state) {
      throw createHttpError(
        400,
        "GITHUB_OAUTH_INVALID_CALLBACK",
        "Missing OAuth code/state from GitHub callback."
      );
    }

    if (!savedState || state !== savedState) {
      throw createHttpError(
        400,
        "GITHUB_OAUTH_STATE_MISMATCH",
        "GitHub OAuth state mismatch. Please try connecting again."
      );
    }

    const accessToken = await exchangeGitHubCodeForToken({ code, state, requestId });
    const data = await fetchGitHubOAuthUserData({ accessToken, requestId });

    logInfo("github.oauth.callback.succeeded", {
      requestId,
      username: data.username,
      repoCount: data.repos.length,
    });

    if (String(req.query.mode ?? "") === "json") {
      return res.json({
        success: true,
        data,
        meta: { requestId },
      });
    }

    const successRedirect = buildFrontendRedirect(returnTo, {
      github_oauth: "success",
      github_data: encodePayload(data),
    });
    return res.redirect(successRedirect);
  } catch (error) {
    const requestId = req.requestId ?? "unknown";
    const cookies = parseCookies(req.headers.cookie);
    const savedReturnTo = decodeURIComponent(cookies[OAUTH_RETURN_COOKIE] ?? "");
    const returnTo = resolveFrontendReturn(savedReturnTo);
    clearOAuthCookies(res);

    const message =
      error instanceof Error ? error.message : "GitHub OAuth callback failed.";

    logWarn("github.oauth.callback.failed", {
      requestId,
      reason: message,
    });

    if (String(req.query.mode ?? "") === "json") {
      return next(error);
    }

    const errorRedirect = buildFrontendRedirect(returnTo, {
      github_oauth: "error",
      github_error: message,
    });
    return res.redirect(errorRedirect);
  }
});

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
