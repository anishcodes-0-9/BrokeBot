import OpenAI from "openai";
import { env } from "../config/env.js";
import { AppError } from "../lib/errors.js";
import { cleanJobDescription } from "../lib/jd-cleaner.js";
import { buildApplicationPrompt } from "../prompts/resume-tailor.prompt.js";
import { applicationPackageSchema } from "../schemas/ai.schema.js";
import type {
  GeneratedApplicationPackage,
  JobDescriptionInput,
} from "../types/ai.js";
import type { ResumeData } from "../types/resume.js";

function getClient(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new AppError(400, "OPENAI_API_KEY is not configured");
  }

  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}

function extractJson(raw: string): string {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new AppError(502, "AI response did not contain valid JSON");
  }

  return raw.slice(start, end + 1);
}

export async function generateApplicationPackage(
  resume: ResumeData,
  job: JobDescriptionInput,
): Promise<GeneratedApplicationPackage> {
  if (env.NODE_ENV === "test") {
    return {
      summary: "Tailored frontend engineer summary for the target role.",
      coverLetter:
        "I am excited to apply for this role. My background in React, TypeScript, and Node.js aligns well with the requirements, and I would be glad to contribute quickly.",
      hiddenKeywords: ["react", "typescript"],
      tailoredExperience: resume.experience.map((entry) => ({
        company: entry.company,
        title: entry.title,
        tailoredBullets: entry.bullets.slice(0, 2).map((bullet) => ({
          original: bullet,
          tailored: `${bullet} Tailored to the job requirements.`,
        })),
      })),
    };
  }

  const cleanedJob = {
    ...job,
    description: cleanJobDescription(job.description),
  };

  const client = getClient();
  const prompt = buildApplicationPrompt(resume, cleanedJob);

  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: prompt,
  });

  const rawOutput = response.output_text?.trim();

  if (!rawOutput) {
    throw new AppError(502, "AI response was empty");
  }

  const parsed = JSON.parse(extractJson(rawOutput));
  return applicationPackageSchema.parse(parsed);
}
