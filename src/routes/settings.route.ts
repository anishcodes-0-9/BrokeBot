import { Router } from "express";
import { z } from "zod";
import {
  getAllSettings,
  getSettingByKey,
  upsertSettings,
  type SettingValue,
} from "../repos/settings.repo.js";

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

const settingEntrySchema = z.object({
  key: z.string().min(1),
  value: jsonValueSchema,
});

const upsertSettingsSchema = z.object({
  settings: z.array(settingEntrySchema).min(1),
});

settingsRouter.get("/", (_req, res) => {
  const settings = getAllSettings();

  res.json({
    success: true,
    data: settings,
  });
});

settingsRouter.get("/:key", (req, res) => {
  const result = z.object({ key: z.string().min(1) }).parse(req.params);
  const setting = getSettingByKey(result.key);

  if (!setting) {
    res.status(404).json({
      success: false,
      error: `Setting '${result.key}' not found`,
    });
    return;
  }

  res.json({
    success: true,
    data: setting,
  });
});

settingsRouter.post("/", (req, res) => {
  const payload = upsertSettingsSchema.parse(req.body);

  upsertSettings(payload.settings);

  res.status(201).json({
    success: true,
    message: "Settings saved",
  });
});
