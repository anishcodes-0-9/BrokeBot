import fs from "node:fs";
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph } from "docx";
import { buildGeneratedPaths, slugify } from "../utils/file.js";

export async function generateCoverLetterDocx(
  coverLetter: string,
  fullName: string,
  fileNamePrefix?: string,
) {
  const prefix = fileNamePrefix?.trim() || slugify(fullName) || "cover-letter";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${prefix}-${timestamp}.docx`;

  const { absolutePath, relativePath } = buildGeneratedPaths(
    "cover-letters",
    fileName,
  );

  const paragraphs = coverLetter.split("\n").map(
    (line) =>
      new Paragraph({
        text: line,
        spacing: { after: 160 },
      }),
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: fullName,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.LEFT,
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(absolutePath, buffer);

  return {
    fileName,
    absolutePath,
    relativePath,
    generatedAt: new Date().toISOString(),
  };
}
