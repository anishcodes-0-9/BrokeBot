import { Router } from "express";
import { ok } from "../lib/http.js";
import { getDashboardSummary } from "../repos/dashboard.repo.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", (_req, res) => {
  const summary = getDashboardSummary();
  ok(res, summary);
});
