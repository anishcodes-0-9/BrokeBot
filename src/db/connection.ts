import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { env } from "../config/env.js";

const databasePath =
  env.NODE_ENV === "test" && process.env.TEST_DATABASE_PATH
    ? process.env.TEST_DATABASE_PATH
    : env.DATABASE_PATH;

const databaseDir = path.dirname(databasePath);

if (databaseDir && databaseDir !== ".") {
  fs.mkdirSync(databaseDir, { recursive: true });
}

export const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");
