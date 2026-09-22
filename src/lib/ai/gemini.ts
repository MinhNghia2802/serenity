import { emotionSlugs } from "@/types/domain";
import type { AnalyzeRequest } from "@/lib/validations/checkin";
import { geminiAnalysisSchema, type GeminiAnalysis } from "./schema";

const responseSchema = {
  type: "object",
  properties: {
    nlpEmotionScores: {
      type: "object",
      properties: Object.fromEntries(emotionSlugs.map((key) => [key, { type: "number" }])),
      required: [...emotionSlugs],
    },
    intensity: { type: "integer", minimum: 1, maximum: 5 },
    reasonShort: { type: "string" },
    actionSuggestion: { type: "string" },
    contentTags: { type: "array", items: { type: "string" } },
    safetyLevel: { type: "string", enum: ["normal", "elevated", "urgent"] },
  },
  required: ["nlpEmotionScores", "intensity", "reasonShort", "actionSuggestion", "contentTags", "safetyLevel"],
};

export async function analyzeWithGemini(input: AnalyzeRequest): Promise<GeminiAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return localTextAnalysis(input);

  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const prompt = `Bạn là bộ phân tích cảm xúc tiếng Việt cho ứng dụng wellbeing, không phải bác sĩ.
Không chẩn đoán bệnh lý. Dùng ngôn ngữ không chắc chắn, đồng cảm, không phán xét.
Mô tả tranh và chia sẻ tự do là tín hiệu chính. Câu chọn nhanh chỉ là ngữ cảnh kiểm tra chéo.

Dữ liệu:
- Cảm xúc tự chọn: ${input.primaryEmotion}
- Năng lượng: ${input.energyScore ?? "không trả lời"}/5
- Căng thẳng: ${input.stressScore}/5
- Nguyên nhân: ${input.causeCategory ?? "không trả lời"}
- Mô tả tranh: ${input.artDescription}
- Chia sẻ thêm: ${input.additionalSharing || "không có"}

Trả JSON đúng schema. Các emotion scores phải nằm trong 0..1 và tổng xấp xỉ 1.
reasonShort và actionSuggestion tối đa 280 ký tự. Hành động chỉ kéo dài 1–3 phút.
Nếu có dấu hiệu tự làm hại/nguy cơ tức thời, safetyLevel phải là elevated hoặc urgent.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.25,
        },
      }),
      signal: AbortSignal.timeout(20000),
    },
  );

  if (!response.ok) throw new Error(`Gemini request failed (${response.status})`);
  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned an empty response");
  return geminiAnalysisSchema.parse(JSON.parse(text));
}

function localTextAnalysis(input: AnalyzeRequest): GeminiAnalysis {
  const text = `${input.artDescription} ${input.additionalSharing}`.toLowerCase();
  const scores = Object.fromEntries(emotionSlugs.map((emotion) => [emotion, 0.02])) as Record<(typeof emotionSlugs)[number], number>;
  const patterns: Array<[(typeof emotionSlugs)[number], RegExp]> = [
    ["joy", /vui|hạnh phúc|ánh sáng|hy vọng|tươi sáng|nhẹ nhõm/],
    ["calm", /yên|bình an|thư giãn|êm|tĩnh|nhẹ nhàng/],
    ["trust", /tin tưởng|an toàn|gần gũi|kết nối|ấm áp/],
    ["sadness", /buồn|cô đơn|trống rỗng|mất mát|u tối|mưa/],
    ["fear_anxiety", /lo|sợ|bất an|suy nghĩ nhiều|không chắc|áp lực/],
    ["anger", /giận|tức|bực|ức chế|bức bối/],
    ["disgust_discomfort", /khó chịu|ghét|muốn tránh|ngột ngạt/],
    ["overwhelmed", /quá tải|kiệt sức|mệt|dồn ép|quá nhiều|không chịu nổi/],
    ["surprise", /bất ngờ|ngạc nhiên|lạ|không ngờ/],
  ];
  for (const [emotion, pattern] of patterns) if (pattern.test(text)) scores[emotion] += 0.8;
  if (Math.max(...Object.values(scores)) <= 0.02) scores[input.primaryEmotion] += 0.55;
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  for (const key of emotionSlugs) scores[key] /= total;

  return {
    nlpEmotionScores: scores,
    intensity: Math.max(1, Math.min(5, input.stressScore)),
    reasonShort: "Dựa trên cách bạn mô tả bức tranh, có vẻ cảm xúc hiện tại đang cần được bạn dành thêm một chút chú ý.",
    actionSuggestion: "Hãy đặt hai chân xuống sàn, thở chậm ba nhịp và gọi tên một điều bạn cần nhất ngay lúc này.",
    contentTags: ["calm", "grounding", "gentle"],
    safetyLevel: "normal",
  };
}
