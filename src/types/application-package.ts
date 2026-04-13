import type { ResumeData } from "./resume.js";

export interface TailoredResumeResult {
  resume: ResumeData;
  aiSummary: string;
  coverLetter: string;
  hiddenKeywords: string[];
}

export interface GeneratedApplicationArtifacts {
  resumeDocx: {
    fileName: string;
    absolutePath: string;
    relativePath: string;
    generatedAt: string;
  };
  resumePdf: {
    fileName: string;
    absolutePath: string;
    relativePath: string;
    generatedAt: string;
  };
  coverLetter: {
    text: string;
    fileName: string;
    absolutePath: string;
    relativePath: string;
    generatedAt: string;
  };
  preview: {
    summary: string;
    hiddenKeywords: string[];
    resume: ResumeData;
  };
}
