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

function getPortfolioLink(resume: ResumeData): string {
  return (
    resume.basics.portfolio ||
    resume.basics.website ||
    resume.basics.github ||
    resume.basics.linkedin ||
    ""
  );
}

function ensureBriefCoverLetter(text: string, portfolioLink: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  let result = words.slice(0, 220).join(" ").trim();

  if (portfolioLink && !result.includes(portfolioLink)) {
    result = `${result} Portfolio: ${portfolioLink}`.trim();
  }

  return result;
}

export async function generateApplicationPackage(
  resume: ResumeData,
  job: JobDescriptionInput,
): Promise<GeneratedApplicationPackage> {
  if (env.NODE_ENV === "test") {
    const portfolioLink = getPortfolioLink(resume);

    return {
      summary:
        "Frontend engineer with 4+ years of experience building performant, ATS-friendly React and TypeScript interfaces.",
      coverLetter: ensureBriefCoverLetter(
        `I’m applying for this role because it aligns well with my experience building user-facing React and TypeScript applications with strong execution and product focus. I’ve shipped production-ready interfaces, improved workflow performance, and collaborated closely to deliver practical outcomes. ${portfolioLink ? `You can view my work here: ${portfolioLink}` : ""}`,
        portfolioLink,
      ),
      hiddenKeywords: ["react", "typescript", "banana"],
      tailoredExperience: resume.experience.map((entry) => ({
        company: entry.company,
        title: entry.title,
        tailoredBullets: entry.bullets.slice(0, 3).map((bullet) => ({
          original: bullet,
          tailored: `${bullet} Aligned to ATS keywords, frontend impact, and measurable execution.`,
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
  const validated = applicationPackageSchema.parse(parsed);
  const portfolioLink = getPortfolioLink(resume);

  return {
    ...validated,
    summary: validated.summary.trim(),
    coverLetter: ensureBriefCoverLetter(validated.coverLetter, portfolioLink),
    hiddenKeywords: Array.from(
      new Set(
        validated.hiddenKeywords
          .map((keyword) => keyword.trim())
          .filter(Boolean),
      ),
    ),
  };
}
