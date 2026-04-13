import fs from "node:fs";
import { Router } from "express";
import { created, fail } from "../lib/http.js";
import { mergeResumeWithAiOutput } from "../lib/resume-merge.js";
import { getSettingByKey } from "../repos/settings.repo.js";
import { applicationPackageRequestSchema } from "../schemas/application-package.schema.js";
import { resumeSchema } from "../schemas/resume.schema.js";
import { generateApplicationPackage } from "../services/openai.service.js";
import { generateResumeDocxAndPdf } from "../services/resume-docx.service.js";
import { buildGeneratedPaths, slugify } from "../utils/file.js";

export const applicationPackageRouter = Router();

applicationPackageRouter.post("/generate", async (req, res) => {
  const payload = applicationPackageRequestSchema.parse(req.body);
  const resumeSetting = getSettingByKey("baseResume");

  if (!resumeSetting) {
    fail(res, 404, "Base resume not found");
    return;
  }

  const baseResume = resumeSchema.parse(resumeSetting.value);
  const aiResult = await generateApplicationPackage(baseResume, payload.job);
  const tailoredResume = mergeResumeWithAiOutput(baseResume, aiResult);

  const prefix =
    payload.options?.fileNamePrefix ||
    slugify(
      `${baseResume.basics.fullName}-${payload.job.company ?? "job"}-${payload.job.title ?? "role"}`,
    );

  const generatedResume = await generateResumeDocxAndPdf(
    tailoredResume,
    prefix,
  );

  const coverLetterFileName = `${prefix}-cover-letter.txt`;
  const coverLetterPaths = buildGeneratedPaths(
    "cover-letters",
    coverLetterFileName,
  );
  fs.writeFileSync(coverLetterPaths.absolutePath, aiResult.coverLetter, "utf8");

  created(
    res,
    {
      resumeDocx: generatedResume.docx,
      resumePdf: generatedResume.pdf,
      coverLetter: {
        text: aiResult.coverLetter,
        fileName: coverLetterFileName,
        absolutePath: coverLetterPaths.absolutePath,
        relativePath: coverLetterPaths.relativePath,
        generatedAt: new Date().toISOString(),
      },
      preview: {
        summary: tailoredResume.summary,
        hiddenKeywords: aiResult.hiddenKeywords,
        resume: tailoredResume,
      },
    },
    "Application package generated",
  );
});
