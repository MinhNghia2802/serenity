import type { EmotionSlug, Recommendation } from "@/types/domain";

export const demoArtworks = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
    alt: "Mặt hồ yên tĩnh phản chiếu bầu trời và những hàng cây ở xa",
    tags: ["calm", "fear_anxiety", "overwhelmed"] as EmotionSlug[],
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=85",
    alt: "Con đường nhỏ dẫn qua thung lũng rộng dưới ánh sáng dịu",
    tags: ["sadness", "trust", "surprise"] as EmotionSlug[],
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    url: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1400&q=85",
    alt: "Một góc phòng sáng tự nhiên với cây xanh cạnh cửa sổ",
    tags: ["joy", "anger", "disgust_discomfort"] as EmotionSlug[],
  },
];

export function selectDemoArtwork(emotion: EmotionSlug) {
  return demoArtworks.find((artwork) => artwork.tags.includes(emotion)) ?? demoArtworks[0];
}

const genericRecommendations: Recommendation[] = [
  {
    id: "music-calm",
    type: "music",
    title: "Một khoảng lặng dịu dàng",
    provider: "YouTube Music",
    url: "https://music.youtube.com/search?q=calm+instrumental",
    description: "Nhạc không lời tiết tấu chậm để bạn có một khoảng nghỉ.",
  },
  {
    id: "podcast-mindful",
    type: "podcast",
    title: "Tìm lại nhịp thở",
    provider: "Spotify",
    url: "https://open.spotify.com/search/mindfulness%20vietnamese",
    description: "Tìm một tập podcast ngắn về chánh niệm và chăm sóc bản thân.",
  },
  {
    id: "exercise-54321",
    type: "exercise",
    title: "Grounding 5–4–3–2–1",
    provider: "Serenity",
    url: "#grounding",
    description: "Gọi tên 5 điều bạn thấy, 4 điều bạn chạm, 3 điều bạn nghe, 2 điều bạn ngửi và 1 điều bạn nếm.",
  },
];

export function getDemoRecommendations(): Recommendation[] {
  return genericRecommendations;
}
