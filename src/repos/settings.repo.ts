import { db } from "../db/connection.js";

export type SettingValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | Array<unknown>;

export interface SettingRecord<T = SettingValue> {
  key: string;
  value: T;
  updatedAt: string;
}

const selectAllStmt = db.prepare(`
  SELECT key, value, updated_at
  FROM settings
  ORDER BY key ASC
`);

const selectByKeyStmt = db.prepare(`
  SELECT key, value, updated_at
  FROM settings
  WHERE key = ?
`);

const upsertStmt = db.prepare(`
  INSERT INTO settings (key, value, updated_at)
  VALUES (@key, @value, datetime('now'))
  ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = datetime('now')
`);

function parseValue(raw: string): SettingValue {
  try {
    return JSON.parse(raw) as SettingValue;
  } catch {
    return raw;
  }
}

function serializeValue(value: SettingValue): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

export function getAllSettings(): SettingRecord[] {
  const rows = selectAllStmt.all() as Array<{
    key: string;
    value: string;
    updated_at: string;
  }>;

  return rows.map((row) => ({
    key: row.key,
    value: parseValue(row.value),
    updatedAt: row.updated_at,
  }));
}

export function getSettingByKey(key: string): SettingRecord | null {
  const row = selectByKeyStmt.get(key) as
    | {
        key: string;
        value: string;
        updated_at: string;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    key: row.key,
    value: parseValue(row.value),
    updatedAt: row.updated_at,
  };
}

export function upsertSettings(
  entries: Array<{ key: string; value: SettingValue }>,
): number {
  const transaction = db.transaction(
    (items: Array<{ key: string; value: SettingValue }>) => {
      for (const item of items) {
        upsertStmt.run({
          key: item.key,
          value: serializeValue(item.value),
        });
      }

      return items.length;
    },
  );

  return transaction(entries);
}
