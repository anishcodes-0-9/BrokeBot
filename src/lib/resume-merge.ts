import type { GeneratedApplicationPackage } from "../types/ai.js";
import type { ResumeData } from "../types/resume.js";

function limitBullets(bullets: string[], max = 4): string[] {
  return bullets.slice(0, max);
}

export function mergeResumeWithAiOutput(
  baseResume: ResumeData,
  generated: GeneratedApplicationPackage,
): ResumeData {
  const tailoredMap = new Map(
    generated.tailoredExperience.map((entry) => [
      `${entry.company}::${entry.title}`,
      entry,
    ]),
  );

  return {
    ...baseResume,
    summary: generated.summary,
    experience: baseResume.experience.map((entry) => {
      const key = `${entry.company}::${entry.title}`;
      const tailored = tailoredMap.get(key);

      if (!tailored || tailored.tailoredBullets.length === 0) {
        return {
          ...entry,
          bullets: limitBullets(entry.bullets),
        };
      }

      return {
        ...entry,
        bullets: limitBullets(
          tailored.tailoredBullets.map((bullet) => bullet.tailored),
        ),
      };
    }),
  };
}
