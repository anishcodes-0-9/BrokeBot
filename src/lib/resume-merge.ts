import type { GeneratedApplicationPackage } from "../types/ai.js";
import type { ResumeData } from "../types/resume.js";

function dedupeBullets(bullets: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const bullet of bullets) {
    const normalized = bullet.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(bullet.trim());
  }

  return result;
}

function limitBullets(bullets: string[], max = 5): string[] {
  return dedupeBullets(bullets).slice(0, max);
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

  const mergedExperience = baseResume.experience.map((entry) => {
    const key = `${entry.company}::${entry.title}`;
    const tailored = tailoredMap.get(key);

    if (!tailored || tailored.tailoredBullets.length === 0) {
      return {
        ...entry,
        bullets: limitBullets(entry.bullets),
      };
    }

    const tailoredBullets = tailored.tailoredBullets
      .map((bullet) => bullet.tailored)
      .filter(Boolean);

    const fallbackBullets = entry.bullets.filter(
      (bullet) =>
        !tailored.tailoredBullets.some(
          (tailoredBullet) => tailoredBullet.original?.trim() === bullet.trim(),
        ),
    );

    return {
      ...entry,
      bullets: limitBullets([...tailoredBullets, ...fallbackBullets]),
    };
  });

  const strengthenedSkills = baseResume.skills.map((group) => ({
    ...group,
    items: dedupeBullets(group.items),
  }));

  return {
    ...baseResume,
    summary: generated.summary.trim(),
    skills: strengthenedSkills,
    experience: mergedExperience,
  };
}
