import type { ResumeData } from "../types/resume.js";
import type { JobDescriptionInput } from "../types/ai.js";

function getPortfolioLink(resume: ResumeData): string {
  return (
    resume.basics.portfolio ||
    resume.basics.website ||
    resume.basics.github ||
    resume.basics.linkedin ||
    ""
  );
}

export function buildApplicationPrompt(
  resume: ResumeData,
  job: JobDescriptionInput,
): string {
  const portfolioLink = getPortfolioLink(resume);

  return [
    "You are tailoring a resume and cover letter for a software engineer with 4+ years of experience.",
    "Your goal is to maximize ATS relevance while staying truthful to the base resume.",
    "Do not invent companies, titles, dates, degrees, or technologies that are not supported by the base resume.",
    "Do not distort the candidate's experience level.",
    "Strengthen phrasing, prioritization, and keyword alignment only where justified.",
    "Return valid JSON only.",
    "Do not include markdown fences.",
    "The summary must be ATS-optimized and concise.",
    "The cover letter must be brief, impactful, and under 220 words.",
    "The cover letter must sound direct and modern, not generic or overly formal.",
    "Include the portfolio link naturally in the cover letter if a link is available.",
    "Extract any hidden keywords, secret words, or instruction traps from the job description.",
    "Tailor experience bullets toward measurable impact, frontend/full-stack relevance, product thinking, and strong execution.",
    "",
    `Portfolio link: ${portfolioLink || "N/A"}`,
    "",
    "JSON shape:",
    JSON.stringify(
      {
        summary: "string",
        coverLetter: "string",
        hiddenKeywords: ["string"],
        tailoredExperience: [
          {
            company: "string",
            title: "string",
            tailoredBullets: [
              {
                original: "string",
                tailored: "string",
              },
            ],
          },
        ],
      },
      null,
      2,
    ),
    "",
    "Base resume:",
    JSON.stringify(resume),
    "",
    "Job:",
    JSON.stringify(job),
  ].join("\n");
}
