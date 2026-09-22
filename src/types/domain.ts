export const emotionSlugs = [
  "joy",
  "trust",
  "calm",
  "surprise",
  "sadness",
  "fear_anxiety",
  "anger",
  "disgust_discomfort",
  "overwhelmed",
] as const;

export type EmotionSlug = (typeof emotionSlugs)[number];
export type SafetyLevel = "normal" | "elevated" | "urgent";

export type CheckInDraft = {
  primaryEmotion: EmotionSlug | null;
  energyScore: number | null;
  stressScore: number | null;
  causeCategory: string | null;
  artworkId: string;
  artworkUrl: string;
  artDescription: string;
  additionalSharing: string;
};

export type Recommendation = {
  id: string;
  type: "music" | "podcast" | "exercise";
  title: string;
  provider: string;
  url: string;
  description: string;
};

export type AnalysisResult = {
  checkInId: string;
  status: "completed" | "safety";
  finalEmotion: EmotionSlug;
  intensity: number;
  reasonShort: string;
  actionSuggestion: string;
  disclaimer: string;
  safetyLevel: SafetyLevel;
  recommendations: Recommendation[];
  createdAt: string;
};
