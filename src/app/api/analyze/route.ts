import { NextResponse } from "next/server";
import { analyzeWithGemini } from "@/lib/ai/gemini";
import { getDemoRecommendations } from "@/lib/content/demo";
import { calculateFinalScores, topEmotion } from "@/lib/emotion/scoring";
import { highestSafetyLevel, screenSafety } from "@/lib/safety/screen";
import { analyzeRequestSchema } from "@/lib/validations/checkin";
import { encryptText } from "@/lib/security/encryption";
import { createServerSupabaseClient, isServerSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const input = analyzeRequestSchema.parse(await request.json());
    let authenticatedUserId: string | null = null;
    let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>> | null = null;
    if (isServerSupabaseConfigured()) {
      supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      authenticatedUserId = user?.id ?? null;
      if (!authenticatedUserId && process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
        return NextResponse.json({ error: "Bạn cần đăng nhập để thực hiện check-in." }, { status: 401 });
      }
    }
    const preSafety = screenSafety(`${input.artDescription} ${input.additionalSharing}`);
    const ai = await analyzeWithGemini(input);
    const safetyLevel = highestSafetyLevel(preSafety, ai.safetyLevel);
    const finalScores = calculateFinalScores({
      nlp: ai.nlpEmotionScores,
      selected: input.primaryEmotion,
      stress: input.stressScore,
      energy: input.energyScore,
    });
    const finalEmotion = topEmotion(finalScores);
    const checkInId = crypto.randomUUID();

    if (supabase && authenticatedUserId) {
      const status = safetyLevel === "normal" ? "completed" : "safety";
      const { error: checkInError } = await supabase.from("check_ins").insert({
        id: checkInId,
        user_id: authenticatedUserId,
        idempotency_key: input.idempotencyKey,
        status,
        primary_emotion: input.primaryEmotion,
        energy_score: input.energyScore,
        stress_score: input.stressScore,
        cause_category: input.causeCategory,
        artwork_id: input.artworkId,
        artwork_set_version: 1,
        question_set_version: 1,
        answers: { artworkUrl: input.artworkUrl },
      });
      if (checkInError) throw new Error(`Không thể lưu check-in: ${checkInError.message}`);

      const { error: textError } = await supabase.from("checkin_texts").insert({
        check_in_id: checkInId,
        user_id: authenticatedUserId,
        art_description_encrypted: encryptText(input.artDescription),
        additional_sharing_encrypted: input.additionalSharing ? encryptText(input.additionalSharing) : null,
      });
      if (textError) throw new Error(`Không thể lưu nội dung mã hóa: ${textError.message}`);

      const { error: analysisError } = await supabase.from("emotion_analyses").insert({
        check_in_id: checkInId,
        user_id: authenticatedUserId,
        nlp_emotion_scores: ai.nlpEmotionScores,
        final_emotion_scores: finalScores,
        final_emotion: finalEmotion,
        intensity: ai.intensity,
        reason_short: ai.reasonShort,
        action_suggestion: ai.actionSuggestion,
        content_tags: ai.contentTags,
        safety_level: safetyLevel,
      });
      if (analysisError) throw new Error(`Không thể lưu kết quả: ${analysisError.message}`);
    }

    if (safetyLevel !== "normal") {
      return NextResponse.json({
        checkInId,
        status: "safety",
        finalEmotion,
        intensity: ai.intensity,
        reasonShort: "Điều bạn chia sẻ cho thấy bạn có thể đang trải qua một thời điểm rất nặng nề.",
        actionSuggestion: "Hãy liên hệ ngay một người bạn tin cậy hoặc dịch vụ hỗ trợ khẩn cấp tại nơi bạn sống.",
        disclaimer: "Serenity không phải dịch vụ khẩn cấp hoặc công cụ chẩn đoán.",
        safetyLevel,
        recommendations: [],
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      checkInId,
      status: "completed",
      finalEmotion,
      intensity: ai.intensity,
      reasonShort: ai.reasonShort,
      actionSuggestion: ai.actionSuggestion,
      disclaimer: "Đây là gợi ý tham khảo, không phải chẩn đoán.",
      safetyLevel,
      recommendations: getDemoRecommendations(),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể phân tích lúc này";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
