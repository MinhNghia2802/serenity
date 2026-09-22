import { emotionSlugs, type EmotionSlug } from "@/types/domain";

export type EmotionScores = Record<EmotionSlug, number>;

const emptyScores = (): EmotionScores =>
  Object.fromEntries(emotionSlugs.map((emotion) => [emotion, 0])) as EmotionScores;

export function normalizeScores(scores: Partial<EmotionScores>): EmotionScores {
  const normalized = emptyScores();
  for (const emotion of emotionSlugs) normalized[emotion] = Math.max(0, scores[emotion] ?? 0);
  const total = Object.values(normalized).reduce((sum, value) => sum + value, 0);
  if (total === 0) return { ...normalized, calm: 1 };
  for (const emotion of emotionSlugs) normalized[emotion] /= total;
  return normalized;
}

export function moodSignal(stress: number, energy: number | null): EmotionScores {
  const scores = emptyScores();
  if (stress >= 4) scores.overwhelmed += 0.5;
  if (stress >= 3) scores.fear_anxiety += 0.35;
  if (energy !== null && energy <= 2) scores.sadness += 0.35;
  if (energy !== null && energy >= 4 && stress <= 2) scores.joy += 0.4;
  if (stress <= 2) scores.calm += 0.35;
  return normalizeScores(scores);
}

export function calculateFinalScores(input: {
  nlp: Partial<EmotionScores>;
  selected: EmotionSlug;
  stress: number;
  energy: number | null;
  history?: Partial<EmotionScores> | null;
}): EmotionScores {
  const nlp = normalizeScores(input.nlp);
  const mood = moodSignal(input.stress, input.energy);
  const history = input.history ? normalizeScores(input.history) : emptyScores();
  const nlpWeight = input.history ? 0.6 : 0.7;
  const final = emptyScores();

  for (const emotion of emotionSlugs) {
    final[emotion] =
      nlpWeight * nlp[emotion] +
      0.2 * (emotion === input.selected ? 1 : 0) +
      0.1 * mood[emotion] +
      (input.history ? 0.1 * history[emotion] : 0);
  }

  return normalizeScores(final);
}

export function topEmotion(scores: EmotionScores): EmotionSlug {
  return emotionSlugs.reduce((best, current) =>
    scores[current] > scores[best] ? current : best,
  );
}
