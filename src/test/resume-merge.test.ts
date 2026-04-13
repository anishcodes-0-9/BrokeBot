import { describe, expect, it } from "vitest";
import { mergeResumeWithAiOutput } from "../lib/resume-merge.js";

const baseResume = {
  basics: {
    fullName: "Anish Krishnan",
    email: "anish@example.com",
    phone: "+91 9876543210",
    location: "Kochi, India",
  },
  summary: "Base summary",
  skills: [
    {
      category: "Frontend",
      items: ["React", "TypeScript", "React"],
    },
  ],
  experience: [
    {
      company: "Acme Tech",
      title: "Frontend Engineer",
      startDate: "2023-01",
      endDate: "2024-12",
      bullets: ["Original bullet 1", "Original bullet 2", "Original bullet 3"],
    },
  ],
  projects: [],
  education: [],
};

describe("resume merge", () => {
  it("replaces summary and merges matched experience bullets", () => {
    const merged = mergeResumeWithAiOutput(baseResume, {
      summary: "Tailored summary",
      coverLetter: "Short letter",
      hiddenKeywords: ["react"],
      tailoredExperience: [
        {
          company: "Acme Tech",
          title: "Frontend Engineer",
          tailoredBullets: [
            { original: "Original bullet 1", tailored: "Tailored bullet 1" },
            { original: "Original bullet 2", tailored: "Tailored bullet 2" },
          ],
        },
      ],
    });

    expect(merged.summary).toBe("Tailored summary");
    expect(merged.experience[0].bullets).toEqual([
      "Tailored bullet 1",
      "Tailored bullet 2",
      "Original bullet 3",
    ]);
  });

  it("deduplicates skill items", () => {
    const merged = mergeResumeWithAiOutput(baseResume, {
      summary: "Tailored summary",
      coverLetter: "Short letter",
      hiddenKeywords: ["react"],
      tailoredExperience: [],
    });

    expect(merged.skills[0].items).toEqual(["React", "TypeScript"]);
  });
});
