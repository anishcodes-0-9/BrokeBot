import { Router } from "express";
import { created, fail } from "../lib/http.js";
import { getSettingByKey } from "../repos/settings.repo.js";
import { generateApplicationRequestSchema } from "../schemas/ai.schema.js";
import { resumeSchema } from "../schemas/resume.schema.js";
import { generateApplicationPackage } from "../services/openai.service.js";

export const aiRouter = Router();

aiRouter.post("/generate", async (req, res) => {
  const payload = generateApplicationRequestSchema.parse(req.body);
  const resumeSetting = getSettingByKey("baseResume");

  if (!resumeSetting) {
    fail(res, 404, "Base resume not found");
    return;
  }

  const resume = resumeSchema.parse(resumeSetting.value);
  const generated = await generateApplicationPackage(resume, payload.job);

  created(res, generated, "Application package generated");
});
