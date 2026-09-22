import type { SafetyLevel } from "@/types/domain";

const urgentPatterns = [
  /tự sát/i,
  /muốn chết/i,
  /không muốn sống/i,
  /tự làm hại/i,
  /kết thúc cuộc đời/i,
  /suicide/i,
  /kill myself/i,
];

const elevatedPatterns = [/vô vọng/i, /không chịu nổi/i, /bế tắc/i, /tuyệt vọng/i];

export function screenSafety(text: string): SafetyLevel {
  if (urgentPatterns.some((pattern) => pattern.test(text))) return "urgent";
  if (elevatedPatterns.some((pattern) => pattern.test(text))) return "elevated";
  return "normal";
}

export function highestSafetyLevel(a: SafetyLevel, b: SafetyLevel): SafetyLevel {
  const rank: Record<SafetyLevel, number> = { normal: 0, elevated: 1, urgent: 2 };
  return rank[a] >= rank[b] ? a : b;
}
