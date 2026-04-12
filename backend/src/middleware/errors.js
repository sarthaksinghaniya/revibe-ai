export function notFoundHandler(_req, res) {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = Number(err?.status) || 500;
  const message =
    typeof err?.message === "string" ? err.message : "Unexpected server error";

  res.status(status).json({
    success: false,
    error: {
      code: status >= 500 ? "INTERNAL_ERROR" : "BAD_REQUEST",
      message,
    },
  });
}
