import { db } from "../db/connection.js";
import { AppError } from "../lib/errors.js";

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

function parseValue(raw: string): SettingValue {
  try {
    return JSON.parse(raw) as SettingValue;
  } catch {
    return raw;
  }
}

function serializeValue(value: SettingValue): string {
  if (typeof value === "string") {
    if (value.length > 10000) {
      throw new AppError(400, "Setting string value exceeds maximum length");
    }

    return value;
  }

  const serialized = JSON.stringify(value);

  if (serialized.length > 50000) {
    throw new AppError(400, "Setting value exceeds maximum size");
  }

  return serialized;
}

export function getAllSettings(): SettingRecord[] {
  const selectAllStmt = db.prepare(`
    SELECT key, value, updated_at
    FROM settings
    ORDER BY key ASC
  `);

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
  const selectByKeyStmt = db.prepare(`
    SELECT key, value, updated_at
    FROM settings
    WHERE key = ?
  `);

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
  const seenKeys = new Set<string>();

  for (const entry of entries) {
    const normalizedKey = entry.key.trim();

    if (seenKeys.has(normalizedKey)) {
      throw new AppError(
        400,
        `Duplicate setting key '${normalizedKey}' in request`,
      );
    }

    seenKeys.add(normalizedKey);
  }

  const upsertStmt = db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (@key, @value, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = datetime('now')
  `);

  const transaction = db.transaction(
    (items: Array<{ key: string; value: SettingValue }>) => {
      for (const item of items) {
        const normalizedKey = item.key.trim();

        upsertStmt.run({
          key: normalizedKey,
          value: serializeValue(item.value),
        });
      }

      return items.length;
    },
  );

  return transaction(entries);
}
