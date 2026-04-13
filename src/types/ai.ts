export interface TailoredResumeBullet {
  original?: string;
  tailored: string;
}

export interface TailoredExperienceEntry {
  company: string;
  title: string;
  tailoredBullets: TailoredResumeBullet[];
}

export interface GeneratedApplicationPackage {
  summary: string;
  coverLetter: string;
  hiddenKeywords: string[];
  tailoredExperience: TailoredExperienceEntry[];
}

export interface JobDescriptionInput {
  title?: string;
  company?: string;
  location?: string;
  description: string;
}
