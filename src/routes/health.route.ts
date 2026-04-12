import { Router } from "express";
import { ok } from "../lib/http.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  ok(res, {
    status: "ok",
    service: "brokebot-api",
    timestamp: new Date().toISOString(),
  });
});
