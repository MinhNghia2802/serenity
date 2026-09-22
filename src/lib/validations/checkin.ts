import { z } from "zod";
import { emotionSlugs } from "@/types/domain";

export const analyzeRequestSchema = z.object({
  idempotencyKey: z.string().uuid(),
  primaryEmotion: z.enum(emotionSlugs),
  energyScore: z.number().int().min(1).max(5).nullable(),
  stressScore: z.number().int().min(1).max(5),
  causeCategory: z.string().max(60).nullable(),
  artworkId: z.string().min(1).max(100),
  artworkUrl: z.string().url().max(2000),
  artDescription: z.string().trim().min(1).max(5000),
  additionalSharing: z.string().trim().max(5000),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
