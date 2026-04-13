import { Router } from "express";
import { z } from "zod";
import { created, fail, ok } from "../lib/http.js";
import { resumeSchema } from "../schemas/resume.schema.js";
import { getSettingByKey, upsertSettings } from "../repos/settings.repo.js";
import { generateResumePdf } from "../services/resume-pdf.service.js";

export const resumeRouter = Router();

const resumeSettingKey = "baseResume";

const pdfRequestSchema = z
  .object({
    fileNamePrefix: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[a-zA-Z0-9-_]+$/)
      .optional(),
  })
  .optional();

resumeRouter.get("/", (_req, res) => {
  const setting = getSettingByKey(resumeSettingKey);

  if (!setting) {
    fail(res, 404, "Base resume not found");
    return;
  }

  ok(res, setting.value);
});

resumeRouter.post("/", (req, res) => {
  const payload = resumeSchema.parse(req.body);

  upsertSettings([
    {
      key: resumeSettingKey,
      value: payload,
    },
  ]);

  created(
    res,
    {
      key: resumeSettingKey,
    },
    "Base resume saved",
  );
});

resumeRouter.get("/meta", (_req, res) => {
  const setting = getSettingByKey(resumeSettingKey);

  if (!setting) {
    fail(res, 404, "Base resume not found");
    return;
  }

  const parsed = resumeSchema.parse(setting.value);

  ok(res, {
    fullName: parsed.basics.fullName,
    email: parsed.basics.email,
    experienceCount: parsed.experience.length,
    projectCount: parsed.projects.length,
    educationCount: parsed.education.length,
    skillGroupCount: parsed.skills.length,
    updatedAt: setting.updatedAt,
  });
});

resumeRouter.post("/pdf", async (req, res) => {
  const parsedRequest = pdfRequestSchema.parse(req.body ?? {});
  const setting = getSettingByKey(resumeSettingKey);

  if (!setting) {
    fail(res, 404, "Base resume not found");
    return;
  }

  const resume = resumeSchema.parse(setting.value);
  const generated = await generateResumePdf(
    resume,
    parsedRequest?.fileNamePrefix,
  );

  created(res, generated, "Resume PDF generated");
});

resumeRouter.delete("/", (_req, res) => {
  fail(res, 501, "Resume deletion is not implemented yet");
});
