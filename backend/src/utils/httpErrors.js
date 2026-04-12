export function createHttpError(status, code, message, details) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  if (details !== undefined) err.details = details;
  return err;
}

export function badRequest(message, details) {
  return createHttpError(400, "BAD_REQUEST", message, details);
}
