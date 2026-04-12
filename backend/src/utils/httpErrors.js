export function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}
