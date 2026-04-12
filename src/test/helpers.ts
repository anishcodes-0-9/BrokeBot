import fs from "node:fs";
import path from "node:path";
import request from "supertest";
import { beforeEach } from "vitest";

process.env.NODE_ENV = "test";
process.env.TEST_DATABASE_PATH = "./data/brokebot.test.db";
process.env.DATABASE_PATH = "./data/brokebot.test.db";
process.env.PORT = "4000";
process.env.CORS_ORIGIN = "http://localhost:5173";

import { createApp } from "../app.js";
import { db } from "../db/connection.js";
import { upsertSettings } from "../repos/settings.repo.js";

const schemaPath = path.resolve(process.cwd(), "src/db/schema.sql");
const schemaSql = fs.readFileSync(schemaPath, "utf8");

export const app = createApp();
export const api = request(app);

export function resetDatabase(): void {
  db.exec(`
    DROP TABLE IF EXISTS daily_counters;
    DROP TABLE IF EXISTS bot_runs;
    DROP TABLE IF EXISTS ai_runs;
    DROP TABLE IF EXISTS applications;
    DROP TABLE IF EXISTS jobs;
    DROP TABLE IF EXISTS settings;
  `);

  db.exec(schemaSql);
}

export function seedDefaultSettings(): void {
  upsertSettings([
    { key: "dailyLimit", value: 50 },
    { key: "salaryThresholdLpa", value: 18 },
    {
      key: "roleKeywords",
      value: ["software engineer", "frontend engineer", "full stack engineer"],
    },
  ]);
}

beforeEach(() => {
  resetDatabase();
});
