import { env } from "../config/env.js";
import { createHttpError } from "../utils/httpErrors.js";
import { logInfo, logWarn } from "../utils/logger.js";

const MAX_USERNAME_LEN = 39;
const DEFAULT_REPOS_LIMIT = 6;
const MAX_REPOS_LIMIT = 10;
const OAUTH_REPOS_LIMIT = 4;

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

function githubAuthHeaders(accessToken) {
  return {
    ...githubHeaders(),
    Authorization: `Bearer ${accessToken}`,
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

async function fetchGitHubJsonWithAuth(url, { requestId, context, accessToken }) {
  let response;
  try {
    response = await fetch(url, { headers: githubAuthHeaders(accessToken) });
  } catch (error) {
    logWarn("github.api.network_error", {
      requestId,
      context,
      reason: error?.message ?? "Network error",
    });
    throw createHttpError(
      502,
      "GITHUB_API_UNAVAILABLE",
      "Could not reach GitHub API right now. Please try again shortly."
    );
  }

  if (response.status === 401) {
    throw createHttpError(401, "GITHUB_INVALID_TOKEN", "GitHub access token is invalid.");
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

function ensureOAuthConfig() {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_REDIRECT_URI) {
    throw createHttpError(
      500,
      "GITHUB_OAUTH_NOT_CONFIGURED",
      "GitHub OAuth is not configured on the server."
    );
  }
}

export function buildGitHubOAuthAuthorizeUrl({ state }) {
  ensureOAuthConfig();
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  url.searchParams.set("redirect_uri", env.GITHUB_REDIRECT_URI);
  url.searchParams.set("scope", "read:user");
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeGitHubCodeForToken({ code, state, requestId }) {
  ensureOAuthConfig();

  let response;
  try {
    response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "revibe-ai-backend",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: env.GITHUB_REDIRECT_URI,
        state,
      }),
    });
  } catch (error) {
    logWarn("github.oauth.token_exchange.network_error", {
      requestId,
      reason: error?.message ?? "Network error",
    });
    throw createHttpError(
      502,
      "GITHUB_OAUTH_EXCHANGE_FAILED",
      "Could not complete GitHub authentication right now."
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.access_token) {
    throw createHttpError(
      401,
      "GITHUB_OAUTH_EXCHANGE_FAILED",
      "GitHub authentication failed. Please try connecting again."
    );
  }

  return String(payload.access_token);
}

export async function fetchGitHubOAuthUserData({ accessToken, requestId }) {
  const base = env.GITHUB_API_BASE_URL.replace(/\/$/, "");

  const [userRaw, reposRaw] = await Promise.all([
    fetchGitHubJsonWithAuth(`${base}/user`, {
      requestId,
      context: "oauth_profile",
      accessToken,
    }),
    fetchGitHubJsonWithAuth(
      `${base}/user/repos?visibility=public&affiliation=owner&sort=updated&per_page=${OAUTH_REPOS_LIMIT}`,
      {
        requestId,
        context: "oauth_repos",
        accessToken,
      }
    ),
  ]);

  const repos = Array.isArray(reposRaw) ? reposRaw : [];
  repos.sort(
    (a, b) =>
      new Date(b?.updated_at ?? 0).getTime() - new Date(a?.updated_at ?? 0).getTime()
  );

  return {
    username: userRaw.login,
    name: userRaw.name,
    avatarUrl: userRaw.avatar_url,
    profileUrl: userRaw.html_url,
    repos: repos.slice(0, OAUTH_REPOS_LIMIT).map(mapRepo),
  };
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
