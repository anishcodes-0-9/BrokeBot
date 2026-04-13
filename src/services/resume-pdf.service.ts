import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { renderResumeHtml } from "../lib/resume-html.js";
import type { ResumeData } from "../types/resume.js";

export interface GeneratedResumePdf {
  fileName: string;
  absolutePath: string;
  relativePath: string;
  generatedAt: string;
  htmlLength: number;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function buildOutputPaths(fileName: string) {
  const outputDir = path.resolve(process.cwd(), "data", "generated", "resumes");
  fs.mkdirSync(outputDir, { recursive: true });

  const absolutePath = path.join(outputDir, fileName);
  const relativePath = path.relative(process.cwd(), absolutePath);

  return {
    outputDir,
    absolutePath,
    relativePath,
  };
}

function writeTestPdfPlaceholder(filePath: string): void {
  const placeholderPdf = `%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Count 1 /Kids [3 0 R] >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] >>
endobj
trailer
<< /Root 1 0 R >>
%%EOF`;

  fs.writeFileSync(filePath, placeholderPdf, "utf8");
}

export async function generateResumePdf(
  resume: ResumeData,
  fileNamePrefix?: string,
): Promise<GeneratedResumePdf> {
  const prefix =
    fileNamePrefix?.trim() || slugify(resume.basics.fullName) || "resume";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${prefix}-${timestamp}.pdf`;

  const { absolutePath, relativePath } = buildOutputPaths(fileName);
  const html = renderResumeHtml(resume);

  if (process.env.NODE_ENV === "test") {
    writeTestPdfPlaceholder(absolutePath);

    return {
      fileName,
      absolutePath,
      relativePath,
      generatedAt: new Date().toISOString(),
      htmlLength: html.length,
    };
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.pdf({
      path: absolutePath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
    });
  } finally {
    await browser.close();
  }

  return {
    fileName,
    absolutePath,
    relativePath,
    generatedAt: new Date().toISOString(),
    htmlLength: html.length,
  };
}
