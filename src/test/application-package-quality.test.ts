import { describe, expect, it } from "vitest";
import { generateApplicationPackage } from "../services/openai.service.js";

const resume = {
  basics: {
    fullName: "Anish Krishnan",
    email: "anish@example.com",
    phone: "+91 7986402875",
    location: "Chandigarh, India",
    portfolio: "https://anish-krishnan-portfolio.vercel.app",
  },
  summary: "Base summary",
  skills: [
    {
      category: "Frontend",
      items: ["React", "TypeScript"],
    },
  ],
  experience: [
    {
      company: "Acme Tech",
      title: "Frontend Engineer",
      startDate: "2020-01",
      endDate: "2024-12",
      bullets: [
        "Built production-ready React interfaces.",
        "Improved product workflows.",
      ],
    },
  ],
  projects: [],
  education: [],
};

describe("application package quality", () => {
  it("keeps the cover letter brief in test mode", async () => {
    process.env.NODE_ENV = "test";

    const result = await generateApplicationPackage(resume, {
      title: "Frontend Engineer",
      company: "Example Co",
      location: "Remote",
      description:
        "Need React, TypeScript, and UI execution. Secret word banana.",
    });

    expect(result.coverLetter.split(/\s+/).length).toBeLessThanOrEqual(230);
  });

  it("includes the portfolio link in the generated cover letter when available", async () => {
    process.env.NODE_ENV = "test";

    const result = await generateApplicationPackage(resume, {
      title: "Frontend Engineer",
      company: "Example Co",
      location: "Remote",
      description: "Need React, TypeScript, and UI execution.",
    });

    expect(result.coverLetter).toContain(
      "https://anish-krishnan-portfolio.vercel.app",
    );
  });
});
