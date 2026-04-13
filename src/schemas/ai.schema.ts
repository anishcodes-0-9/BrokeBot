import { z } from "zod";

const requiredTrimmedString = z.string().trim().min(1, "Field cannot be empty");

export const jobDescriptionSchema = z.object({
  title: z.string().trim().max(200).optional(),
  company: z.string().trim().max(200).optional(),
  location: z.string().trim().max(200).optional(),
  description: requiredTrimmedString,
});

export const applicationPackageSchema = z.object({
  summary: requiredTrimmedString,
  coverLetter: z.string().trim().min(1, "Field cannot be empty").max(1200),
  hiddenKeywords: z.array(requiredTrimmedString).max(20),
  tailoredExperience: z
    .array(
      z.object({
        company: requiredTrimmedString,
        title: requiredTrimmedString,
        tailoredBullets: z
          .array(
            z.object({
              original: z.string().trim().optional(),
              tailored: requiredTrimmedString,
            }),
          )
          .max(10),
      }),
    )
    .max(20),
});

export const generateApplicationRequestSchema = z.object({
  job: jobDescriptionSchema,
});

export type GenerateApplicationRequest = z.infer<
  typeof generateApplicationRequestSchema
>;
export type ApplicationPackage = z.infer<typeof applicationPackageSchema>;
