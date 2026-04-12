import { logError } from "../utils/logger.js";

export function notFoundHandler(req, res) {
  const requestId = req?.requestId ?? "unknown";
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found" },
    meta: { requestId },
  });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const status = Number(err?.status) || 500;
  const requestId = req?.requestId ?? "unknown";
  const code =
    typeof err?.code === "string"
      ? err.code
      : status >= 500
      ? "INTERNAL_ERROR"
      : "BAD_REQUEST";

  const message =
    status >= 500
      ? "Unexpected server error"
      : typeof err?.message === "string"
      ? err.message
      : "Request failed";

  logError("http.error", {
    requestId,
    status,
    code,
    route: req?.originalUrl,
    method: req?.method,
    error: err,
  });

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(status < 500 && err?.details ? { details: err.details } : {}),
    },
    meta: {
      requestId,
    },
  });
}
