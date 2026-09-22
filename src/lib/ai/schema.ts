import { z } from "zod";
import { emotionSlugs } from "@/types/domain";

const emotionScoreShape = Object.fromEntries(
  emotionSlugs.map((emotion) => [emotion, z.number().min(0).max(1)]),
) as Record<(typeof emotionSlugs)[number], z.ZodNumber>;

export const geminiAnalysisSchema = z.object({
  nlpEmotionScores: z.object(emotionScoreShape),
  intensity: z.number().int().min(1).max(5),
  reasonShort: z.string().min(1).max(280),
  actionSuggestion: z.string().min(1).max(280),
  contentTags: z.array(z.string().max(50)).max(8),
  safetyLevel: z.enum(["normal", "elevated", "urgent"]),
});

export type GeminiAnalysis = z.infer<typeof geminiAnalysisSchema>;
