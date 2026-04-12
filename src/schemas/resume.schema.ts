import { z } from "zod";

const nonEmptyTrimmedString = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, {
    message: "Field cannot be empty",
  });

const optionalUrlString = z.string().trim().url().optional().or(z.literal(""));

const basicsSchema = z.object({
  fullName: nonEmptyTrimmedString,
  email: z.string().trim().email(),
  phone: nonEmptyTrimmedString,
  location: nonEmptyTrimmedString,
  linkedin: optionalUrlString.optional(),
  github: optionalUrlString.optional(),
  portfolio: optionalUrlString.optional(),
  website: optionalUrlString.optional(),
});

const experienceSchema = z.object({
  company: nonEmptyTrimmedString,
  title: nonEmptyTrimmedString,
  location: z.string().trim().optional(),
  startDate: nonEmptyTrimmedString,
  endDate: nonEmptyTrimmedString,
  current: z.boolean().optional(),
  bullets: z.array(nonEmptyTrimmedString).min(1).max(10),
});

const projectSchema = z.object({
  name: nonEmptyTrimmedString,
  link: optionalUrlString.optional(),
  bullets: z.array(nonEmptyTrimmedString).min(1).max(10),
  technologies: z.array(nonEmptyTrimmedString).max(20).optional(),
});

const educationSchema = z.object({
  institution: nonEmptyTrimmedString,
  degree: nonEmptyTrimmedString,
  field: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  grade: z.string().trim().optional(),
});

const skillGroupSchema = z.object({
  category: nonEmptyTrimmedString,
  items: z.array(nonEmptyTrimmedString).min(1).max(50),
});

export const resumeSchema = z.object({
  basics: basicsSchema,
  summary: nonEmptyTrimmedString,
  skills: z.array(skillGroupSchema).max(20),
  experience: z.array(experienceSchema).max(20),
  projects: z.array(projectSchema).max(20),
  education: z.array(educationSchema).max(10),
});

export type ResumeInput = z.infer<typeof resumeSchema>;
