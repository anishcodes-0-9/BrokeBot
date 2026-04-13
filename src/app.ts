import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import {
  errorHandler,
  jsonSyntaxErrorHandler,
  notFoundHandler,
  ok,
} from "./lib/http.js";
import { requestIdMiddleware } from "./lib/request-id.js";
import { dashboardRouter } from "./routes/dashboard.route.js";
import { healthRouter } from "./routes/health.route.js";
import { resumeRouter } from "./routes/resume.route.js";
import { settingsRouter } from "./routes/settings.route.js";

export function createApp() {
  const app = express();

  app.use(requestIdMiddleware);
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
    }),
  );
  app.use(helmet());
  app.use(
    morgan(
      ":method :url :status :response-time ms - :res[content-length] :req[x-request-id]",
    ),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/", (_req, res) => {
    ok(res, {
      name: "BrokeBot API",
      version: "phase-2.2",
    });
  });

  app.use("/api/health", healthRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/resume", resumeRouter);

  app.use(jsonSyntaxErrorHandler);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
