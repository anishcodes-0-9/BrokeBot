import { describe, expect, it } from "vitest";
import { api, seedDefaultSettings } from "./helpers.js";
import { db } from "../db/connection.js";

describe("dashboard routes", () => {
  it("returns zeroed metrics when no data exists", async () => {
    const response = await api.get("/api/dashboard");
    console.log(response.status);
    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        jobsFoundToday: 0,
        readyJobs: 0,
        appliedToday: 0,
        dailyApplicationLimit: null,
        todayAiCostUsd: 0,
        totalTrackedAiCostUsd: 0,
      },
    });
  });

  it("reads daily limit from settings", async () => {
    seedDefaultSettings();

    const response = await api.get("/api/dashboard");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.dailyApplicationLimit).toBe(50);
  });

  it("aggregates job, application, and ai metrics", async () => {
    seedDefaultSettings();

    db.prepare(
      `
      INSERT INTO jobs (platform, title, company, url, status, created_at)
      VALUES
        ('linkedin', 'Frontend Engineer', 'Acme', 'https://example.com/job-1', 'ready', datetime('now')),
        ('indeed', 'Full Stack Engineer', 'Beta', 'https://example.com/job-2', 'approved', datetime('now')),
        ('remote', 'Support Engineer', 'Gamma', 'https://example.com/job-3', 'skipped', datetime('now', '-2 day'))
    `,
    ).run();

    db.prepare(
      `
      INSERT INTO applications (job_id, status, applied_at, created_at)
      VALUES
        (1, 'applied', datetime('now'), datetime('now')),
        (2, 'pending', NULL, datetime('now'))
    `,
    ).run();

    db.prepare(
      `
      INSERT INTO ai_runs (job_id, model, prompt_tokens, completion_tokens, estimated_cost_usd, status, created_at)
      VALUES
        (1, 'gpt-4o-mini', 200, 100, 0.02, 'completed', datetime('now')),
        (2, 'gpt-4o-mini', 250, 150, 0.03, 'completed', datetime('now'))
    `,
    ).run();

    db.prepare(
      `
      INSERT INTO daily_counters (counter_date, applications_submitted, jobs_found, ai_cost_usd, updated_at)
      VALUES (date('now', 'localtime'), 1, 2, 0.05, datetime('now'))
    `,
    ).run();

    const response = await api.get("/api/dashboard");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        jobsFoundToday: 2,
        readyJobs: 2,
        appliedToday: 1,
        dailyApplicationLimit: 50,
        todayAiCostUsd: 0.05,
        totalTrackedAiCostUsd: 0.05,
      },
    });
  });
});
