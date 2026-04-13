import { z } from "zod";

const trimmed = z.string().trim().min(1);

export const applicationPackageRequestSchema = z.object({
  job: z.object({
    title: z.string().trim().max(200).optional(),
    company: z.string().trim().max(200).optional(),
    location: z.string().trim().max(200).optional(),
    description: trimmed,
  }),
  options: z
    .object({
      fileNamePrefix: z
        .string()
        .trim()
        .min(1)
        .max(80)
        .regex(/^[a-zA-Z0-9-_]+$/)
        .optional(),
    })
    .optional(),
});

export type ApplicationPackageRequest = z.infer<
  typeof applicationPackageRequestSchema
>;
