import { describe, expect, it } from "vitest";
import { renderResumeHtml } from "../lib/resume-html.js";

const resume = {
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
    "Frontend and full stack engineer with experience building user-facing applications.",
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
      bullets: ["Built production-ready React interfaces."],
    },
  ],
  projects: [
    {
      name: "BrokeBot",
      link: "https://github.com/anishkrishnan/brokebot",
      bullets: ["Built a local-first job automation tool."],
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

describe("resume html renderer", () => {
  it("renders the basics and section headings", () => {
    const html = renderResumeHtml(resume);

    expect(html).toContain("Anish Krishnan");
    expect(html).toContain("Professional Summary");
    expect(html).toContain("Skills");
    expect(html).toContain("Experience");
    expect(html).toContain("Projects");
    expect(html).toContain("Education");
  });

  it("escapes html-sensitive content", () => {
    const html = renderResumeHtml({
      ...resume,
      summary: "Built <strong>safe</strong> systems & shipped fast.",
    });

    expect(html).toContain("&lt;strong&gt;safe&lt;/strong&gt;");
    expect(html).toContain("&amp;");
  });
});
