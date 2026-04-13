import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_PATH: z.string().min(1).default("./data/brokebot.db"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  OPENAI_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
