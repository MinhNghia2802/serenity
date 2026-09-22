insert into public.artwork_sets (id, name, description, status, version, published_at)
values ('00000000-0000-4000-8000-000000000001', 'Bộ tranh gợi mở mặc định', 'Bộ tranh thiên nhiên và không gian nhẹ nhàng cho MVP.', 'published', 1, now())
on conflict (id) do nothing;

insert into public.artworks (id, artwork_set_id, image_url, alt_text, emotion_tags, license, sort_order)
values
('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85','Mặt hồ yên tĩnh phản chiếu bầu trời và những hàng cây ở xa',array['calm','fear_anxiety','overwhelmed'],'Unsplash License',1),
('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000001','https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=85','Con đường nhỏ dẫn qua thung lũng rộng dưới ánh sáng dịu',array['sadness','trust','surprise'],'Unsplash License',2),
('10000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000001','https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1400&q=85','Một góc phòng sáng tự nhiên với cây xanh cạnh cửa sổ',array['joy','anger','disgust_discomfort'],'Unsplash License',3)
on conflict (id) do nothing;

insert into public.question_sets (id, name, description, status, version, published_at)
values ('20000000-0000-4000-8000-000000000001','Check-in mặc định','Năm bước check-in MVP.', 'published', 1, now())
on conflict (id) do nothing;

insert into public.questions (question_set_id, question_key, prompt, input_type, options, is_required, display_condition, sort_order)
values
('20000000-0000-4000-8000-000000000001','primary_emotion','Ngay lúc này, cảm xúc nào nổi bật nhất ở bạn?','single_select','["joy","trust","calm","surprise","sadness","fear_anxiety","anger","disgust_discomfort","overwhelmed"]',true,null,1),
('20000000-0000-4000-8000-000000000001','energy_score','Mức năng lượng của bạn hiện tại như thế nào?','scale','{"min":1,"max":5}',false,null,2),
('20000000-0000-4000-8000-000000000001','stress_score','Bạn đang thấy căng thẳng ở mức nào?','scale','{"min":1,"max":5}',true,null,3),
('20000000-0000-4000-8000-000000000001','cause_category','Điều gì đang ảnh hưởng nhiều nhất?','single_select','["work","study","family","relationship","finance","health","other","prefer_not_to_say"]',false,'{"stress_score":{"gte":3}}',4),
('20000000-0000-4000-8000-000000000001','art_description','Bức tranh này gợi cho bạn điều gì?','textarea','[]',true,null,5),
('20000000-0000-4000-8000-000000000001','additional_sharing','Điều gì đang khiến bạn suy nghĩ nhiều nhất lúc này?','textarea','[]',false,null,6)
on conflict (question_set_id, question_key) do nothing;

insert into public.content_items (id, type, title, description, provider, external_url, emotion_tags)
values
('30000000-0000-4000-8000-000000000001','music','Một khoảng lặng dịu dàng','Nhạc không lời tiết tấu chậm.','YouTube Music','https://music.youtube.com/search?q=calm+instrumental',array['calm','fear_anxiety','overwhelmed']),
('30000000-0000-4000-8000-000000000002','podcast','Tìm lại nhịp thở','Podcast ngắn về chánh niệm.','Spotify','https://open.spotify.com/search/mindfulness%20vietnamese',array['calm','sadness','fear_anxiety']),
('30000000-0000-4000-8000-000000000003','exercise','Grounding 5–4–3–2–1','Bài thực hành quay về hiện tại.','Serenity','#grounding',array['calm','fear_anxiety','anger','overwhelmed'])
on conflict (id) do nothing;

-- Promote the first admin manually after that user has signed in:
-- update public.profiles set role = 'admin' where id = '<AUTH_USER_UUID>';
