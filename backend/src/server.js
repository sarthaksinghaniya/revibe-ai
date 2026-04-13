import "dotenv/config";
import http from "node:http";
import { randomUUID } from "node:crypto";

import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errors.js";
import { createHttpError } from "./utils/httpErrors.js";

const app = express();

const allowedOrigins = new Set(env.CORS_ORIGINS);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(
        createHttpError(
          403,
          "CORS_ORIGIN_NOT_ALLOWED",
          "Request origin is not allowed by CORS policy."
        )
      );
    },
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

server.listen(env.PORT, env.HOST, () => {
  // eslint-disable-next-line no-console
  console.log(
    `Revibe backend listening on ${env.HOST}:${env.PORT} (${env.NODE_ENV})`
  );
  // Temporary OAuth startup diagnostics for local setup.
  // eslint-disable-next-line no-console
  console.log(`GITHUB_CLIENT_ID=${env.GITHUB_CLIENT_ID || "<missing>"}`);
  // eslint-disable-next-line no-console
  console.log(
    `GITHUB_CLIENT_SECRET_PRESENT=${Boolean(env.GITHUB_CLIENT_SECRET)}`
  );
  // eslint-disable-next-line no-console
  console.log(`GITHUB_REDIRECT_URI=${env.GITHUB_REDIRECT_URI || "<missing>"}`);
});
