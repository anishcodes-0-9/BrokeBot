import { Router } from "express";
import { z } from "zod";
import {
  getAllSettings,
  getSettingByKey,
  upsertSettings,
  type SettingValue,
} from "../repos/settings.repo.js";
import { created, fail, ok } from "../lib/http.js";

export const settingsRouter = Router();

const jsonPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

const jsonValueSchema: z.ZodType<SettingValue> = z.lazy(() =>
  z.union([
    jsonPrimitiveSchema,
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

const settingKeySchema = z
  .string()
  .min(1)
  .max(100)
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, {
    message: "Setting key cannot be empty",
  });

const settingEntrySchema = z.object({
  key: settingKeySchema,
  value: jsonValueSchema,
});

const upsertSettingsSchema = z.object({
  settings: z.array(settingEntrySchema).min(1).max(100),
});

settingsRouter.get("/", (_req, res) => {
  const settings = getAllSettings();
  ok(res, settings);
});

settingsRouter.get("/:key", (req, res) => {
  const result = z.object({ key: settingKeySchema }).parse(req.params);
  const setting = getSettingByKey(result.key);

  if (!setting) {
    fail(res, 404, `Setting '${result.key}' not found`);
    return;
  }

  ok(res, setting);
});

settingsRouter.post("/", (req, res) => {
  const payload = upsertSettingsSchema.parse(req.body);
  const savedCount = upsertSettings(payload.settings);

  created(
    res,
    {
      savedCount,
    },
    "Settings saved",
  );
});
