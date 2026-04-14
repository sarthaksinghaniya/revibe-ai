import dotenv from "dotenv";

dotenv.config();

function readEnv(key, fallback) {
  const value = process.env[key];
  if (value === undefined || value === "") return fallback;
  return value;
}

function readNumber(key, fallback) {
  const raw = readEnv(key, String(fallback));
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readList(key, fallback = []) {
  const value = readEnv(key, "");
  if (!value) return fallback;
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeOrigin(origin) {
  if (!origin) return "";
  try {
    return new URL(origin).origin;
  } catch {
    return "";
  }
}

function resolveCorsOrigins() {
  const explicit = readList("CORS_ORIGINS");
  if (explicit.length > 0) {
    return explicit
      .map((origin) => normalizeOrigin(origin))
      .filter(Boolean);
  }

  const legacySingle = normalizeOrigin(readEnv("CORS_ORIGIN", ""));
  if (legacySingle) return [legacySingle];

  return ["http://localhost:3000"];
}

function resolveNodeEnv() {
  const raw = readEnv("NODE_ENV", "development").toLowerCase();
  if (raw === "production" || raw === "test") return raw;
  return "development";
}

function readScopedEnv(baseKey, nodeEnv, fallback = "") {
  const scopedKey = nodeEnv === "production" ? `${baseKey}_PROD` : `${baseKey}_LOCAL`;
  const scoped = readEnv(scopedKey, "");
  if (scoped) return scoped;
  return readEnv(baseKey, fallback);
}

const nodeEnv = resolveNodeEnv();

export const env = {
  NODE_ENV: nodeEnv,
  HOST: readEnv("HOST", "0.0.0.0"),
  PORT: readNumber("PORT", 4000),
  CORS_ORIGINS: resolveCorsOrigins(),
  GROQ_API_KEY: readEnv("GROQ_API_KEY", ""),
  GITHUB_API_BASE_URL: readEnv("GITHUB_API_BASE_URL", "https://api.github.com"),
  GITHUB_REPOS_LIMIT: readNumber("GITHUB_REPOS_LIMIT", 6),
  FRONTEND_BASE_URL: readEnv("FRONTEND_BASE_URL", "http://localhost:3000"),
  GITHUB_CLIENT_ID: readScopedEnv("GITHUB_CLIENT_ID", nodeEnv, ""),
  GITHUB_CLIENT_SECRET: readScopedEnv("GITHUB_CLIENT_SECRET", nodeEnv, ""),
  GITHUB_REDIRECT_URI: readScopedEnv(
    "GITHUB_REDIRECT_URI",
    nodeEnv,
    "http://localhost:4000/api/github/callback"
  ),
};
