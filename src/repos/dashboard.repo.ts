import { db } from "../db/connection.js";

export interface DashboardSummary {
  jobsFoundToday: number;
  readyJobs: number;
  appliedToday: number;
  dailyApplicationLimit: number | null;
  todayAiCostUsd: number;
  totalTrackedAiCostUsd: number;
}

const summaryStmt = db.prepare(`
  SELECT
    COALESCE((
      SELECT COUNT(*)
      FROM jobs
      WHERE date(created_at) = date('now', 'localtime')
    ), 0) AS jobsFoundToday,
    COALESCE((
      SELECT COUNT(*)
      FROM jobs
      WHERE status IN ('ready', 'approved', 'review_required')
    ), 0) AS readyJobs,
    COALESCE((
      SELECT COUNT(*)
      FROM applications
      WHERE date(COALESCE(applied_at, created_at)) = date('now', 'localtime')
        AND status = 'applied'
    ), 0) AS appliedToday,
    COALESCE((
      SELECT ai_cost_usd
      FROM daily_counters
      WHERE counter_date = date('now', 'localtime')
      LIMIT 1
    ), 0) AS todayAiCostUsd,
    COALESCE((
      SELECT SUM(estimated_cost_usd)
      FROM ai_runs
    ), 0) AS totalTrackedAiCostUsd
`);

const selectDailyLimitStmt = db.prepare(`
  SELECT value
  FROM settings
  WHERE key = 'dailyLimit'
  LIMIT 1
`);

export function getDashboardSummary(): DashboardSummary {
  const row = summaryStmt.get() as {
    jobsFoundToday: number;
    readyJobs: number;
    appliedToday: number;
    todayAiCostUsd: number;
    totalTrackedAiCostUsd: number;
  };

  const dailyLimitRow = selectDailyLimitStmt.get() as
    | { value: string }
    | undefined;

  let dailyApplicationLimit: number | null = null;

  if (dailyLimitRow) {
    try {
      const parsed = JSON.parse(dailyLimitRow.value) as unknown;
      if (typeof parsed === "number") {
        dailyApplicationLimit = parsed;
      }
    } catch {
      dailyApplicationLimit = null;
    }
  }

  return {
    jobsFoundToday: row.jobsFoundToday,
    readyJobs: row.readyJobs,
    appliedToday: row.appliedToday,
    dailyApplicationLimit,
    todayAiCostUsd: row.todayAiCostUsd,
    totalTrackedAiCostUsd: row.totalTrackedAiCostUsd,
  };
}
