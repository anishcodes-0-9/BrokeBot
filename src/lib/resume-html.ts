import type { ResumeData } from "../types/resume.js";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderLinks(resume: ResumeData): string {
  const entries = [
    resume.basics.linkedin
      ? `<a href="${escapeHtml(resume.basics.linkedin)}">LinkedIn</a>`
      : "",
    resume.basics.github
      ? `<a href="${escapeHtml(resume.basics.github)}">GitHub</a>`
      : "",
    resume.basics.portfolio
      ? `<a href="${escapeHtml(resume.basics.portfolio)}">Portfolio</a>`
      : "",
    resume.basics.website
      ? `<a href="${escapeHtml(resume.basics.website)}">Website</a>`
      : "",
  ].filter(Boolean);

  return entries.join(' <span class="dot">•</span> ');
}

function renderSkillGroups(resume: ResumeData): string {
  return resume.skills
    .map(
      (group) => `
        <div class="skill-group">
          <span class="label">${escapeHtml(group.category)}:</span>
          <span>${group.items.map(escapeHtml).join(", ")}</span>
        </div>
      `,
    )
    .join("");
}

function renderExperience(resume: ResumeData): string {
  return resume.experience
    .map(
      (item) => `
        <section class="entry">
          <div class="entry-header">
            <div>
              <h3>${escapeHtml(item.title)}</h3>
              <p class="subhead">${escapeHtml(item.company)}${item.location ? `, ${escapeHtml(item.location)}` : ""}</p>
            </div>
            <p class="date-range">${escapeHtml(item.startDate)} - ${escapeHtml(item.endDate)}</p>
          </div>
          <ul>
            ${item.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
          </ul>
        </section>
      `,
    )
    .join("");
}

function renderProjects(resume: ResumeData): string {
  return resume.projects
    .map(
      (project) => `
        <section class="entry">
          <div class="entry-header">
            <div>
              <h3>${escapeHtml(project.name)}</h3>
              ${
                project.link
                  ? `<p class="subhead"><a href="${escapeHtml(project.link)}">${escapeHtml(project.link)}</a></p>`
                  : ""
              }
            </div>
          </div>
          <ul>
            ${project.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
          </ul>
          ${
            project.technologies?.length
              ? `<p class="tech-stack"><span class="label">Tech:</span> ${project.technologies.map(escapeHtml).join(", ")}</p>`
              : ""
          }
        </section>
      `,
    )
    .join("");
}

function renderEducation(resume: ResumeData): string {
  return resume.education
    .map(
      (item) => `
        <section class="entry">
          <div class="entry-header">
            <div>
              <h3>${escapeHtml(item.degree)}${item.field ? `, ${escapeHtml(item.field)}` : ""}</h3>
              <p class="subhead">${escapeHtml(item.institution)}</p>
            </div>
            <p class="date-range">${escapeHtml(item.startDate ?? "")}${item.startDate || item.endDate ? " - " : ""}${escapeHtml(item.endDate ?? "")}</p>
          </div>
          ${item.grade ? `<p class="meta-line">${escapeHtml(item.grade)}</p>` : ""}
        </section>
      `,
    )
    .join("");
}

export function renderResumeHtml(resume: ResumeData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(resume.basics.fullName)} Resume</title>
  <style>
    :root {
      color-scheme: light;
      --text: #10233d;
      --muted: #526276;
      --line: #d4dce6;
      --accent: #0f5f8c;
      --bg: #ffffff;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #f3f6f9;
      font-family: "Aptos", "Segoe UI", Arial, sans-serif;
      color: var(--text);
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: var(--bg);
      padding: 18mm 16mm;
    }

    header {
      border-bottom: 2px solid var(--accent);
      padding-bottom: 10px;
      margin-bottom: 14px;
    }

    h1 {
      margin: 0 0 6px;
      font-size: 28px;
      line-height: 1.1;
      letter-spacing: 0.2px;
    }

    h2 {
      margin: 18px 0 8px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1.1px;
      color: var(--accent);
    }

    h3 {
      margin: 0;
      font-size: 15px;
      line-height: 1.2;
    }

    p {
      margin: 0;
      line-height: 1.45;
      font-size: 12px;
    }

    ul {
      margin: 6px 0 0 18px;
      padding: 0;
    }

    li {
      margin: 0 0 4px;
      font-size: 12px;
      line-height: 1.45;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .contact-line,
    .links-line {
      font-size: 12px;
      color: var(--muted);
    }

    .dot {
      margin: 0 6px;
      color: var(--muted);
    }

    .summary {
      font-size: 12px;
      color: var(--text);
    }

    .entry {
      margin-bottom: 10px;
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
    }

    .subhead,
    .date-range,
    .meta-line,
    .tech-stack {
      color: var(--muted);
      font-size: 11.5px;
    }

    .skill-group {
      margin-bottom: 4px;
      font-size: 12px;
      line-height: 1.45;
    }

    .label {
      font-weight: 700;
      color: var(--text);
    }

    @page {
      size: A4;
      margin: 12mm;
    }
  </style>
</head>
<body>
  <main class="page">
    <header>
      <h1>${escapeHtml(resume.basics.fullName)}</h1>
      <p class="contact-line">
        ${escapeHtml(resume.basics.email)}
        <span class="dot">•</span>
        ${escapeHtml(resume.basics.phone)}
        <span class="dot">•</span>
        ${escapeHtml(resume.basics.location)}
      </p>
      ${renderLinks(resume) ? `<p class="links-line">${renderLinks(resume)}</p>` : ""}
    </header>

    <section>
      <h2>Professional Summary</h2>
      <p class="summary">${escapeHtml(resume.summary)}</p>
    </section>

    <section>
      <h2>Skills</h2>
      ${renderSkillGroups(resume)}
    </section>

    <section>
      <h2>Experience</h2>
      ${renderExperience(resume)}
    </section>

    <section>
      <h2>Projects</h2>
      ${renderProjects(resume)}
    </section>

    <section>
      <h2>Education</h2>
      ${renderEducation(resume)}
    </section>
  </main>
</body>
</html>
  `.trim();
}
