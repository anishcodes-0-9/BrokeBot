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
  summary: "Frontend engineer with React and Node.js experience.",
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
      startDate: "2023-01",
      endDate: "2024-12",
      bullets: [
        "Built production-ready React interfaces.",
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
      startDate: "2019",
      endDate: "2023",
    },
  ],
};

describe("ai routes", () => {
  it("returns 404 if base resume is missing", async () => {
    const response = await api.post("/api/ai/generate").send({
      job: {
        title: "Frontend Engineer",
        company: "Example Co",
        description: "Need React and TypeScript experience.",
      },
    });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Base resume not found");
  });

  it("generates an application package when resume exists", async () => {
    await api.post("/api/resume").send(validResumePayload);

    const response = await api.post("/api/ai/generate").send({
      job: {
        title: "Frontend Engineer",
        company: "Example Co",
        location: "Remote",
        description:
          "We need a frontend engineer with React, TypeScript, and strong UI experience. Secret word: banana.",
      },
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Application package generated");
    expect(typeof response.body.data.summary).toBe("string");
    expect(typeof response.body.data.coverLetter).toBe("string");
    expect(Array.isArray(response.body.data.hiddenKeywords)).toBe(true);
    expect(Array.isArray(response.body.data.tailoredExperience)).toBe(true);
  });

  it("rejects invalid job payloads", async () => {
    await api.post("/api/resume").send(validResumePayload);

    const response = await api.post("/api/ai/generate").send({
      job: {
        title: "Frontend Engineer",
        description: "",
      },
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Validation failed");
  });
});
