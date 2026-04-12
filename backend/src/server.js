import http from "node:http";
import { randomUUID } from "node:crypto";

import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errors.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: false,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use((req, res, next) => {
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
});

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const server = http.createServer(app);

server.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Revibe backend listening on http://localhost:${env.PORT}`);
});
