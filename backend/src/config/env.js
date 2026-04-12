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

export const env = {
  PORT: readNumber("PORT", 4000),
  CORS_ORIGIN: readEnv("CORS_ORIGIN", "http://localhost:3000"),
  GROQ_API_KEY: readEnv("GROQ_API_KEY", ""),
  GITHUB_API_BASE_URL: readEnv("GITHUB_API_BASE_URL", "https://api.github.com"),
  GITHUB_REPOS_LIMIT: readNumber("GITHUB_REPOS_LIMIT", 6),
};
