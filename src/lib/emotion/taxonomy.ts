import type { EmotionSlug } from "@/types/domain";

export const emotions: Array<{
  slug: EmotionSlug;
  label: string;
  hint: string;
  tone: string;
  negative: boolean;
}> = [
  { slug: "joy", label: "Vui vẻ", hint: "Nhẹ nhõm, tích cực", tone: "#F4C95D", negative: false },
  { slug: "trust", label: "Tin tưởng", hint: "An toàn, được kết nối", tone: "#8BC6A4", negative: false },
  { slug: "calm", label: "Bình an", hint: "Ổn định, thư thái", tone: "#8BB8C8", negative: false },
  { slug: "surprise", label: "Bất ngờ", hint: "Ngạc nhiên, chưa rõ", tone: "#B7A5D8", negative: false },
  { slug: "sadness", label: "Buồn", hint: "Nặng lòng, hụt hẫng", tone: "#8FA7C2", negative: true },
  { slug: "fear_anxiety", label: "Lo âu", hint: "Bất an, suy nghĩ nhiều", tone: "#B3A18B", negative: true },
  { slug: "anger", label: "Tức giận", hint: "Bức bối, khó chịu", tone: "#D98D78", negative: true },
  { slug: "disgust_discomfort", label: "Khó chịu", hint: "Không thoải mái, muốn tránh", tone: "#A4AD8A", negative: true },
  { slug: "overwhelmed", label: "Quá tải", hint: "Có quá nhiều điều cùng lúc", tone: "#9E92A8", negative: true },
];

export const emotionLabels = Object.fromEntries(
  emotions.map((emotion) => [emotion.slug, emotion.label]),
) as Record<EmotionSlug, string>;

export const negativeEmotionSlugs = new Set(
  emotions.filter((emotion) => emotion.negative).map((emotion) => emotion.slug),
);
