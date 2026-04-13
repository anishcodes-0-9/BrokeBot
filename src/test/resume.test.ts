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
    "Frontend and full stack engineer with experience building user-facing applications and support systems.",
  skills: [
    {
      category: "Frontend",
      items: ["React", "TypeScript", "Tailwind CSS"],
    },
    {
      category: "Backend",
      items: ["Node.js", "Express", "SQLite"],
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
        "Built production-ready React interfaces for internal tooling.",
        "Improved application performance and reduced support overhead.",
      ],
    },
  ],
  projects: [
    {
      name: "BrokeBot",
      link: "https://github.com/anishkrishnan/brokebot",
      bullets: [
        "Built a local-first job automation tool with Node.js and React.",
        "Designed API endpoints and SQLite-backed persistence.",
      ],
      technologies: ["Node.js", "React", "SQLite", "Playwright"],
    },
  ],
  education: [
    {
      institution: "Example University",
      degree: "Bachelor of Technology",
      field: "Computer Science",
      startDate: "2019",
      endDate: "2023",
      grade: "8.4 CGPA",
    },
  ],
};

describe("resume routes", () => {
  it("returns 404 when no base resume exists", async () => {
    const response = await api.get("/api/resume");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Base resume not found");
    expect(typeof response.body.requestId).toBe("string");
  });

  it("saves the base resume", async () => {
    const response = await api.post("/api/resume").send(validResumePayload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({
      key: "baseResume",
    });
    expect(response.body.message).toBe("Base resume saved");
    expect(typeof response.body.requestId).toBe("string");
  });

  it("returns the saved base resume", async () => {
    await api.post("/api/resume").send(validResumePayload);

    const response = await api.get("/api/resume");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.basics.fullName).toBe("Anish Krishnan");
    expect(response.body.data.skills).toHaveLength(2);
    expect(response.body.data.experience).toHaveLength(1);
    expect(response.body.data.projects).toHaveLength(1);
    expect(response.body.data.education).toHaveLength(1);
  });

  it("returns resume metadata", async () => {
    await api.post("/api/resume").send(validResumePayload);

    const response = await api.get("/api/resume/meta");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.fullName).toBe("Anish Krishnan");
    expect(response.body.data.email).toBe("anish@example.com");
    expect(response.body.data.experienceCount).toBe(1);
    expect(response.body.data.projectCount).toBe(1);
    expect(response.body.data.educationCount).toBe(1);
    expect(response.body.data.skillGroupCount).toBe(2);
    expect(typeof response.body.data.updatedAt).toBe("string");
  });

  it("generates a resume pdf from the saved base resume", async () => {
    await api.post("/api/resume").send(validResumePayload);

    const response = await api.post("/api/resume/pdf").send({
      fileNamePrefix: "anish-resume",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Resume PDF generated");
    expect(response.body.data.fileName).toMatch(/^anish-resume-.*\.pdf$/);
    expect(response.body.data.relativePath).toContain(
      "data/generated/resumes/",
    );
    expect(fs.existsSync(response.body.data.absolutePath)).toBe(true);
  });

  it("returns 404 when generating a pdf without a stored resume", async () => {
    const response = await api.post("/api/resume/pdf").send({
      fileNamePrefix: "anish-resume",
    });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Base resume not found");
  });

  it("rejects invalid resume payloads", async () => {
    const response = await api.post("/api/resume").send({
      basics: {
        fullName: "",
        email: "not-an-email",
        phone: "",
        location: "",
      },
      summary: "",
      skills: [],
      experience: [],
      projects: [],
      education: [],
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Validation failed");
    expect(typeof response.body.requestId).toBe("string");
  });

  it("rejects invalid project URLs", async () => {
    const response = await api.post("/api/resume").send({
      ...validResumePayload,
      projects: [
        {
          name: "Broken Project",
          link: "not-a-url",
          bullets: ["Did something useful"],
        },
      ],
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Validation failed");
  });

  it("returns 501 for delete until implemented", async () => {
    const response = await api.delete("/api/resume");

    expect(response.status).toBe(501);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Resume deletion is not implemented yet");
  });
});
