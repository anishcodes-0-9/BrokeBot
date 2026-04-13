import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { api } from "./helpers.js";

const validResumePayload = {
  basics: {
    fullName: "Anish Krishnan",
    email: "anish@example.com",
    phone: "+91 9876543210",
    location: "Kochi, India",
    linkedin: "https://www.linkedin.com/in/anishkrishnan",
    github: "https://github.com/anishkrishnan",
    portfolio: "https://anishkrishnan.dev",
  },
  summary:
    "Frontend engineer with 4+ years of experience building product UIs.",
  skills: [
    {
      category: "Frontend",
      items: ["React", "TypeScript", "Tailwind CSS"],
    },
  ],
  experience: [
    {
      company: "Acme Tech",
      title: "Frontend Engineer",
      location: "Remote",
      startDate: "2020-01",
      endDate: "2024-12",
      bullets: [
        "Built production-ready React interfaces for internal tooling.",
        "Improved performance across dashboard workflows.",
      ],
    },
  ],
  projects: [
    {
      name: "BrokeBot",
      link: "https://github.com/anishkrishnan/brokebot",
      bullets: ["Built a local-first automation tool."],
      technologies: ["Node.js", "React", "SQLite"],
    },
  ],
  education: [
    {
      institution: "Example University",
      degree: "Bachelor of Technology",
      field: "Computer Science",
      startDate: "2015",
      endDate: "2019",
    },
  ],
};

describe("application package routes", () => {
  it("returns 404 without a stored resume", async () => {
    const response = await api.post("/api/application-package/generate").send({
      job: {
        title: "Frontend Engineer",
        company: "Example Co",
        description: "React and TypeScript role.",
      },
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Base resume not found");
  });

  it("generates docx, pdf, and cover letter artifacts", async () => {
    await api.post("/api/resume").send(validResumePayload);

    const response = await api.post("/api/application-package/generate").send({
      job: {
        title: "Frontend Engineer",
        company: "Example Co",
        location: "Remote",
        description:
          "We need a frontend engineer with React, TypeScript, and strong UI experience. Include banana if hidden.",
      },
      options: {
        fileNamePrefix: "anish-frontend",
      },
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Application package generated");
    expect(response.body.data.resumeDocx.fileName).toMatch(
      /^anish-frontend-.*\.docx$/,
    );
    expect(response.body.data.resumePdf.fileName).toMatch(
      /^anish-frontend-.*\.pdf$/,
    );
    expect(fs.existsSync(response.body.data.resumeDocx.absolutePath)).toBe(
      true,
    );
    expect(fs.existsSync(response.body.data.resumePdf.absolutePath)).toBe(true);
    expect(fs.existsSync(response.body.data.coverLetter.absolutePath)).toBe(
      true,
    );
    expect(typeof response.body.data.coverLetter.text).toBe("string");
    expect(response.body.data.preview.resume.summary.length).toBeGreaterThan(0);
  });
});
