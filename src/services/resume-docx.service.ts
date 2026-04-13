import fs from "node:fs";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { generateResumePdf } from "./resume-pdf.service.js";
import { buildGeneratedPaths, slugify } from "../utils/file.js";
import type { ResumeData } from "../types/resume.js";

function createHeading(title: string): Paragraph {
  return new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 100 },
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 80 },
  });
}

function line(text: string, bold = false): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold })],
    spacing: { after: 80 },
  });
}

function buildDoc(resume: ResumeData): Document {
  const contact = [
    resume.basics.email,
    resume.basics.phone,
    resume.basics.location,
    resume.basics.linkedin,
    resume.basics.github,
    resume.basics.portfolio || resume.basics.website,
  ]
    .filter(Boolean)
    .join(" | ");

  const children: Paragraph[] = [
    new Paragraph({
      text: resume.basics.fullName,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: contact,
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
    }),
    createHeading("Professional Summary"),
    line(resume.summary),
  ];

  if (resume.skills.length > 0) {
    children.push(createHeading("Skills"));
    for (const skill of resume.skills) {
      children.push(line(`${skill.category}: ${skill.items.join(", ")}`, true));
    }
  }

  if (resume.experience.length > 0) {
    children.push(createHeading("Experience"));
    for (const exp of resume.experience) {
      children.push(line(`${exp.title} | ${exp.company}`, true));
      children.push(
        line(`${exp.location ?? ""} | ${exp.startDate} - ${exp.endDate}`),
      );
      for (const bullet of exp.bullets) {
        children.push(bulletParagraph(bullet));
      }
    }
  }

  if (resume.projects.length > 0) {
    children.push(createHeading("Projects"));
    for (const project of resume.projects) {
      children.push(line(project.name, true));
      if (project.link) {
        children.push(line(project.link));
      }
      if (project.technologies?.length) {
        children.push(line(`Tech: ${project.technologies.join(", ")}`));
      }
      for (const bullet of project.bullets) {
        children.push(bulletParagraph(bullet));
      }
    }
  }

  if (resume.education.length > 0) {
    children.push(createHeading("Education"));
    for (const edu of resume.education) {
      children.push(
        line(
          `${edu.degree}${edu.field ? `, ${edu.field}` : ""} | ${edu.institution}`,
          true,
        ),
      );
      children.push(
        line(
          `${edu.startDate ?? ""}${edu.startDate || edu.endDate ? " - " : ""}${edu.endDate ?? ""}`,
        ),
      );
      if (edu.grade) {
        children.push(line(edu.grade));
      }
    }
  }

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}

export async function generateResumeDocxAndPdf(
  resume: ResumeData,
  fileNamePrefix?: string,
) {
  const prefix =
    fileNamePrefix?.trim() || slugify(resume.basics.fullName) || "resume";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const docxFileName = `${prefix}-${timestamp}.docx`;

  const { absolutePath, relativePath } = buildGeneratedPaths(
    "resumes",
    docxFileName,
  );
  const doc = buildDoc(resume);
  const buffer = await Packer.toBuffer(doc);

  fs.writeFileSync(absolutePath, buffer);

  const pdf = await generateResumePdf(resume, prefix);

  return {
    docx: {
      fileName: docxFileName,
      absolutePath,
      relativePath,
      generatedAt: new Date().toISOString(),
    },
    pdf,
  };
}
