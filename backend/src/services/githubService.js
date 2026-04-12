import { env } from "../config/env.js";
import { createHttpError } from "../utils/httpErrors.js";
import { logInfo, logWarn } from "../utils/logger.js";

const MAX_USERNAME_LEN = 39;
const DEFAULT_REPOS_LIMIT = 6;
const MAX_REPOS_LIMIT = 10;

function normalizeUsername(username) {
  return String(username ?? "").trim().replace(/^@+/, "");
}

function isValidGithubUsername(username) {
  if (!username) return false;
  if (username.length > MAX_USERNAME_LEN) return false;
  if (username.startsWith("-") || username.endsWith("-")) return false;
  if (username.includes("--")) return false;
  return /^[A-Za-z0-9-]+$/.test(username);
}

function resolveReposLimit() {
  const configured = Number(env.GITHUB_REPOS_LIMIT);
  if (!Number.isFinite(configured) || configured < 1) return DEFAULT_REPOS_LIMIT;
  return Math.min(Math.round(configured), MAX_REPOS_LIMIT);
}

function githubHeaders() {
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "revibe-ai-backend",
  };
}

function mapProfile(raw) {
  return {
    username: raw.login,
    name: raw.name,
    avatarUrl: raw.avatar_url,
    bio: raw.bio,
    followers: raw.followers,
    following: raw.following,
    publicRepos: raw.public_repos,
    profileUrl: raw.html_url,
  };
}

function mapRepo(raw) {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    language: raw.language,
    repoUrl: raw.html_url,
    updatedAt: raw.updated_at,
  };
}

function getRateLimitMeta(response) {
  const remaining = Number(response.headers.get("x-ratelimit-remaining"));
  const resetUnix = Number(response.headers.get("x-ratelimit-reset"));
  const resetAt =
    Number.isFinite(resetUnix) && resetUnix > 0
      ? new Date(resetUnix * 1000).toISOString()
      : null;

  return {
    remaining: Number.isFinite(remaining) ? remaining : null,
    resetAt,
  };
}

async function fetchGitHubJson(url, { requestId, context, username }) {
  let response;
  try {
    response = await fetch(url, { headers: githubHeaders() });
  } catch (error) {
    logWarn("github.api.network_error", {
      requestId,
      context,
      username,
      reason: error?.message ?? "Network error",
    });
    throw createHttpError(
      502,
      "GITHUB_API_UNAVAILABLE",
      "Could not reach GitHub API right now. Please try again shortly."
    );
  }

  if (response.status === 404) {
    throw createHttpError(404, "GITHUB_USER_NOT_FOUND", "GitHub username not found.", {
      username,
    });
  }

  if (response.status === 403) {
    const rateLimit = getRateLimitMeta(response);
    if (rateLimit.remaining === 0) {
      throw createHttpError(
        429,
        "GITHUB_RATE_LIMIT",
        "GitHub API rate limit reached. Please try again later.",
        rateLimit
      );
    }
  }

  if (!response.ok) {
    logWarn("github.api.failed", {
      requestId,
      context,
      username,
      status: response.status,
    });
    throw createHttpError(
      502,
      "GITHUB_API_ERROR",
      "GitHub API returned an unexpected response."
    );
  }

  return response.json();
}

export async function fetchPublicGitHubData({ username, requestId }) {
  const normalizedUsername = normalizeUsername(username);

  if (!isValidGithubUsername(normalizedUsername)) {
    throw createHttpError(
      400,
      "INVALID_GITHUB_USERNAME",
      "Please provide a valid GitHub username.",
      { username: normalizedUsername }
    );
  }

  const base = env.GITHUB_API_BASE_URL.replace(/\/$/, "");
  const reposLimit = resolveReposLimit();

  const profileUrl = `${base}/users/${encodeURIComponent(normalizedUsername)}`;
  const reposUrl =
    `${base}/users/${encodeURIComponent(normalizedUsername)}` +
    `/repos?type=owner&sort=updated&per_page=${reposLimit}`;

  logInfo("github.fetch.started", {
    requestId,
    username: normalizedUsername,
    reposLimit,
  });

  const [profileRaw, reposRaw] = await Promise.all([
    fetchGitHubJson(profileUrl, {
      requestId,
      context: "profile",
      username: normalizedUsername,
    }),
    fetchGitHubJson(reposUrl, {
      requestId,
      context: "repos",
      username: normalizedUsername,
    }),
  ]);

  const repos = Array.isArray(reposRaw) ? reposRaw : [];
  repos.sort(
    (a, b) =>
      new Date(b?.updated_at ?? 0).getTime() - new Date(a?.updated_at ?? 0).getTime()
  );

  const mapped = {
    profile: mapProfile(profileRaw),
    repos: repos.slice(0, reposLimit).map(mapRepo),
  };

  logInfo("github.fetch.succeeded", {
    requestId,
    username: normalizedUsername,
    repoCount: mapped.repos.length,
  });

  return mapped;
}
