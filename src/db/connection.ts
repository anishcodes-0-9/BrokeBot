import Database from "better-sqlite3";
import { env } from "../config/env.js";

const databasePath =
  env.NODE_ENV === "test" && process.env.TEST_DATABASE_PATH
    ? process.env.TEST_DATABASE_PATH
    : env.DATABASE_PATH;

export const db = new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
