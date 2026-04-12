export interface ResumeBasics {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
}

export interface ResumeExperience {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  bullets: string[];
}

export interface ResumeProject {
  name: string;
  link?: string;
  bullets: string[];
  technologies?: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
}

export interface ResumeSkillGroup {
  category: string;
  items: string[];
}

export interface ResumeData {
  basics: ResumeBasics;
  summary: string;
  skills: ResumeSkillGroup[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
}
