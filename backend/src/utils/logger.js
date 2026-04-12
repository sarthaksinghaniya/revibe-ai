function nowIso() {
  return new Date().toISOString();
}

function safeString(value, maxLength = 300) {
  const text = String(value ?? "");
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

function normalizeMeta(meta) {
  if (!meta || typeof meta !== "object") return {};
  const normalized = {};

  for (const [key, value] of Object.entries(meta)) {
    if (value instanceof Error) {
      normalized[key] = {
        name: value.name,
        message: safeString(value.message),
      };
      continue;
    }

    if (typeof value === "string") {
      normalized[key] = safeString(value);
      continue;
    }

    normalized[key] = value;
  }

  return normalized;
}

function log(level, event, meta = {}) {
  const payload = {
    ts: nowIso(),
    level,
    event,
    ...normalizeMeta(meta),
  };

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
}

export function logInfo(event, meta) {
  log("info", event, meta);
}

export function logWarn(event, meta) {
  log("warn", event, meta);
}

export function logError(event, meta) {
  log("error", event, meta);
}
