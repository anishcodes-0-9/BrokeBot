import fs from "node:fs";
import path from "node:path";

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function buildGeneratedPaths(subdir: string, fileName: string) {
  const outputDir = path.resolve(process.cwd(), "data", "generated", subdir);
  ensureDir(outputDir);

  const absolutePath = path.join(outputDir, fileName);
  const relativePath = path.relative(process.cwd(), absolutePath);

  return {
    absolutePath,
    relativePath,
  };
}
